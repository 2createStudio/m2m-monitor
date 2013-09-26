/**
 * dependencies
 */
var notifier = require('mail-notifier'),
	events = require('events'),
	util = require('util');

/**
 * @constructor
 * @description Generates a Monitor object
 */
function Monitor(imap){

	// create emitter
	events.EventEmitter.call(this);

};

/**
 * extend the prototype & export the module
 */
util.inherits(Monitor, events.EventEmitter);
exports.Monitor = Monitor;

/**
 * @method setup
 * @memberOf Monitor
 * @param {Object} imap 
 * @description Setups the module
 */
Monitor.prototype.setup = function(imap){

	var self = this;

	// create instance
	this.notifier = notifier(imap);

	// setup events
	this.notifier.on('mail', function(mail){

		// trigger custom event
		self.emit('monitor:mail:new', mail);

		if (mail.html) {

			// cache last email
			self.lastMail = mail;

		}

	});

	this.notifier.on('error', function(error){

		// trigger custom event
		self.emit('monitor:mail:error', error);

	});

};

/**
 * @method start
 * @memberOf Monitor
 * @param {Object} emailer 
 * @param {Object} message 
 * @param {Object} transport 
 * @description Starts monitoring
 */
Monitor.prototype.start = function(emailer, message, transport){

	var self = this;

	// start IMAP
	this.notifier.start();
	
	// send test message on every 60 minutes
	this.interval = setInterval(function(){

		// generate random string & update the message
		self.currRandom = message.text = '[' + self.random() + ']';

		// send the test message
		emailer.send(message, transport);

	}, 1000 * 60 * 60);

};

/**
 * @method stop
 * @memberOf Monitor
 * @description Stops monitoring
 */
Monitor.prototype.stop = function(){

	// stop IMAP
	this.notifier.stop();

	// clear the interval
	clearInterval(this.interval);

	// clear check timer
	if (this.timer) {
		clearTimeout(this.timer);
	}

};

/**
 * @method check
 * @memberOf Monitor
 * @description Checks the email
 */
Monitor.prototype.check = function(){

	var self = this;

	// clear timer
	if (self.timer) {
		clearTimeout(self.timer);
	}

	// set timer
	self.timer = setTimeout(function(){

		if (self.lastMail && self.currRandom) {

			// get id
			var matches = self.lastMail.html.match("\\[.*\\]");

			if (matches) {
				var id = matches[0];

				// check id
				if (id != self.currRandom) {
					self.emit('monitor:check:error', id);
				} else {
					self.emit('monitor:check:success', id);
				}

			}

			// reset lastMail
			delete self.lastMail;
		}

	}, 1000 * 60 * 10);

};

/**
 * @method random
 * @memberOf Monitor
 * @description Generates a random string
 */
Monitor.prototype.random = function(){
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};




