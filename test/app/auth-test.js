var assert = require('assert');
var request = require('request');
var app = require('../../app');
var should = require('should');
var prettyjson = require('prettyjson');
var mongoose = require('mongoose');
var	User = mongoose.model('User');
var UserFactory = require("../helpers/user-factory");
var util = require("util");



/**
	tests:
	
	--clean users db

	create a new user ------------------------ POST 201               
	authenticate user ------------------------ POST 200
	verify if user is authenticated ---------- GET  200
	logout user ------------------------------ POST 200
	verify if user is authenticated ---------- GET  200
	should not logout, no session ------------ POST 403

	not authenticate user, no password ------- POST 401
	not authenticate user, wrong password ---- POST 401
	not authenticate user, no email ---------- POST 401
	not authenticate user, wrong email ------- POST 401

**/


describe('authentication', function(){

	describe('controller /api/users', function(){

		var user;

		before(function(done){

			console.log();
			console.log('========== start auth-test ========== ');

			console.log();
			console.log('cleaning up the "users" MongoDB collection for authentication tests');

			User.collection.remove(function(err){

				if (err) return done(err);

				done();
			});
		});

		//create test user
		it('should create a new user', function(done){

			//test user
			user = UserFactory.create(
				'john.doe@link.com', 'john.DOE',
				'John Doe', '1234');


			var options = {
				url: "http://localhost:" + app.settings.port + "/api/signup",
				form: user
			};

			request.post(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should create a new user JSON RESPONSE==> " + _body);

				_res.should.have.status(201);
				_res.should.be.json;

				var _obj = JSON.parse(_body).user;
				console.log(_obj);

				_obj.should.have.be.a('object');
				_obj.should.have.property('id');

				//The usernames are stored lowercase.
				_obj.username.toLowerCase().should.equal(user.username.toLowerCase());
				done();
				
			});
		});


		it('should authenticate user', function(done){

			//create test user.
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/login",
				form: {
					email: user.email,
					password: user.password
				}
			};

			// console.log("options:");
			// console.log(util.inspect(options, { showHidden: false, depth: null }));
			request.post(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should authenticate user JSON RESPONSE==> " + _body);

				_res.should.have.status(200);
				_res.should.be.json;

				var _obj = JSON.parse(_body);
				console.log(_obj);
				_obj.should.have.be.a('object');

				done();
			});
		});

		it('should verify if user is authenticated', function(done){

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/authenticated",
			};

			// console.log("options:");
			// console.log(util.inspect(options, { showHidden: false, depth: null }));
			request(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should verify if user is authenticated JSON RESPONSE==> " + _body);

				_res.should.have.status(200);
				done();
			});
		});


		it('should logout user', function(done){

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/logout",
			};

			// console.log("options:");
			// console.log(util.inspect(options, { showHidden: false, depth: null }));
			request.post(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should logout user JSON RESPONSE==> " + _body);

				_res.should.have.status(200);
				done();
			});
		});


		it('should verify if user is authenticated', function(done){

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/authenticated",
			};

			// console.log("options:");
			// console.log(util.inspect(options, { showHidden: false, depth: null }));
			request(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should verify if user is authenticated JSON RESPONSE==> " + _body);

				_res.should.have.status(401);
				done();
			});
		});		

		it('should not logout, no session', function(done){

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/logout",
			};

			// console.log("options:");
			// console.log(util.inspect(options, { showHidden: false, depth: null }));
			request.post(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should not logout, no session JSON RESPONSE==> " + _body);

				_res.should.have.status(403);
				done();
			});
		});



		it('should not authenticate user, wrong email', function(done){

			//create test user.
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/login",
				form: {
					email: "WRONG_EMAIL",
					password: user.password
				}
			};

			// console.log("options:");
			// console.log(util.inspect(options, { showHidden: false, depth: null }));
			request.post(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should not authenticate user, wrong email JSON RESPONSE==> " + _body);

				_res.should.have.status(401);
				console.log(_body);

				done();
				
			});
		});

		it('should not authenticate user, no email', function(done){

			//create test user.
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/login",
				form: {
					password: user.password
				}
			};

			// console.log("options:");
			// console.log(util.inspect(options, { showHidden: false, depth: null }));
			request.post(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should not authenticate user, no email JSON RESPONSE==> " + _body);

				_res.should.have.status(401);
				console.log(_body);

				done();
			});
		});		


		it('should not authenticate user, wrong password', function(done){

			//create test user.
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/login",
				form: {
					email: user.email,
					password: "WRONG_PASSWORD"
				}
			};

			// console.log("options:");
			// console.log(util.inspect(options, { showHidden: false, depth: null }));
			request.post(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should not authenticate user, wrong password JSON RESPONSE==> " + _body);

				_res.should.have.status(401);
				console.log(_body);

				done();
				
			});
		});

		it('should not authenticate user, no password', function(done){

			//create test user.
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/login",
				form: {
					email: user.email
				}
			};

			// console.log("options:");
			// console.log(util.inspect(options, { showHidden: false, depth: null }));
			request.post(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should not authenticate user, no password JSON RESPONSE==> " + _body);

				_res.should.have.status(401);
				console.log(_body);

				done();
				
			});
		});

	});


	after(function(done){

		console.log();
		console.log('========== end auth-test ========== ');
		console.log();

		done();
	});	

});







