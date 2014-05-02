"use strict";
// Basic server to serve static assets from /public folder

var Config = {		// communication dump

	Bosh: {
		host:			'localhost'
,		port:			'9090'
	}

,	App: {
		host:			'localhost'
,		port:			'9677'
,		ssl_port:		'19677'
,		css_version:	'1'
,		session_secret:	'f7cd7374c2851fb727582bf'
	}
};

/**
 * load node.js modules
 */
var util = require('util'),
	crypto = require('crypto'),
	express = require('express'),
	partials = require('express-partials'),
	jquery = require('jquery'),
	xmpp_bosh = require('node-xmpp-client'),
	ltx = require("ltx"),
	io = require('socket.io'),
	fs = require('fs'),
	logger = require('./libs/logger'),
	http = require('http'),
	https = require('https'),

	Primus = require('primus'),

	bosh_connections = {},
	messages_archive = {},
	resource_id = 'default';

// exports libs from module
exports.util = util;
exports.crypto = crypto;
exports.xmpp_bosh = xmpp_bosh;
exports.ltx = ltx;
exports.io = io;
exports.fs = fs;
exports.bosh_connections = bosh_connections;
exports.messages_archive = messages_archive;
exports.logger = logger;
exports.resource_id = resource_id;

/**
 * setup vars of libs
 */
io.debug_mode = false;

var app = express();
exports.app = app;

logger.Config.enable_print = true;
logger.Config.enable_logfile = true;

/**
 * removes bosh connections
 */
function boshConnectionRemove(id){
	if (typeof bosh_connections[id] !== 'undefined'){
		logger.log(id, 'bosh object removed', 2);
		bosh_connections[id] = null;
		delete bosh_connections[id];
	}
}
/**
 * main function - manages bosh connections
 */
