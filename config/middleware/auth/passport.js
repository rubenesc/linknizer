
var mongoose = require('mongoose');
var User = mongoose.model('User');

var local = require('./passport/local');
var facebook = require('./passport/facebook');
// var util = require('util');

module.exports = function (passport) {

	// serialize sessions
	passport.serializeUser(function(user, done) {
		// util.debug("--> passport.serializeUser");
		// util.debug(util.inspect(user, { showHidden: false, depth: null }));
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		// util.debug("--> passport.deserializeUser: " + id);
		User.findOne({ _id: id }, function (err, user) {
			done(err, user);
		});
	});	

	// use these strategies
	passport.use(local);
	passport.use(facebook);

}





