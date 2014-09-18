
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var User = mongoose.model('User');
var util = require('util');

/**
 * Expose
 */
module.exports = new LocalStrategy({
		  usernameField: 'email',
		  passwordField: 'password'
		},

		function(email, password, done) {

		  User.findOne({ email: email.toLowerCase() }, function (err, user) {
		  	
			// util.debug("--> passport-LocalStrategy.findOne: email[" + email + "]");

		    if (err) return done(err); 
		    
		    if (!user) 
		    	return done(null, false, { message: 'Unknown user' });
		    
		    if (!user.authenticate(password))
		    	return done(null, false, { message: 'Invalid password' });
		    
		    return done(null, user);

		  });
		}
	);	