function BoshConnector(opts){
	var self = this;
	// bosh connection object params
	self.opts = opts;
	logger.log(self.opts.myjid, 'bosh.connect: '+ Config.Bosh.host, 2);
	self.sess_attr = {
		jid: self.opts.myjid+'/'+resource_id,
		password: self.opts.mypassword,
		host: Config.Bosh.host,
		disallowTLS: true,
		preferred: 'PLAIN'
	};

	self.connection = new xmpp_bosh.Client(self.sess_attr);
	self.unavailable = 0;
	self.socket = {};
	self.presences = {};
	self.presences[self.opts.myjid] = self.opts.myjid;
	self.last_diconnected = 0;

	// error in bosh client
	self.connection.on('error', function(exception) {
		logger.log(self.opts.myjid, "Error: " + exception, 1);
		if (exception === "XMPP authentication failure"){
			self.connection.end();
			if (!self.opts.resource._headerSent){
				self.opts.resource.render('blank', {
					layout: self.opts.layout
				});
			}
		}
		if(typeof exception.name === 'string' && exception.name === 'stream:error'){
			if(typeof exception.children === 'object' && typeof exception.children[0].name === 'string' && exception.children[0].name === 'system-shutdown'){
				self.connection.end();
			}
			if(typeof exception.children === 'object' && typeof exception.children[0].name === 'string' && exception.children[0].name === 'conflict'){
				logger.log(self.opts.myjid, "Conflict again", 2);
			}
		}
	});

	// offline action, when connections come to offline status
	self.connection.on('offline', function(reason) {
		logger.log(self.opts.myjid, 'bosh.offline reason: ' + reason, 2);
		try {
			if ( typeof self.socket !== 'undefined' && getSize( self.socket) > 0 ){
				for (var socket_id in self.socket) {
					self.socket[socket_id].write( JSON.stringify({'event': 'disconnect', 'data': {} }) );
				}
			}
		}
		catch (err)
		{
			logger.log(self.opts.myjid, "EXCEPTION: " + logger.dumpException(err));
		}
		boshConnectionRemove(self.opts.myjid);
		if (!self.opts.resource._headerSent){
			self.opts.resource.render('blank', {
				layout: self.opts.layout
			});
		}
	});

	// bosh connection get stanza (message) from xmpp
	self.connection.on('stanza', function(ltxe) {
		logger.log(self.opts.myjid, 'bosh.stanza run', 4);
		try
		{
			var _log_type = '';
			var _allow_send = true;
			if(ltxe.toString().indexOf("Problem accessing /http-bind/. Reason:") !== -1){
				self.connection.end();
				return;
			}
			else if(typeof ltxe.name === "string" && ltxe.name === 'message'){ // store messages
				// save archived message
				archiveHandler.add(self.opts.myjid, ltxe.toString());
				_allow_send = (self.unavailable === 1)?false:true;
			}
			else if(typeof ltxe.name === "string" && ltxe.name === 'presence' && ltxe.attrs.from){// save last user presence
				// (kind of cache)
				_log_type = ltxe.attrs.type;
				if (ltxe.attrs.type === 'unavailable' || ltxe.attrs.type === 'unsubscribe' || ltxe.attrs.type === 'unsubscribed' ){
					if (typeof self.presences[ltxe.attrs.from] !== 'undefined'){
						delete self.presences[stanzasHelper.getBareJidFromJid(ltxe.attrs.from)];
					}
				}
				else {
					self.presences[stanzasHelper.getBareJidFromJid(ltxe.attrs.from)] = ltxe.attrs.from;
				}
			}

			if (_allow_send) {
				logger.log(self.opts.myjid, "bosh.stanza.socket.emit.stanza for each (" + getSize(self.socket) + ") socket ("+ltxe.name +(_log_type?" type="+_log_type:"") + " from " + ((typeof ltxe.name === "string" )?ltxe.attrs.from:"?") +")", 2);
				logger.log('', ltxe.toString(), 4);
				for (var sock_id in self.socket) {
					self.socket[sock_id].write( JSON.stringify({'event': 'stanza', 'data': ltxe.toString() }) );
				}
			}
			return true;
		}
		catch (err)
		{
			logger.log(self.opts.myjid, "EXCEPTION: " + logger.dumpException(err));
		}
	});

	// bosh connection connected
	self.connection.on('online', function() {
		logger.log(self.opts.myjid, 'bosh.online', 2);
		try
		{
			logger.log(self.opts.myjid, 'bosh.online.send', 2);
			logger.log('', stanzasHelper.$pres(), 4);
			self.unmarkToDisconnect();
			if (self.connection){
				self.connection.send(stanzasHelper.$pres());
				var sesdata = {
					jid: self.opts.myjid,
					url: self.opts.url_scheme + Config.App.host + ':' + (self.opts.url_scheme === 'https://'?Config.App.ssl_port:Config.App.port),
					css: '/css/chat.css?v=' + Config.App.css_version,
					i18n: self.opts.i18n
				};
				self.opts.resource.render(self.opts.page_name, {
					layout: self.opts.layout,
					locals: sesdata
				});
			}
			else {
				self.connection.end();
				self.opts.resource.render('blank', {
					layout: self.opts.layout
				});
			}
		}
		catch (err)
		{
			boshConnectionRemove(self.opts.myjid);
			logger.log(self.opts.myjid, "EXCEPTION: " + logger.dumpException(err));

			if (!self.opts.resource._headerSent){
				self.opts.resource.render('blank', {
					layout: self.opts.layout
				});
			}
		}
	});
	//set bosh connection "to remove" when last socket disconnected (will be removed after 15min)
	self.markToDisconnect = function(){
		if (self.last_diconnected === 0){
			self.last_diconnected = new Date().getTime();
		}
	};
	//set bosh connection "not to remove"
	self.unmarkToDisconnect = function(){
		self.last_diconnected = 0;
	};
	//checks if bosh connection is marked to remove. if so removes connection (disconnect)

	self.disconnector = function(){
		try {
			if (self.last_diconnected > 0){
				var diff = (new Date().getTime() - self.last_diconnected)/1000;
				logger.log('GC1', self.opts.myjid + ' diff: ' + diff, 2);
				if (diff > 15){
					logger.log('GC1', self.opts.myjid + ' remove connection', 2);
					self.unmarkToDisconnect();
					clearInterval(self.diconnectorInterval);
					self.connection.end();
				}
			}
			else {
				var active_sockets = 0;
				if ( getSize( self.socket) > 0 ){
					active_sockets++;
				}
				if (active_sockets === 0) {
					logger.log('GC2', self.opts.myjid + ' add mark as discon ', 2);
					self.markToDisconnect();
				}
			}
		}
		catch (err)
		{
			logger.log(self.opts.myjid, "GC EXCEPTION: " + logger.dumpException(err));
		}
	};

	//run disconnector every 10 sec
	self.diconnectorInterval = setInterval(self.disconnector, 10*1000);
}
exports.BoshConnector = BoshConnector;

