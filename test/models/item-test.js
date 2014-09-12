var assert = require('assert');
var should = require('should');
var prettyjson = require('prettyjson');
var util = require('util');
var mongoose = require('mongoose');
var Item = mongoose.model('Item');
var User = mongoose.model('User');
var ItemFactory = require("../helpers/user-factory");
var UserFactory = require("../helpers/user-factory");


describe('item', function() {

	describe('persistence', function() {

		var item = null;
		var user = null;

		before(function(done) {

			console.log();
			console.log('========== start item-test ========== ');

			user = new User(
				UserFactory.create(
				'john.doe@link.com', 'john.DOE',
				'John Doe', '1234'));

			console.log();
			console.log('cleaning up the users collection');
			User.remove(function(err) {

				if(err) return done(err);

				user.save(function(err, data) {

					if(err) return done(err);
					data.should.have.be.a('object');
					data.should.have.property('_id');
					done();
				});

			});

		});


		it('should create a new item', function(done) {

			console.log();
			util.debug("should create a new item ");

			item = new Item ({
				url: "https://bucket.s3.amazonaws.com/130801/c6c6/000007/i/1308017n.jpeg",
				title: "black top",
				tags: "tag1, tag2",
				category: "category 1",
				user: user
			});

			item.save(function(err, data) {

				if(err) return done(err);			

				util.debug("should create a new item Response: " + data);

				data.should.have.be.a('object');
				data.should.have.property('_id');
				item = data; 
				done();
			});
		});


		it('should remove _ in ids', function(done) {

			console.log();
			util.debug("should remove _ in ids");

			Item.loadById(item._id, function(err, data) {

				if(err) return done(err);			

				util.debug("should remove _ in ids Response: " + data);

				data.should.have.be.a('object');
				data.should.have.property('_id');

				var itemToClient = data.toClient();
				itemToClient.should.have.property('id');
				var userToClient = itemToClient.user;
				userToClient.should.have.property('id');

				done();

			});

		});

	});

	after(function(done){

		console.log();
		console.log('========== end item-test ========== ');
		console.log();

		done();
	});	

});