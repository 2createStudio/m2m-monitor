/**
 * @name index.js
 * @description Main file for mail to message monitor.
 */

/**
 * dependencies
 */
var winston = require('winston'),
	config = require('./config.js').config,
	Emailer = require('./emailer.js').Emailer,
	Monitor = require('./monitor.js').Monitor;

require('winston-mail').Mail;

/**
 * create instance
 */
var emailer = new Emailer(),
	monitor = new Monitor();

/**
 * @method setup_logging
 */
function setup_logging(){

	// log everything to a file
	winston.add(winston.transports.File, { filename: config.logs.file });

	// send a email on error
	winston.add(winston.transports.Mail, {
		"to": config.logs.to,
        "from": config.logs.from,
        "host": config.logs.host,
        "port": config.logs.port,
        "ssl": config.logs.ssl,
        "username": config.logs.username,
        "password": config.logs.password,
        "subject": config.logs.subject,
        "level": config.logs.level
	});

};

/**
 * @method init
 */
function init(){

	// setup logs
	setup_logging();

	// setup & start monitor 
	monitor.setup(config.imap);
	monitor.start(emailer, config.message, config.transport);

	// setup email events
	emailer.on('mailer:error', function(error){
		winston.error('Emailer - test message was not sent!', { error: error });
	});

	emailer.on('mailer:success', function(response){
		winston.info('Emailer - test message with ID:' + monitor.currRandom + ' was sent!');

		// check
		monitor.check();

	});

	// setup monitor events
	monitor.on('monitor:check:error', function(id){
		winston.error('Monitor - test fails with ID: ' + id);
	});

	monitor.on('monitor:check:success', function(id){
		winston.info('Monitor - test succeeded with ID: ' + id);
	});

	monitor.on('monitor:mail:new', function(){
		winston.info('Monitor - new message!');
	});

	monitor.on('monitor:mail:error', function(error){
		winston.error('Monitor - there is an error with imap!', { error: error });
	});

};

/**
 * start the app
 */
init();