/**
 * check size of associative array
 */
var getSize = function (obj) {
	var size = 0;
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};
exports.getSize = getSize;

/**
 * arvhived messages class helper/handler
 */
var ArchivedMessagesHandler = function() {
	/**
	 * add archived message method
	 */
	this.add = function(owner, message) {
		if (typeof messages_archive[owner] === 'undefined'){
			messages_archive[owner] = [];
		}
		messages_archive[owner].push(JSON.stringify({date: new Date().getTime(), data: message}));
	};
	/**
	 * get archived messages for owner from username conversation
	 */
	this.getArchiveByUser = function(owner, username, socket) {
		if (typeof messages_archive[owner] === 'undefined') { return false; }
		try {
			var by_user_results = [];
			if (messages_archive[owner] && messages_archive[owner].length > 0){
				messages_archive[owner].forEach(function(row){
					var message = JSON.parse(row);
					if (message && message.data)
					{
						var mdata = ltx.parse(message.data);
						if (mdata.attrs.to && mdata.attrs.from)
						{
							if (mdata.attrs.to.indexOf(username) !== -1 || mdata.attrs.from.indexOf(username) !== -1)
							{
								by_user_results.push(row);
							}
						}
					}
				});
			}
			if (by_user_results.length  > 0){ socket.write(JSON.stringify({'event': 'getarchivebyuserresponse', 'data': {'to': username,'messages': by_user_results }}) ); }
		}
		catch (err)
		{
			logger.log(owner, "EXCEPTION: " + logger.dumpException(err));
		}
	};

	/**
	 * get all user archived messages
	 */
	this.getArchiveAll = function(owner, socket) {
		if (typeof messages_archive[owner] === 'undefined') { return false; }
		try {
			var results = messages_archive[owner];
			messages_archive[owner] = [];
			if (results && results.length > 0){
				var curr_time = new Date().getTime();
				results.forEach(function(row){
					var message = JSON.parse(row);
					var diff = (curr_time - message.date)/1000;
					if (diff <= 60*30){
						messages_archive[owner].push(row);
					}
				});
				socket.write( JSON.stringify({'event': 'archiveall', 'data': results }) );
			}
		}
		catch (err)
		{
			logger.log(owner, "EXCEPTION: " + logger.dumpException(err));
		}
	};
};
var archiveHandler = new ArchivedMessagesHandler();

/**
 * check connections to remove, if flaged remove/disconnect
 */
