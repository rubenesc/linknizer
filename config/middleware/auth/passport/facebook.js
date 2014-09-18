/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = mongoose.model('User');
var config = require('../../../config');

/**
 * Expose
 */
module.exports = new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL
  },

  function(accessToken, refreshToken, profile, done) {

    var options = {
      criteria: { 'facebook.id': profile.id }
    };

    console.dir(profile);

    User.load(options, function (err, user) {

      if (err) return done(err);
      
      // if the user is found, then log them in
      if (user) {

        return done(null, user); // user found, return that user

      } else {

      	// if there is no user found with that facebook id, create them


        var newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.username,
          provider: 'facebook',
          facebook: profile._json
        });
      
        newUser.save(function (err) {
      
          if (err) 
          	return done(err);
      
  			// if successful, return the new user
        	return done(null, newUser);
        });
      }

    });

  }

);