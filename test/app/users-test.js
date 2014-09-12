var assert = require('assert');
var request = require('request');
var app = require('../../app');
var should = require('should');
var prettyjson = require('prettyjson');
var mongoose = require('mongoose');
var	User = mongoose.model('User');
var UserFactory = require("../helpers/user-factory");


/**
	tests:
	
	--clean users db
	create a new user ------------------------ POST 201               
	find a user ------------------------------ GET  200
	update a user ---------------------------- PUT  200
	not allow users with duplicate usernames - POST 400
	not allow users with duplicate emails ---- POST 400
	delete a user ---------------------------- DELETE 200
	not find the deleted user ---------------- GET 404

	--clean users db
	not create new user, no username --------- POST 400
	not create new user, no email ------------ POST 400
	not create new user, invalid email ------- POST 400
	not create new user, no data sent -------- POST 400

**/


describe('users', function(){

	describe('controller /api/users', function(){

		var user = null;
		var username = null;

		before(function(done){

			console.log();
			console.log('========== start users-test ========== ');

			//test user
			user = UserFactory.create(
				'john.doe@link.com', 'john.DOE',
				'John Doe', '1234');

			username = user.username;

			console.log();
			console.log('cleaning up the "users" MongoDB collection');
			User.collection.remove(function(err){

				if (err) return done(err);
				
				done();

			});				

		});
 
		it('should create a new user', function(done){

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

				_obj.should.have.be.a('object');
				_obj.should.have.property('id');

				//The usernames are stored lowercase.
				_obj.username.toLowerCase().should.equal(username.toLowerCase());
				done();
				
			});
		});

		it ('should find a user', function(done){

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/users/"+username
			};

			request(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should find a user JSON RESPONSE==> " + _body);

				_res.should.have.status(200);
				_res.should.be.json;
				
				var _obj = JSON.parse(_body).user;
				console.log(_obj);

				_obj.should.be.a('object');
				_obj.should.have.property('id');

				//The usernames are stored lowercase.
				_obj.username.toLowerCase().should.equal(username.toLowerCase());
				_obj.email.should.be.equal(user.email);

				done();
				
			});

		});

		it ('should update a user', function(done){

			var newEmail = 'john.doe@link.com.co';
			var newName = 'John Doe 2';

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/users/"+username,
				form: {
					email: newEmail,
					name: newName
				}
			};

			request.put(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should update a user JSON RESPONSE==> " + body);

				res.should.have.status(200);
				res.should.be.json;

				var obj = JSON.parse(body).user;

				obj.should.be.a('object');
				obj.should.have.property('id');

				//The usernames are stored lowercase.
				obj.username.toLowerCase().should.equal(username.toLowerCase());
				obj.email.should.be.equal(newEmail);
				obj.name.should.be.equal(newName);

				done();
				
			});
		});


		it ('should not allow users with duplicate usernames', function(done){

			var duplicateEmail = UserFactory.create(
				'some@email.com', username,
				'John Doe', '1234');

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/signup",
				form: duplicateEmail
			};

			request.post(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not allow users with duplicate usernames JSON RESPONSE==> " + body);

				res.should.have.status(400);  //bad request
				res.should.be.json;

				var obj = JSON.parse(body);
				obj.should.be.a('object');
				obj.should.have.property('error');

				done();
				
			});

		});



		it ('should not allow users with duplicate emails', function(done){

			var duplicateUsername = UserFactory.create(
				'john.doe@link.com.co', 'someUsername',
				'John Doe', '1234');

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/signup",
				form: duplicateUsername
			};

			request.post(options, function(err, res, body){
				
				if (err) return done(err);

				console.log("== should not allow users with duplicate emails JSON RESPONSE==> " + body);

				res.should.have.status(400);  //bad request
				res.should.be.json;

				var obj = JSON.parse(body);
				obj.should.be.a('object');
				obj.should.have.property('error');
				
				done();
				
			});

		});		
		
		//delete new user
		it ('should delete a user', function(done){

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/users/"+username,
			};

			request.del(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should delete a user JSON RESPONSE==> " + body);
				
				res.should.have.status(200);
				done();
				
			});

		});


		it ('should not find the deleted user', function(done){

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/users/"+username,
			};

			//now lets see if we can retrieve the deleted user
			request(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not find the deleted user JSON RESPONSE==> " + body);

				//we should get a 404 resource not found
				res.should.have.status(404);
				res.should.be.json;

				var obj = JSON.parse(body);
				obj.should.be.a('object');
				obj.should.have.property('error');

				done();
			});
		});


		after(function(){

		});

	});



	describe('controller', function(){

		var username = null;
		var user = null;

		before(function(done){

			//test user
			var user = UserFactory.create(
				'john.doe@link.com', 'john.DOE',
				'John Doe', '1234');

			username = user.username;			

			console.log();
			console.log('cleaning up the users collection');
			User.collection.remove(function(err){
				
				if (err) return done(err);
				
				done();
			});				

		});


		it('should not create new user, no username', function(done){

			var incompleteUser = UserFactory.create(
				'john.doe@link.com', null,
				'John Doe', '1234');

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/signup",
				form: incompleteUser
			};

			request.post(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not create new user, no username JSON RESPONSE==> " + body);

				res.should.have.status(400);
				res.should.be.json;

				var obj = JSON.parse(body);
				obj.should.be.a('object');
				obj.should.have.property('error');

				done();

			});
		});

		it('should not create new user, no email', function(done){

			var incompleteUser = UserFactory.create(
				null, 'john.DOE',
				'John Doe', '1234');

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/signup",
				form: incompleteUser
			};

			request.post(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not create new user, no email JSON RESPONSE==> " + body);

				res.should.have.status(400);
				res.should.be.json;

				var obj = JSON.parse(body);
				obj.should.be.a('object');
				obj.should.have.property('error');

				done();

			});
		});

		
		it('should not create new user, invalid email', function(done){

			var invalidUser = UserFactory.create(
				'john.doe@@link.com', 'john DOE',
				'John Doe', '1234');

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/signup",
				form: invalidUser
			};

			request.post(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not create new user, invalid email JSON RESPONSE==> " + body);

				res.should.have.status(400);
				res.should.be.json;

				var obj = JSON.parse(body);
				obj.should.be.a('object');
				obj.should.have.property('error');

				done();
			});
		});

		it('should not create new user, no data sent', function(done){

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/signup",
			};

			request.post(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not create new user, no data sent JSON RESPONSE==> " + body);

				res.should.have.status(400);
				res.should.be.json;

				var obj = JSON.parse(body);
				obj.should.be.a('object');
				obj.should.have.property('error');

				done();
			});
		});

	});

	after(function(done){

		console.log();
		console.log('========== end users-test ========== ');
		console.log();

		done();
	});	

});