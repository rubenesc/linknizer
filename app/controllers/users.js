var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	_ = require('underscore'),
	prettyjson = require('prettyjson'),
	check = require('validator').check;

var util = require('util');
var ErrorHelper = require("../helpers/errorHelper");
var AppError = require("../helpers/appError");
var ApplicationError = require("../helpers/applicationErrors");
var MailHelper = require("../helpers/mailHelper");
var UtilHelper = require("../helpers/utilHelper");


exports.create = function(req, res, next) {

	console.log();
	util.debug('--> users.create ... username: ' + req.body.username + ", email: " + req.body.email);

	// util.debug("request body: ");
	// util.debug(prettyjson.render(req.body));
	// console.log();

	//to create a user we need
	// 	email: user.email,
	// //name: user.name,
	// //username: user.username,
	// //password: user.password

	//request validation
	var errors = [];

	req.onValidationError(function(msg){
		errors.push(msg);
	});

	req.check('email', 'Please enter a valid email').isEmail();
	req.check('username', 'Please enter a username').notEmpty();
	req.check('password', 'Please enter a valid password').notEmpty();
	
	if(errors.length){
		var message = "Registration could not be completed";

		req.flash('error', message);
		req.flash('error', errors);
		console.log("error registering, adding flash message: " + message);
		return res.redirect("/signup");
		// return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
	}

	//validations passed lets start processing the request
	// var user = new User(req.body);
	var user = new User({
	        "email": req.body.email.toLowerCase(),
	        "name": req.body.name,
	        "username": req.body.username.toLowerCase(),
	        "password": req.body.password
	    });


	//local registration
	user.provider = 'local';

	User.findByUniqueFields(req.body, function(err, data, field) {

		if(err) {
			var msg = "Registration could not be completed";
			req.flash('error', msg);
			return res.redirect("/signup");
	//		return ErrorHelper.handleError(err, res, next, msg, 400);
		}

		if(data) {
			
			var msg = field ? field + " is already taken" : "user already exists";
			req.flash('error', msg);
			return res.redirect("/signup");
			// return ErrorHelper.handleError(err, res, next, msg, 400);
		}


		//finally create the new user
		user.save(function(err) {

			if(err) {
				var msg = "Registration could not be completed";
				req.flash('error', msg);
				return res.redirect("/signup");
	//			return ErrorHelper.handleError(err, res, next, msg, 400);

			} else {

				//if the user is created, also log him in
				req.login(user, function(err) {
		        	if (err) {
	    		        util.error("--server error message --> " + err.message);
						var msg = "Registration could not be completed";
	        			req.flash('error', msg);
						return res.redirect("/signup");
			        }

					util.debug('user created! _id: ' + user._id);
					res.redirect("/links/"+user.username);
					// return res.send(201, {user: user.toClient() });				        
		      	});


			}
		});

	});
}

exports.show = function(req, res, next) {

	console.log();
	util.debug('--> users.show: ' + req.params.username);

	User.findByUsername(req.params.username, function(err, data) {

		if(err || !data) {

			var msg = "Resource not found: " + req.url;
			return ErrorHelper.handleError(err, res, next, msg, 404);

		} else {

			res.send({user: data.toClient()});
		}

	});
}

exports.update = function(req, res, next) {

	console.log();
	util.debug('--> users.update: ' + req.params.username);

	User.findByUsername(req.params.username, function(err, data) {

		if(err || !data) {

			var msg = "Resource not found: " + req.url;
			return ErrorHelper.handleError(err, res, next, msg, 404);

		}

		if(req.body.email) {
			data.email = req.body.email;
		}

		if(req.body.name) {
			data.name = req.body.name;
		}

		if(req.body.username) {
			data.username = req.body.username;
		}

		data.save(function(err) {
			if(err) {

				var msg = "update could not be completed";
				return ErrorHelper.handleError(err, res, next, msg, 400);

			} else {
				res.send({user: data.toClient()});
			}
		});


	});
}

exports.del = function(req, res, next) {

	console.log();
	util.debug('--> users.delete: ' + req.params.username);

	User.findByUsername(req.params.username, function(err, data) {

		if(err || data == null) {

			var msg = "Resource not found: " + req.url;
			return ErrorHelper.handleError(err, res, next, msg, 404);

		}

		data.remove(function(err) {

			if(err) {

				var msg = "Resource could not be deleted";
				return ErrorHelper.handleError(err, res, next, msg, 400);

			} else {
				util.debug('removed: ' + req.url);
				res.send({});
			}
		});

	});
}


exports.session = function(req, res, next){

	console.log();
	util.debug('--> users.session');
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	
	res.redirect("/links/"+req.currentUser.username);
//	return res.send(200, {message: "user authenticated" });
	
}

exports.isAuthenticated = function(req, res, next){

  if ( req.isAuthenticated() ) {
    res.send(200);
  } else {
    res.send(401);
  }

}

exports.logout = function (req, res) {

	console.log();
	util.debug('--> users.logout');
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	req.logout();
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());

	return res.send(200);
	
}


exports.forgot = function(req, res, next){

	var errors = [];

	req.onValidationError(function(msg){
		errors.push(msg);
	});

	req.check('email', 'Please enter a valid email').isEmail();

	if(errors.length){
		req.flash('error', errors);
		return res.redirect("/forgot");
	}

	var userEmail = req.body.email;
	User.findByEmail(userEmail, function(err, user){

	    if (err) return next(err); 
	    
	    if (!user) {
			req.flash('info', "email not found"); 		    	
			return res.redirect("forgot");
	    }


	    //generate new password
        var newPassword =  UtilHelper.random(6);

        //update user with new password
        user.password = newPassword;
		user.save(function(err) {

		    if (err) { 
		    	return next(err); 
		    }

		    //send new password to user;
			var name = user.name || user.username;
			var resetPasswordMsgTemplate = "Dear {0},  <p>Our records indicate that you have chosen to reset the password for user {1}.</p> <p>Your new password is: {2} </p> <p> Sincerely, <br/> La Polla Customer Support <br/> http://lapolla.maracana.co</p> "

			// setup e-mail data with unicode symbols
			var mailOptions = {
			    from: "Maracana.co <admin@maracana.co>", // sender address
			    to: userEmail, // list of receivers
			    subject: "Password Reset Requested", // Subject line
			    html: resetPasswordMsgTemplate.format(name, userEmail, newPassword) // html body
			}		
			
			console.log("--newPassword-->["+newPassword+"]");
			//send email asynchronously
			// MailHelper.sendMail(mailOptions, function(err){
			// 	if (err) return next(err);
			// });


			req.flash('info', "An email has been sent to {0} with your new password".format(userEmail)); 
			res.redirect("forgot");

		});


	});

}



