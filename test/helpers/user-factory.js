
var app = require('../../app');
var mongoose = require('mongoose');
var	User = mongoose.model('User');

var UserFactory = {

	create: function(email, username, name, password){
		var user = {
			email: email,
			username: username,
			name: name,
			password: password			
		}
 
		return user;
	},

	optionsSignup: function(user){
			
			var options = {
				url: "http://localhost:{0}/api/signup".format(app.settings.port),
				form: user
			};

			return options;
	},

	optionsLogin: function(email, password){

			var options = {
				url: "http://localhost:{0}/api/login".format(app.settings.port),
				form: {
					email: email,
					password: password
				}
			};

			return options;		

	},

	shouldCreateNewUser: function(username, done){

		function validate(err, res, body){

			if (err) return done(err);

			console.log("== should create a new user JSON RESPONSE==> " + body);

			res.should.have.status(201);
			res.should.be.json;

			var _obj = JSON.parse(body).user;

			_obj.should.have.be.a('object');
			_obj.should.have.property('id');

			//The usernames are stored lowercase.
			_obj.username.toLowerCase().should.equal(username.toLowerCase());
			done();
					
		}

		return validate;
	},

	shouldAuthenticateUser: function(done){

		function validate(err, res, body){

			if (err) return done(err);

			res.should.have.status(200);
			res.should.be.json;

			var _obj = JSON.parse(body);
			console.log(_obj);
			_obj.should.have.be.a('object');

			done();
		}

		return validate;

	}
}



module.exports = UserFactory;