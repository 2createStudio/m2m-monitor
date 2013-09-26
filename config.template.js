exports.config = {

	"message": {
		"from": "'First Last' <firstlast@gmail.com>",
		"to": "'Last First' <lastfirst@gmail.com>",
		"subject": "System check",
		"text": "Random string generated by Monitor"
	},

	"transport": {
		"type": "SMTP",
		"host": "smtp.gmail.com",
		"secureConnection": true,
		"port": 465,
		"user": "name@gmail.com",
		"pass": "samplePassword"
	},

	"imap": {
		"host": "imap.gmail.com",
		"port": 993,
		"secure": true,
		"username": "name2@gmail.com",
		"password": "samplePassword"
	},

	"logs": {
		"file": __dirname + "/logs/log.txt",
		"to": "'Admin' <name3@gmail.com>",
		"from": "'System' <name2@gmail.com>",
		"host": "smtp.gmail.com",
		"port": 465,
		"ssl": true,
		"username": "name2@gmail.com",
		"password": "samplePassword",
		"subject": "{{level}}",
		"level": "error"
	}
	
};
