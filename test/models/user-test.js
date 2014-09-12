var assert = require('assert');
var should = require('should');
var prettyjson = require('prettyjson');
var util = require("util");
var mongoose = require('mongoose');
var User = mongoose.model('User');
var UserFactory = require("../helpers/user-factory");

describe('user', function() {


	describe('persistence', function() {

		var user = null;
		var username = null;

		var duplicatedUser = null;

		before(function(done) {

			console.log();
			console.log('========== start user-test ========== ');

			//test user
			user = new User(
				UserFactory.create(
				'john.doe@link.com', 'john.DOE',
				'John Doe', '1234'));

			duplicatedUser = new User(
				UserFactory.create(
				'john.doe@link.com', 'john.DOE',
				'John Doe', '1234'));

			username = user.username;

			console.log();
			console.log('cleaning up the users collection');
			User.remove(function(err) {

				if (err) return done(err);

				done();

			});

		});

		it('should create a new user', function(done) {
			user.save(function(err, data) {

				if (err) return done(err);

				data.should.have.be.a('object');
				data.should.have.property('_id');
				done();
			});
		});

		it('should not create a duplicate username', function(done){

			//lets change the email so we can validate the username
			duplicatedUser.email = duplicatedUser.email + '.co';
			duplicatedUser.username = user.username;

			duplicatedUser.save(function(err, data) {

				err.should.have.be.a('object');
				err.should.have.property('code');
				err.code.should.be.equal(11000);
				done();

			});

		});

		it('should not create a duplicate email', function(done){

			//lets change the username so we can validate the email
			duplicatedUser.username = duplicatedUser.username + '2';
			duplicatedUser.email = user.email;

			duplicatedUser.save(function(err, data) {

				err.should.have.be.a('object');
				err.should.have.property('code');
				err.code.should.be.equal(11000);
				done();

			});

		});

		it ('should validate email', function(done){

			duplicatedUser.username = user.username + "2";
			duplicatedUser.email = user.email + '.co$'; //invalid email

			duplicatedUser.save(function(err, data){

				err.should.have.be.a('object');
				err.name.should.be.equal('ValidationError');
				err.errors['email']['path'].should.be.equal('email');
				//console.log('invalid ' + err.errors['email']['path'] + " " + duplicatedUser['email']);

				done();

			});

		});


		it ('should validate username', function(done){

			duplicatedUser.username = "** arrggg $$$";
			duplicatedUser.email = 'test@user.com'; 

			duplicatedUser.save(function(err, data){

				err.should.have.be.a('object');
				err.name.should.be.equal('ValidationError');
				err.errors['username']['path'].should.be.equal('username');
				//console.log('invalid ' + err.errors['username']['path'] + ": " + duplicatedUser['username']);

				done();

			});
			
		});
	});

	after(function(done){

		console.log();
		console.log('========== end user-test ========== ');
		console.log();

		done();
	});	

});