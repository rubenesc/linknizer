

var env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , nodemailer = require("nodemailer")
  , util = require('util');


// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: config.smtp.service,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
    }
});

	
var MailHelper = {
 
	sendMail: function(mailOptions, cb) {

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response){
	    	
	    	if(error){
	        	return cb(err);
	    	} else{
    			return cb();
	    	}

	    	// if you don't want to use this transport object anymore, uncomment following line
	    	// smtpTransport.close(); // shut down the connection pool, no more messages				
		});

	}
	
}

module.exports = MailHelper;