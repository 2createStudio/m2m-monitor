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
function Monitor(){

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
 * @param {Object} config 
 * @description Setups the module
 */
Monitor.prototype.setup = function(config){

	var self = this;

	// cache config
	this.config = config;

	// setup self repair counter
	this.repairCounter = 0;
	this.doOnce = true;

	// create instance
	this.notifier = notifier(config.imap);

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

		self.send(emailer, message, transport);

	}, this.config.timers.send);


	// send test message on startup
	if (this.config.startImmediately) {
		this.send(emailer, message, transport);
	}

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
 * @method send
 * @memberOf Monitor
 * @param {Object} emailer 
 * @param {Object} message 
 * @param {Object} transport 
 * @description Sends a test message
 */
Monitor.prototype.send = function(emailer, message, transport){

	// generate random string & update the message
	this.currRandom = message.text = '[' + this.random() + ']';

	// send the test message
	emailer.send(message, transport);

};

/**
 * @method check
 * @memberOf Monitor
 * @description Checks the email
 */
Monitor.prototype.check = function(){

	var self = this;

	// clear timer
	if (this.timer) {
		clearTimeout(this.timer);
	}

	if (this.warningTimer) {
		clearTimeout(this.warningTimer);
	}

	// set warning timer
	this.warningTimer = setTimeout(function(){

		if (!self.lastMail && self.currRandom) {
			self.emit('monitor:warning');
		}

	}, this.config.timers.warning);

	// set timer
	this.timer = setTimeout(function(){

		// clear warning timer
		clearTimeout(self.warningTimer);

		if (self.currRandom) {

			if (self.lastMail) {

				// get id
				var matches = self.lastMail.html.match("\\[.*\\]");

				if (matches) {
					var id = matches[0];
					/*
					if (self.doOnce) {
						self.doOnce = false;
						id = 'willfail';
					}
					*/

					// check id
					if (id != self.currRandom) {
						self.emit('monitor:check:error', { id: id, reason: '[Wrong ID]' });

						// update counter
						self.repairCounter++;

					} else {
						self.emit('monitor:check:success', id);

						if (self.repairCounter > 0) {
							self.repairCounter = 0;
							self.emit('monitor:repair');
						}
					}

				}

				// reset lastMail
				delete self.lastMail;

			} else {
				self.emit('monitor:check:error', { id: self.currRandom, reason: '[No new mail]' });

				// update counter
				self.repairCounter++;
			}

		}

	}, this.config.timers.check);

};

/**
 * @method random
 * @memberOf Monitor
 * @description Generates a random string
 */
Monitor.prototype.random = function(){
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};




