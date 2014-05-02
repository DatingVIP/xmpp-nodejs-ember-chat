var utils = require('./utils'), 
	path = require('path'), 
	fs = require('fs');

var Config = {
	/**
	 * 1 - only errors; 
	 * 2 - log entries;
	 * 3 - errors & log entries
	 * 4 - xml
	 * 5 - errors & xml
	 * 6 - log entries & xml
	 * 7 - all
	 */
	level: 3,
	
	/**
	 * Path where log files will be storage
	 */
	path: '../logs',
	
	/**
	 * Prefix of file log 
	 */
	file_prefix: '',
	
	/**
	 * Name of file log
	 */
	file_name: 'server',
	
	/**
	 * Enable print log to the output (stdout)
	 */
	enable_print: false,
	
	/**
	 * Enable print log to the log file
	 */
	enable_logfile: true,
};
exports.Config = Config;

function prepareDate() {
	var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
	var d = new Date();
	var month = d.getMonth();
	var day = d.getDate();
	var hour = d.getHours();
	var min = d.getMinutes();
	var sec = d.getSeconds();
	var msec = d.getMilliseconds();
	
	if (day.toString().length == 1) day = "0" + day;
	if (hour.toString().length == 1) hour = "0" + hour;
	if (min.toString().length == 1) min = "0" + min;
	if (sec.toString().length == 1) sec = "0" + sec;
	if (msec.toString().length == 1) msec = "00" + msec;
	if (msec.toString().length == 2) msec = "0" + msec;
	
	return d.getFullYear() + '-' + m_names[month] + '-' + day + ' ' + hour + ':' + min + ':' + sec + '.' + msec
};

function prepareRow(date, who, what) {
	return '[' + date + '] '+ (who === ''?'': '['+who+'] ') + what;
};

function toStdOut(when, who, what) {
	console.log('> ' + prepareRow(when, who, what));
};

function toLogFile(when, who, what) {
	if (!fs.existsSync(Config.path)) {
		fs.mkdir(Config.path, 0777, true, function (err) {
			if (err) {
				console.log(err);
			}
		});
	}
	var logpath = path.join(Config.path, Config.file_prefix + '_' + Config.file_name)
	var log = fs.createWriteStream(logpath, {'flags': 'a'});
	log.on('error', function(e) { console.error(e); });
	log.end('> ' + prepareRow(when, who, what) + "\n");
};

this.log = function log(who, what, priority) {
	if (priority === undefined) {
		priority = 1;
	}
	if (this.Config.level === undefined) {
		this.Config.level = 0;
	}
	
	if (priority & this.Config.level) {
		var date = prepareDate();
		
		if (this.Config.enable_print) {
			toStdOut(date, who, what);
		}
		
		if (this.Config.enable_logfile) {
			toLogFile(date, who, what);
		}
	}
};

this.dumpException = function (err) {
	return utils.varDump(err);
}