var appSocketHandle = {

	contextSocket: null,

	// user left chat, send information to another user from conversation
	leftchat: function(socket, data) {
		logger.log(data.to, 'app.leftchat', 2);
		if (data.from && data.to) {
			if (bosh_connections[data.to] && bosh_connections[data.to].socket){
				for (var sock_id in bosh_connections[data.to].socket){
					if (bosh_connections[data.to].socket[sock_id]) {
						logger.log('', "bosh.socket.emit.clientleftchat: " + data.from + " > " + data.to , 2);
						logger.log('', data.from, 4);

						bosh_connections[data.to].socket[sock_id].write( JSON.stringify({'event': 'clientleftchat', 'data': data.from }) );
					}
				}
			}
		}
	},

	// user entered chat, opened chat tab
	enteredchat: function(socket, data) {
		logger.log(data.to, 'app.enteredchat', 2);
		if (data.from && data.to) {
			if (bosh_connections[data.to] && bosh_connections[data.to].socket){
				for (var sock_id in bosh_connections[data.to].socket){
					if (bosh_connections[data.to].socket[sock_id]) {
						logger.log('', "bosh.socket.emit.cliententeredchat: " + data.from + " > " + data.to , 2);
						logger.log('', data.from, 4);

						bosh_connections[data.to].socket[sock_id].write( JSON.stringify({'event': 'cliententeredchat', 'data': data.from }) );
					}
				}
			}
		}
	},

	// user entered chat, opened chat tab
	invitationclosed: function(socket, data) {
		logger.log(data.to, 'app.invitationclosed', 2);
		if (data.from && data.to) {
			if (bosh_connections[data.from] && bosh_connections[data.from].socket){
				for (var sock_id in bosh_connections[data.from].socket){
					if (bosh_connections[data.from].socket[sock_id]) {
						logger.log('', "bosh.socket.emit.client_invitationclosed: " + data.from + " > " + data.from, 2);

						bosh_connections[data.from].socket[sock_id].write( JSON.stringify({'event': 'client_invitationclosed', 'data': data.to }) );
					}
				}
			}
		}
	},

	// user close chat tab, close this tab in all browser tabs
	removetab: function(socket, data) {
		logger.log(data.to, 'app.removetab', 2);
		if (data.from && data.to) {
			if (bosh_connections[data.from] && bosh_connections[data.from].socket){
				for (var sock_id in bosh_connections[data.from].socket){
					if (bosh_connections[data.from].socket[sock_id]) {
						logger.log('', "bosh.socket.emit.removetab: " + data.from + " > " + data.to , 2);

						bosh_connections[data.from].socket[sock_id].write( JSON.stringify({'event': 'removetab', 'data': data.to }) );
					}
				}
			}
		}
	},

	// client app sends stanza, that will be emited by bosh connection to
	// xmpp server
	stanzafromclient: function(socket, data){
		logger.log(data.user, 'app.stanzafromclient', 2);
		logger.log(data.user, data.stanza, 4);
		if (bosh_connections[data.user]){
			try
			{
				logger.log(data.user, 'app.stanzafromclient.bosh.send ('+ltx.parse(data.stanza).name+ ' to ' + ltx.parse(data.stanza).attrs.to + ')', 2);
				logger.log('', ltx.parse(data.stanza), 4);
				bosh_connections[data.user].connection.send(ltx.parse(data.stanza));
				if(ltx.parse(data.stanza).name === 'message'){
					// save archived message
					archiveHandler.add(data.user, data.stanza);
					if (bosh_connections[data.user].socket){
						for (var sock_id in bosh_connections[data.user].socket){
							if (bosh_connections[data.user].socket[sock_id].id !== socket.id){
								logger.log((ltx.parse(data.stanza).attrs.from)?ltx.parse(data.stanza).attrs.from:"", 'app.stanzafromclient.bosh.socket.emit.ownstanza '+ ' to ' + data.user, 2);
								logger.log('', data.stanza, 4);

								bosh_connections[data.user].socket[sock_id].write( JSON.stringify({'event': 'ownstanza', 'data': data.stanza }) );
							}
						}
					}
				}
				else if(ltx.parse(data.stanza).name === 'presence'){
					if (ltx.parse(data.stanza).attrs.from === data.user && ltx.parse(data.stanza).attrs.type === 'unavailable'){
						bosh_connections[data.user].unavailable = 1;
						if (bosh_connections[data.user] && bosh_connections[data.user].socket){
							for (var sock_id in bosh_connections[data.user].socket){
								if (bosh_connections[data.user].socket[sock_id] && bosh_connections[data.user].socket[sock_id].id !== socket.id) {
									logger.log('', "bosh.socket.emit.disconnect: " + data.user + " > socket #" + sock_id , 2);
									bosh_connections[data.user].socket[sock_id].write( JSON.stringify({'event': 'disconnect', 'data': {} }) );
								}
							}
						}
					}
					else if (ltx.parse(data.stanza).attrs.from === data.user){
						bosh_connections[data.user].unavailable = 0;
						bosh_connections[data.user].presences[stanzasHelper.getBareJidFromJid(ltx.parse(data.stanza).attrs.from)] = ltx.parse(data.stanza).attrs.from;
					}
				}
			}
			catch (err)
			{
				logger.log(data.user, "EXCEPTION: " + logger.dumpException(err));
			}
		} else {
			logger.log(data.user, 'app.stanzafromclient: bosh_connections[data.user] not exists!', 2);
			socket.write(JSON.stringify({'event': 'fixconnection', 'data': data.user }));
		}
	},

	// from client: send archive (by user) request
	getarchivebyuser: function(socket, data) {
		if (data.jid && data.username){
			try
			{
				logger.log(data.username, 'app.getarchivebyuser', 2);
				archiveHandler.getArchiveByUser(data.username, data.jid, socket);
			}
			catch (err)
			{
				logger.log(data.username, "EXCEPTION: " + logger.dumpException(err));
			}
		}
	},

	// from client: send all archive messages request
	getarchiveall: function(socket, data) {
		if (data.jid){
			try
			{
				logger.log(data.jid, 'app.getarchiveall', 2);
				if (bosh_connections[data.jid] && bosh_connections[data.jid].unavailable !== 1) {
					archiveHandler.getArchiveAll(data.jid, socket);
				}
			}
			catch (err)
			{
				logger.log(data.username, "EXCEPTION: " + logger.dumpException(err));
			}
		}
	},

	// new socket.io connection, try to pair with existing bosh session
	adduser: function(socket, username) {
		logger.log(username, 'app.adduser', 4);
		if (!bosh_connections[username]){
			logger.log(username, 'app.adduser.socket.emit fixconnection', 2);
			socket.write(JSON.stringify({'event': 'fixconnection', 'data': username }));
		}
		else {
			if (bosh_connections[username]){
				try
				{
					while (!bosh_connections[username].connection.send || !bosh_connections[username].socket || !bosh_connections[username].sess_attr){
						logger.log(username, "waiting for connection");
					}

					if (bosh_connections[username].unavailable !== 1) {
						logger.log(username, 'app.adduser.bosh.send', 2);
						logger.log('', stanzasHelper.$iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'}), 4);
						bosh_connections[username].connection.send(stanzasHelper.$iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'}));
					}
					bosh_connections[username].socket[socket.id] = socket;
					bosh_connections[username].unmarkToDisconnect();
					socket.username = username;
				}
				catch (err)
				{
					logger.log(username, "EXCEPTION: " + logger.dumpException(err));
				}
			}
		}
	},

	// disconnect action
	disconnect: function(socket) {
		logger.log(socket.username, 'app.socket.disconnect', 2);
		if (bosh_connections[socket.username]) {
			delete bosh_connections[socket.username].socket[socket.id];
			if (getSize(bosh_connections[socket.username].socket) === 0) {
				bosh_connections[socket.username].markToDisconnect();
			}
		}
		return this.disconnect;
	},

	// return online users (based on server internal array/cache)
	getonlineusers: function(data) {
		if (typeof bosh_connections[data.username] === 'object' && bosh_connections[data.username].presences) {
			var response = {};
			response.presences = bosh_connections[data.username].presences;
			response.user = data.user;
			for (var sock_id in bosh_connections[data.username].socket){
				if (bosh_connections[data.username].socket[sock_id]) {
					bosh_connections[data.username].socket[sock_id].write( JSON.stringify({'event': 'getonlineusers', 'data': response }) );
				}
			}
		}
	},

	// forward info that user is typing
	gettyping: function(data) {
		logger.log(data.from, 'app.socket.gettyping', 4);
		if (bosh_connections[data.to]) {
			if (getSize(bosh_connections[data.to].socket) > 0) {
				for (var sock_id in bosh_connections[data.to].socket){
					if (bosh_connections[data.to].socket[sock_id]) {
						bosh_connections[data.to].socket[sock_id].write( JSON.stringify({'event': 'sendtyping', 'data': {'from': data.from }}));
					}
				}
			}
		}
		return this.disconnect;
	}
};
exports.appSocketHandle = appSocketHandle;


/**
 * Run server
 *
 * Method runs all needed elements: - express object to handle server
 * request - socket.io for ember's communication - bosh connector to xmpp -
 */
exports.run = function() {
	logger.log(process.pid, 'app.run', 2);

	app.configure(function() {
		app.use(partials());
		app.use(express.json());
		app.use(express.urlencoded());
		app.use(require('connect-multiparty')());
		app.use(express.cookieParser());
		app.use(express.session({secret: Config.App.session_secret}));

		app.use('/js', express.static(__dirname + '/js'));
		app.use('/css', express.static(__dirname + '/css'));
		app.use('/build', express.static(__dirname + '/build'));
		app.use('/media', express.static(__dirname + '/media'));
		app.use('/images', express.static(__dirname + '/images'));
	});

	//app.setHeader({'Content-Type': 'text/html; charset=utf-8'});
	app.set('view engine', 'ejs');
	app.configure("development", function () {
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	var server = http.createServer( app ).listen(Config.App.port); // XMPP
	var serv_io = new Primus(server, { transformer: 'sockjs', timeout: 12000});

	var options = {
		//key: fs.readFileSync('key path'),
		//cert: fs.readFileSync('crt path'),
		//ca: fs.readFileSync('ca path')
	};
	var server_ssl, serv_io_ssl = null;
	var servers = [serv_io];
	try {
		server_ssl = https.createServer(options, app ).listen(Config.App.ssl_port); // XMPP ssl
		serv_io_ssl = new Primus(server_ssl, { transformer: 'sockjs', timeout: 12000});
		servers.push(server_ssl);
	}
	catch(err)
	{
		logger.log('SSL server exception:', logger.dumpException(err));
	}
	/**
	 * Below code is used to generate compiled version of primus client
	 * Uncomment this code only when tranformer was changed
	 * Additionally new build for client chat app is needed
	 */
	//[serv_io, serv_io_ssl].forEach(function(serv){
	servers.forEach(function(serv){
		// primus received a new connection.
		serv.on('connection', function (socket) {
			logger.log('', 'app.sockets.connection', 2);

			socket.on('data', function (data) {
				logger.log('PRIMUS DATA', data, 4);

				try {
					var request = JSON.parse(data);
					switch (request.event) {
						// new socket.io connection, try to pair with existing bosh session
						case 'adduser':
							appSocketHandle.adduser(socket, request.data.username);
							break;

						// new socket.io connection, try to pair with existing bosh session
						case 'leftchat':
							appSocketHandle.leftchat(socket, request.data);
							break;

						// user entered back chat, send information to another user from conversation
						case 'enteredchat':
							appSocketHandle.enteredchat(socket, request.data);
							break;

						case 'invitationclosed':
							appSocketHandle.invitationclosed(socket, request.data);
							break;

						case 'removetab':
							appSocketHandle.removetab(socket, request.data);
							break;

						// client app sends stanza, that will be emited by bosh connection
						case 'stanzafromclient':
							appSocketHandle.stanzafromclient(socket, request.data);
							break;

						// return online users (based on server internal array/cache)
						case 'getonlineusers':
							appSocketHandle.getonlineusers(request.data);
							break;

						// return online users (based on server internal array/cache)
						case 'getarchivebyuser':
							appSocketHandle.getarchivebyuser(socket, request.data);
							break;

						// return online users (based on server internal
						// array/cache)
						case 'getarchiveall':
							appSocketHandle.getarchiveall(socket, request.data);
							break;

						case 'typing':
							appSocketHandle.gettyping(request.data);
							break;

						default:
							logger.log('', 'Unknown socket\'s event ' + socket, 2);
							break;
					}
				}
				catch (err)
				{
					logger.log('SOCKET DATA EXCEPTION: ' + data, logger.dumpException(err));
				}
			});
		});

		// a connection closed.
		serv.on('disconnection', function (socket) {
			logger.log('PRIMUS DISCONNECT', socket.username + ' <' + socket.id + '>', 4);
			appSocketHandle.disconnect(socket);
		});

		// log messages
		serv.on('log', function (socket, msg) {
			logger.log('PRIMUS LOG', socket + ' ' + msg, 4);
		});
	});

	console.log("Server running at http://" + Config.App.host + ":" + Config.App.port + "/ in " + app.set("env") + " mode.");
	if(typeof server_ssl !== 'undefined')
	{
		console.log("Server running at https://" + Config.App.host + ":" + Config.App.ssl_port + "/ in " + app.set("env") + " mode.");
	}
};

/**
 * helper for quick stanzas create
 */
var stanzasHelper = {
	//generic packet building helper function
	$build: function(xname, attrib){
		return new ltx.element(xname, attrib);
	},
	$msg: function(attrib){
		return new ltx.Element("message", attrib);
	},
	$iq: function(attrib){
		return new ltx.Element("iq", attrib);
	},
	$pres: function(attrib){
		return new ltx.Element("presence", attrib);
	},
	getBareJidFromJid: function (jid)
	{
		return jid ? jid.split("/")[0] : null;
	}
};

/**
 * main request, returns chat client instance
 */
app.get('/get_chat', function (req, res) {
	var url_scheme = "http://";
	if (req.connection && req.connection.encrypted) { url_scheme = "https://"; }

	logger.log('', 'app.get: /get_chat run', 2);

	// set new session params (user login&pass)
	if ( typeof req.session === 'undefined' || (!req.session.user && req.query.name && req.query.password)) {
		req.session = {
			user: {
				name: req.query.name,
				password: (req.query.md5)?crypto.createHash('md5').update(req.query.password).digest('hex'):req.query.password
			}
		};
	}

	// display blank page if no user creditentials
	if (!req.session.user) {
		res.render('blank', {
			layout: false
		});
	} else {
		// create bosh connectin (or return old if already exists)
		var myjid = req.session.user.name+"@"+Config.Bosh.host;
		var mypassword = req.session.user.password;

		try {
			//pass change case
			if (bosh_connections[myjid] && bosh_connections[myjid].sess_attr.password !== mypassword){
				bosh_connections[myjid].connection.end();
				res.render('chatonly', { layout: false,
					locals: {
						jid: myjid,
						url: url_scheme+Config.App.host+':'+(url_scheme === 'https://'?Config.App.ssl_port:Config.App.port),
						css: (req.query.main_user)?'/css/chat_detach.css?v=' + Config.App.css_version :'/css/chat.css?v='  + Config.App.css_version,
						i18n: (req.query.i18n ? req.query.i18n : "en")
					}
				});
				return;
			}
			//existing connection case
			if (bosh_connections[myjid] && bosh_connections[myjid].sess_attr.password === mypassword){
				if (bosh_connections[myjid].unavailable !== 1 && bosh_connections[myjid].connection.state === 5){
					logger.log(myjid, 'app.get.bosh.send', 2);
					logger.log('', stanzasHelper.$pres(), 4);
					bosh_connections[myjid].connection.send(stanzasHelper.$pres());
				}
				res.render('chatonly', { layout: false,
					locals: {
						jid: myjid,
						url: url_scheme+Config.App.host+':'+(url_scheme === 'https://'?Config.App.ssl_port:Config.App.port),
						css: (req.query.main_user)?'/css/chat_detach.css?v='  + Config.App.css_version :'/css/chat.css?v='  + Config.App.css_version,
						i18n: (req.query.i18n ? req.query.i18n : "en")
					}
				});
			}
			else {// create new bosh connection
				bosh_connections[myjid] = new BoshConnector({
					myjid: myjid,
					mypassword: mypassword,
					resource: res,
					page_name: 'chatonly',
					layout: false,
					i18n: (req.query.i18n ? req.query.i18n : "en"),
					url_scheme: url_scheme
				});
			}
		}
		catch (err)
		{
			logger.log(myjid, "ACTION EXCEPTION: " + logger.dumpException(err));
			res.render('blank', {
				layout: false
			});
		}
	}
});

/**
 * request url, that will return online users (from xmpp server plugin)
 */
app.get('/getonlineusers', function (req, res) {
	logger.log('', 'app.get: /getonlineusers', 2);
	try {
		var request = require('request');
		request.get('http://'+Config.Bosh.host+':'+Config.Bosh.port+'/plugins/onlineusers/list', function (error, response, body) {
			if (!error && response.statusCode === 200) {
				res.send(body);
			}
		});
	}
	catch (err) {
		logger.log('getonline error', "EXCEPTION: " + logger.dumpException(err));
	}
});

exports.run();