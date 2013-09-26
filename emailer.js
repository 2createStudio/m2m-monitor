/**
 * dependencies
 */
var nodemailer = require('nodemailer'),
	events = require('events'),
	util = require('util');

/**
 * @constructor
 * @description Generates a Emailer object
 */
function Emailer(){

	// create emitter
	events.EventEmitter.call(this);

};

/**
 * extend the prototype & export the module
 */
util.inherits(Emailer, events.EventEmitter);
exports.Emailer = Emailer;

/**
 * @method send
 * @memberOf Emailer
 * @param {Object} message
 * @param {Object} transport 
 * @description Sends a message
 */
Emailer.prototype.send = function(message, transport){

	var self = this;

	// get the mail transport
	var trans = this.getTransport(transport);

	// send the email
	trans.sendMail(message, function(error, response){

		if (error) {
			self.emit('mailer:error', error);
		} else {
			self.emit('mailer:success', response);
		}

	});

};

/**
 * @method getTransport
 * @memberOf Emailer
 * @param {Object} transport 
 * @description Generates a transport
 */
Emailer.prototype.getTransport = function(transport){

	// get options
	var options = transport;

	return nodemailer.createTransport(options.type, {
		host: options.host,
		secureConnection: options.secureConnection,
		port: options.port,
		auth: {
			user: options.user,
			pass: options.pass
		}
	});

};



