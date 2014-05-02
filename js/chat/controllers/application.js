Chat.Controllers.Application = Ember.Object.extend({
	roster_limit: 50,
	debug: false,
	redis_presence: {},
	archived_messages_loaded: false,
	archived_messages_do_not_load: false,
	jids: {},
	non_readed_messages_count: 0,
	config: {},
	confirmation_div: {},
	lefftsent: [],
	typingNotifications: {},

	user: false,

	/* controller methods */
	/**
	 * set up basic params
	 **/

	connect: function (options) {
		options = options || {};
		this.config = options;

		try {
			 if (this.config.jid === undefined) return false;

			 this.debug = options.debug || this.debug;
			 this.user = Chat.Models.User.create({
				jid: this.config.jid,
				show: 'unavailable',
				show2: translate('application.presence.off')
			 });
			 return true;
		} catch (err) {
//			 console.error(err);
			 return false;
		}
	},
	/**
	 * retrieves messages from socket.io and recognizes type of message and runs action
	 **/
	getFromSocket: function(msg){
		type = $( msg )[0].nodeName.toLowerCase();
		if (type == 'iq' || type == 'client:iq'){
			items = this.handleRosterStanza($(msg));
			this._onRosterChange(items);//$(msg).find('query').attr('xmlns') == "jabber:iq:roster"
			this.user.set('show', 'available');
			this.user.set('show2', translate('application.presence.on'));
			$('.chat-button .chat-close span').html('');
		}
		else if (type == 'presence' || type == 'client:presence'){
			pres = this.onPresenceChangePrepare($(msg));
			this._onPresenceChange(pres);
		}
		else if (type == 'message' || type == 'client:message'){
			message = this.onMessagePrepare($(msg))
			try {
				if (!window.focus_state )	{
					this.non_readed_messages_count++;
					this.showNumUnreadedMessages();
				}
			}
			catch (e) {}
			this._onMessage(message);
		}
		else {
			//need to handle
		}
	},

	/**
	 * retrieves messages from same user (but different tab or browser windows) and updates view on that
	 **/
	getFromMyself: function(msg){
		if (msg){
			var message = {
				to: $(msg).attr('to'),
				from: $(msg).attr('from'),
				body: $(jQuery.parseXML(msg)).text()+'',
				direction: 'outgoing',
			};

			var friend = {
				jid: getBareJidFromJid($(msg).attr('to')),
				subscription: 'both',
			};

			model = Chat.Controllers.roster.findProperty('jid', friend.jid);
			if (!model){
				model = Chat.Models.User.create(friend);
				Chat.Controllers.roster.addObject(model);
			}

			Chat.Controllers.chatTabs.ownMessage(message);
		}
	},

	/**
	 * get and store archived/offline by user
	 **/
	getArchiveByUser: function(jid){
		 this.socket.write(JSON.stringify({'event': 'getarchivebyuser', 'data': {jid: jid, username: main_jid} }));
	},
	
	/**
	 * get and store archived/offline by user
	 **/
	getArchiveByUserResponse: function(msgs, to){
		tab = Chat.Controllers.chatTabs.find(function (tab) {
			return tab.get('friend.jid') === to;
		});
		if (tab){ 
			tab.set('messageGroups', Ember.A([]));
			var msgarray = this.parseArchive(msgs);
			var tmp_messages_count = tab.get('unreadMessagesCount');
			this.inputArchivedMessages(msgarray, tab.get('load_any_archive', false));
			// set real new messages amount
			tab.set('unreadMessagesCount', tmp_messages_count);
		}
	},
	
	/**
	 * get and store archived/offline by user
	 **/
	getArchiveAll: function(msgs){
		var msgarray = this.parseArchive(msgs);
		this.inputArchivedMessages(msgarray, false);
		
		this.archived_messages_loaded = true;
	},
	
	/**
	 * archived messages parser
	 **/
	parseArchive: function(msgs){
		var msgarray = Ember.A([]);
		var msgs = Ember.A(msgs);
		if (msgs.length > 0){
			msgs.forEach(function(row){
				var message = JSON.parse(row);
				if (message.data) {
					msgarray.push(message.data);
				}
			});
		}
		return msgarray;
	},

	/**
	 * loads archived/offline stuff to application views/models
	 **/
	loadArchiveAll: function(){
		if (this.archived_messages_do_not_load == true) { return false; }
		
		if (this.archived_messages_loaded == false){
			this.socket.write(JSON.stringify({'event': 'getarchiveall', 'data': { jid: this.user.jid} }));
			//this.socket.emit('getarchiveall', { jid: this.user.jid});
			if (this.archived_messages_loaded == false){
				this.loadOnlineUsers(null);
			}
		}
	},

	inputArchivedMessages: function(messages_array, force_load){
		if (messages_array.length > 0){
			for (var i = 0; i < messages_array.length; i++){
				var msg = messages_array[i];
				var friend_jid = getBareJidFromJid(($(msg).attr('from') == this.user.get('jid'))?$(msg).attr('to'):$(msg).attr('from'));

				model = Chat.Controllers.roster.findProperty('jid', friend_jid);

				if (!model){
					var friend = { jid: friend_jid, subscription: 'to', };
					model = Chat.Models.User.create(friend);
					Chat.Controllers.roster.addObject(model);
				}
				if (model && ( model.get('subscription') != 'both' && force_load == false ) ){ continue; }

				if (!($.cookie("tab_closed_" + friend_jid) == 1)){
					if ($(msg).attr('from') != this.user.get('jid')){
						var message = {
							to: this.user.jid,
							from: friend_jid,
							body: $(msg).text()+'',
							direction: 'incoming',
						};
						Chat.Controllers.chatTabs.onArchiveMessage(message);
					}
					else {
						var message = {
							to: friend_jid,
							from: this.user.jid,
							body: $(msg).text()+'',
							direction: 'outgoing',
						};
						Chat.Controllers.chatTabs.ownMessage(message);
					}
				}
			}
		}
	},
	/**
	 * get and online uesrs by ajax request to node.js server
	 **/
	loadOnlineUsers: function(user) {
		this.socket.write(JSON.stringify({'event': 'getonlineusers', 'data': { username: this.user.jid, user: user} }));
		//this.socket.emit('getonlineusers', { username: this.user.jid, user: user});
	},

	/**
	 * get roster change and updates application state
	 **/
	_onRosterChange: function (friends) {
		if (friends.length > 0){
			var counter = 0;
			friends = Ember.A(friends);
			var mfriends = Ember.A([]);
			if (friends.length > Chat.Controllers.application.roster_limit){
				if (friends.length == Chat.Controllers.roster.get('content').length){
					this.afterRosterChange();
					return;
				}
			}
			friends.some(function (friend) {
				var model = Chat.Controllers.roster.findProperty('jid', friend.jid);
				if (friend.subscription == 'remove') {
					// Remove user from the roster
					Chat.Controllers.roster.removeObject(model);
					// remove chat tab if present
					tab = Chat.Controllers.chatTabs.find(function (tab) {
						return tab.get('friend.jid') === friend.jid;
					});
					if (tab){
						var message = {
							to: Chat.Controllers.application.user.get('jid'),
							from: friend.jid,
							body: translate('application.message.user_disagreed', {'nick': getNodeFromJid(friend.jid)}),
							direction: 'system',
						};
						tab._onMessage(Chat.Models.Message.create(message));
						tab.set('waiting', true);
						tab.set('blocking', true);
						Chat.Controllers.chatTabs.activateTab(tab);
					}
					return false;
				} else {
					if (friend.subscription == 'from') {//&& !model
						if (!(friend.ask && (friend.ask === 'subscribe' || friend.ask === 'unsubscribe') )){
							Chat.Controllers.application.confirmationDialog(friend);
							return false;
						}
					}

					if (model) {
						// Update user in the roster
						model.set('subscription', friend.subscription);
						model.set('jid', friend.jid);
					} else {
						// Add user to the roster
						model = Chat.Models.User.create(friend)
						if (friends.length > Chat.Controllers.application.roster_limit){
							mfriends.push(model);
						}
						else {
							Chat.Controllers.roster.addObject(model);
						}
					}

					if (friend.subscription === 'both' && model) {
						tab = Chat.Controllers.chatTabs.find(function (tab) {
							return tab.get('friend.jid') === friend.jid;
						});
						if (tab && tab.get('waiting') == true){
							tab.set('waiting', false);
							var message = {
								to: Chat.Controllers.application.user.get('jid'),
								from: friend.jid,
								body: translate('application.message.user_accepted', {'nick': getNodeFromJid(friend.jid)}),
								direction: 'system',
							};
							Chat.Controllers.chatTabs.onArchiveMessage(message);
							Chat.Controllers.chatTabs.activateTab(tab);
							tab.set('waiting', false);
						}
					}
				}
			});
			
			if (friends.length > Chat.Controllers.application.roster_limit && mfriends.length > Chat.Controllers.application.roster_limit){
				Chat.Controllers.roster.set('content', mfriends);
			}
			
			this.afterRosterChange();
		}
	},
	
	/**
	 * after rosterchange method
	 **/
	afterRosterChange: function (friends) {
		this.loadArchiveAll();
	},

	/**
	 * display jquery-ui dialog when user outside of roster try to start new conversation
	 **/
	confirmationDialog: function(friend){
		var bareJid = getBareJidFromJid(friend.jid);
			
		Chat.Controllers.application.confirmation_div[bareJid] = $(
			'<div id="dialog-confirm" title="' + translate('application.confimation.title') + '">'
			+'<div class="profile-info">' + translate('application.confimation.button', {'nick': getNodeFromJid(friend.jid)}) +'<div>'
			+'</div>'
		);
		$("body").append(Chat.Controllers.application.confirmation_div[bareJid]);
		try { $.playSound('/media/new_message'); } catch (e) {}
		$( "#dialog-confirm" ).dialog({
			resizable: false,
			height:160,
			modal: true,
			buttons: [
				{
					text: translate('application.confimation.button.accept'),
					click: function() {
						$( this ).dialog( "close" );
						if ($(Chat.Controllers.application.confirmation_div[bareJid])){
							$(Chat.Controllers.application.confirmation_div[bareJid]).remove();
						}
						Chat.Controllers.application.addToRoster(bareJid);
						Chat.Controllers.application._onRosterChange(friend);
						tab = Chat.Controllers.chatTabs.find(function (tab) {
							return tab.get('friend.jid') === friend.jid;
						});
						if (tab){
							tab.set('waiting', false);
						}
						Chat.Controllers.application.sendInvitationClosed(bareJid);
						Chat.Controllers.chatTabs.createTabByJid(friend.jid);

						return true;
					},
	 			},
	 			{
					text: translate('application.confimation.button.reject'),
					click: function() {
						$( this ).dialog( "close" );
						if ($(Chat.Controllers.application.confirmation_div[bareJid])){
							$(Chat.Controllers.application.confirmation_div[bareJid]).remove();
						}
						Chat.Controllers.application.removeFromRoster(bareJid);
						Chat.Controllers.application.sendInvitationClosed(bareJid);
						return true;
					},
		 		},
		 	],
		 	close: function(event, ui){
		 		if (event.keyCode && event.keyCode == '27'){
		 			if ($(Chat.Controllers.application.confirmation_div[bareJid])){
		 				$(Chat.Controllers.application.confirmation_div[bareJid]).remove();
		 			}
					Chat.Controllers.application.removeFromRoster(bareJid);
					Chat.Controllers.application.sendInvitationClosed(bareJid);
					return true;
		 		}
			},
		});
		var buttons = $('.ui-dialog-buttonset').children('button');
		if ($(buttons[0])){ $(buttons[0]).addClass('ui-accept-user-button'); }
		if ($(buttons[1])){ $(buttons[1]).addClass('ui-reject-user-button'); }
		if ($(buttons[2])){ $(buttons[2]).addClass('ui-block-user-button'); }
		
		$( '.ui-dialog-titlebar-close' ).remove();
		$(".ui-widget-overlay").css('z-index','300');
		$(".ui-dialog").css('z-index','350');

		return false;
	},

	/**
	 * display jquery-ui dialog with text
	 **/
	alertDialog: function(title, text){
		var div = $('<div id="dialog-confirm" title="' + title + '">'+text+'</div>');
		$("body").append(div);
		$( "#dialog-confirm" ).dialog({
			resizable: false,
			height:140,
			modal: false,
			close: function(){ $(div).remove(); },
		});
		$(".ui-widget-overlay").css('z-index','300');
		$(".ui-dialog").css('z-index','350');
		return false;
	},

	/**
	 * get presence change and updates application state
	 **/
	_onPresenceChange: function (presence) {
		var fullJid = presence.from,
			bareJid = getBareJidFromJid(fullJid);
		switch (presence.type) {
		case 'error':
			// do something
			break;
		case 'subscribe':
			// authorization request
			break;
		case 'unsubscribe':
			// deauthorization request
			break;
		case 'subscribed':
			// authorization confirmed
			break;
		case 'unsubscribed':
			// deauthorization confirmed
			break;
		default:
			// Update user's or friend's presence status
			if (this.user.get('jid') === bareJid) {
				this.setUserPresence(presence);
			} else {
				var model = Chat.Controllers.roster.findProperty('jid', bareJid);
				if (!model) {
					model = Chat.Models.User.create({jid: bareJid, subscription: 'both', ask: ''});
					Chat.Controllers.roster.addObject(model);
				}
				Chat.Controllers.roster.setFriendPresence(presence);
			}
		}
	},

	/**
	 * get message and runs proper tab action
	 **/
	_onMessage: function (message) {
		Chat.Controllers.chatTabs._onMessage(message);
	},

	/**
	 * set presence of given user
	 **/
	setUserPresence: function (presence) {
		if (presence.show == 'available'){
			this.user.set('show',presence.show);
			this.user.set('show2', (presence.show == 'unavailable')?translate('application.presence.off'):translate('application.presence.on'));
			this.user.setPresence(presence);
		}
	},

	/**
	 * send messages action (send proper stanza to xmpp)
	 **/
	sendMessage: function (message) {
		this.message(message.get('to'), message.get('body'));
	},
	
	
	removeFromRosterDialog: function (to) {
		var conf_div = $(
			'<div id="dialog-confirm" title="' + translate('application.confimation.remove_from_roster_title', {'nick': getNodeFromJid(to)}) + '">'
			+'<div>' + translate('application.confimation.remove_from_roster_desc', {'nick': getNodeFromJid(to)}) +'<div>'
			+'</div>'
		);
		$("body").append(conf_div);
		$( "#dialog-confirm" ).dialog({
			resizable: false,
			height:160,
			modal: true,
			buttons: [
				{
					text: translate('application.confimation.button.yes'),
					click: function() {
						$( this ).dialog( "close" );
						Chat.Controllers.application.removeFromRoster(to);
						return true;
					},
	 			},
	 			{
					text: translate('application.confimation.button.no'),
					click: function() {
						$( this ).dialog( "close" );
						return false;
					},
		 		},
		 	],
		});
		$( '.ui-dialog-titlebar-close' ).remove();
		$(".ui-widget-overlay").css('z-index','300');
		$(".ui-dialog").css('z-index','350');
	},

	/**
	 * remove from roster action (send proper stanza to xmpp)
	 **/
	removeFromRoster: function (to) {
		var stanza = $iq({type: 'set',from: this.user.get('jid')});
		stanza.c('query', {xmlns: 'jabber:iq:roster'}).c('item', {ask: 'unsubscribe', subscription: 'remove', jid: to});
		this.send(stanza);
		//remove from roster
		user_to_remove = Chat.Controllers.roster.findProperty('jid', to);
		if (user_to_remove){
			Chat.Controllers.roster.removeObject(user_to_remove);
		}
		//tab to remove
		tab = Chat.Controllers.chatTabs.find(function (tab) {
			return tab.get('friend.jid') === to;
		});
		if (tab){
			Chat.Controllers.chatTabs.removeTab(tab);
		}
	},

	/**
	 * add to roster action (send proper stanza to xmpp)
	 **/
	addToRoster: function (to) {
		var stanza = $pres({type: 'subscribe', to: getBareJidFromJid(to)});
		this.sendStanza(stanza);
	},

	/**
	 * send stanza to xmpp
	 **/
	sendStanza: function (stanza) {
		this.send(stanza);
	},

	/* methods moved from client */
	/**
	 * make array of objects from xml stanza from xmpp
	 **/
	handleRosterStanza: function (stanza) {
		var self = this,
			items = $(stanza).find('item');

		return items.map(function (index, item) {
			item = $(item);

			var fullJid = item.attr('jid'),
				bareJid = getBareJidFromJid(fullJid);

			// Setup addressing
			self.jids[bareJid] = fullJid;

			return {
				jid: fullJid,
				subscription: item.attr('subscription'),
				ask: item.attr('ask'),
			};
		}).get();
	},

	/**
	 * make object from xml xmpp presence stanza
	 **/
	onPresenceChangePrepare: function (stanza) {
		stanza = $(stanza);
		var fullJid = stanza.attr('from'),
			bareJid = getBareJidFromJid(fullJid),
			show = stanza.attr('type') === 'unavailable' ? 'unavailable' : 'available',
			message = {
				from: fullJid,
				type: stanza.attr('type') || 'available',
				show: stanza.find('show').text() || show,
				status: stanza.find('status').text()
			};

		this.jids[bareJid] = fullJid;
		return message;
	},

	/**
	 * make message object from xml xmpp message stanza
	 **/
	onMessagePrepare: function(stanza) {
		stanza = $(stanza);
		var fullJid = stanza.attr('from'),
			bareJid = getBareJidFromJid(fullJid),
			body = stanza.text()+'',
			// TODO: fetch activity
			activity = 'active',
			message = {
				id: stanza.attr('id'),
				from: fullJid,
				body: body,
				activity: activity
			};

		// Reset addressing
		this.jids[bareJid] = fullJid;
		return message;
	},

	/**
	 * send message to user (by socket.io to xmpp)
	 **/
	message: function (to, message) {
		// send only not empty string (after trim)
		if($.trim(message).length > 0) {
			var fullJid = this.jids[to];

			stanza = $msg({
				to: fullJid,
				from: main_jid,
			});
			stanza.c('body').t(message);
			this.send(stanza);
		}
	},

	/**
	 * send to socket.io
	 **/
	send: function (stanza) {
		 this.socket.write(JSON.stringify({'event': 'stanzafromclient', 'data': { stanza: stanza.toString(), user: main_jid } }));
		//this.socket.emit('stanzafromclient', {stanza: stanza.toString(), user: main_jid});
	},

	/**
	 * emit information to server.js that user left chat window (tab)
	 **/
	sendLeftChat: function (to) {
		this.socket.write(JSON.stringify({'event': 'leftchat', 'data': { from: this.user.get('jid'), to: to} }));
		//this.socket.emit('leftchat', {from: this.user.get('jid'), to: to});
	},
	/**
	 * emit information to server.js that user left chat window (tab)
	 **/
	enteredChat: function (to) {
		this.socket.write(JSON.stringify({'event': 'enteredchat', 'data': { from: this.user.get('jid'), to: to} }));
		//this.socket.emit('enteredchat', {from: this.user.get('jid'), to: to});
	},
	/**
	 * emit information to server.js that user reacted for invitation
	 **/
	sendInvitationClosed: function (to) {
		this.socket.write(JSON.stringify({'event': 'invitationclosed', 'data': { from: this.user.get('jid'), to: to} }));
		//this.socket.emit('invitationclosed', {from: this.user.get('jid'), to: to});
	},
	
	showTyping: function (from) {
		var tab = Chat.Controllers.chatTabs.find(function (tab) {
			return tab.get('friend.jid') === from;
		});
		if (tab){
			tab.setTyping(new Date().getTime());
		}
	},
	
	/**
	 * emit information about typing
	 **/
	sendTyping: function (to) {
		if (!to){ return; }
		
		//do not send typing notification if that was sent less than second before 
		if (typeof Chat.Controllers.application.typingNotifications[to] != 'undefined'){
			var diff = (new Date().getTime() - Chat.Controllers.application.typingNotifications[to])/1000;
			if (diff < 1){ return; }
		}
		
		Chat.Controllers.application.typingNotifications[to] = new Date().getTime();
		this.socket.write(JSON.stringify({'event': 'typing', 'data': { from: this.user.get('jid'), to: to} }));
	},

	/**
	 * get & insert information that user left chat window (tab)
	 **/
	clientLeftChat: function (jid) {
		var message = {
			to: this.user.get('jid'),
			from: jid,
			body: translate('application.message.left_chat', {'nick': getNodeFromJid(jid)}),
			direction: 'system',
		};
		tab = Chat.Controllers.chatTabs.find(function (tab) {
			return tab.get('friend.jid') === jid;
		});
		if (tab){
			Chat.Controllers.chatTabs.onArchiveMessage(message);
		}
	},
	
	/**
	 * get & insert information that user left chat window (tab)
	 **/
	clientEnteredChat: function (jid) {
		tab = Chat.Controllers.chatTabs.find(function (tab) {
			return tab.get('friend.jid') === jid;
		});
		if (tab){
			var message = {
				to: this.user.get('jid'),
				from: jid,
				body: translate('application.message.entered_chat', {'nick': getNodeFromJid(jid)}),
				direction: 'system',
			};
			Chat.Controllers.chatTabs.onArchiveMessage(message);
		}
	},

	/**
	 * close invitation dialog (accepted/removed in another browser tab)
	 **/
	closeInvitationDialog: function (barejid) {
		if (Chat.Controllers.application.confirmation_div[barejid]){
			Chat.Controllers.application.confirmation_div[barejid];
			$(Chat.Controllers.application.confirmation_div[barejid]).remove();
		}
	},

	/**
	 * emit information to server.js that user closed chat window (tab)
	 **/
	sendRemoveTab: function (to) {
		this.socket.write(JSON.stringify({'event': 'removetab', 'data': { to: to, from: this.user.get('jid') } }));
		//this.socket.emit('removetab', {to: to, from: this.user.get('jid')});
	},

	/**
	 * find tab for given jid and try to close it
	 **/
	removeTab: function (jid) {
		tab = Chat.Controllers.chatTabs.find(function (tab) {
			return tab.get('friend.jid') === jid;
		});
		Chat.Controllers.chatTabs.removeObject(tab);
		Chat.Controllers.chatTabs.isMore();
	},

	/**
	 * set online users
	 **/
	setOnlineUsers: function (msg) {
		if (msg){
			$.each(msg.presences, function(index, value) {
				if (msg.user == null || value == msg.user){
					msg = '<presence xmlns="jabber:client" from="'+value+'" to="'+main_jid+'"/>';
					pres = Chat.Controllers.application.onPresenceChangePrepare($(msg));
					Chat.Controllers.application._onPresenceChange(pres);
				}
			});
		}
	},

	
	/**
	 * turn off chat action
	 **/
	chatOff: function(not_send_stanza){
		//ofline
		if (not_send_stanza != true){
			var stanza = $pres({'from' : getBareJidFromJid(Chat.Controllers.application.user.jid), 'type': 'unavailable'});
			stanza.c('priority').t('10');
			stanza.c('status').t('off');
			Chat.Controllers.application.send(stanza);
		}

		Chat.Controllers.chatTabs.clear();
		Chat.Controllers.chatTabs.set('more_button',false);
		Chat.Controllers.application.user.set('show','unavailable');
		Chat.Controllers.application.user.set('show2',translate('application.presence.off'));
		
		Chat.Controllers.application.archived_messages_loaded = false;

		this.jids = {};
	},

	/**
	 * turn on chat action
	 **/
	chatOn: function() {
		//get roster
		var stanza = $iq({type: 'get'});
		stanza.c('query', {xmlns: 'jabber:iq:roster'});
		Chat.Controllers.application.send(stanza);
		
		for (var jid in Chat.Controllers.application.lefftsent) {
			Chat.Controllers.application.enteredChat(jid);
		};
		Chat.Controllers.application.lefftsent = [];

		//online
		var stanza = $pres({'from' : getBareJidFromJid(Chat.Controllers.application.user.jid)});
		Chat.Controllers.application.send(stanza);
	},
	
	/**
	* recreate connection action
	**/
	recreateConnection: function(){
		var lsocket = this.socket;
		$.get('get_chat?name=' + getQueryVariable('name') + '&password=' + getQueryVariable('password') + '&md5=' + getQueryVariable('md5'),function(ret){
			if (typeof ret != 'undefined' && ret ){
				lsocket.write(JSON.stringify({'event': 'adduser', 'data': {'username': main_jid} }));
			}
		});
	},

	showNumUnreadedMessages: function() {
		if (typeof this.non_readed_messages_count === 'number') {
			var text = $('title').text();
			var pattern = /^\((\d+)\)/g;
			var changed_text = text.replace(pattern, '(' + this.non_readed_messages_count + ')');
			if (text == changed_text) {
				changed_text = '(' + this.non_readed_messages_count + ') ' + text;
			}
			$('title').text(changed_text);
		}
	},

	hideNumUnreadedMessages: function() {
		var text = $('title').text();
		var pattern = /^\((\d+)\)\s+/g;
		$('title').text(text.replace(pattern, ''));
	},
	resetNumUnreadedMessages: function() {
		this.non_readed_messages_count = 0;
	},
});

Chat.Controllers.application = Chat.Controllers.Application.create();
