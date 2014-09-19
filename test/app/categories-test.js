var assert = require('assert');
var request = require('request');
var app = require('../../app');
var should = require('should');
var prettyjson = require('prettyjson');
var mongoose = require('mongoose');
var	Category = mongoose.model('Category');
var LinkFactory = require("../helpers/link-factory");
var	User = mongoose.model('User');
var UserFactory = require("../helpers/user-factory");
var CategoryHelper = require("../helpers/category-helper");
var util = require("util");
var fs = require('fs');

var env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env];

/**

	--clean categories db
	--clean users db

	create a new category ------------------------- POST 201 
	authenticate user ----------------------------- POST 200

	create a new link ----------------------------- POST 201               
	find a category by id ------------------------- GET  200
	update a category ----------------------------- PUT  200
	delete a category ----------------------------- DELETE 200
	not find the deleted category ----------------- GET 404

	--clean categories db
	create 10 categories for user1 ---------------- POST 201
	list 10 categories for user1 ------------------ GET  200

**/

describe('categories controller, ', function() {

	var user;
	var userId;
	var username = 'john.DOE';

	describe('setup user to test', function() {

		var user = null;

		before(function(done){

			console.log();
			console.log('========== start categories-test ========== ');

			//test user
			user = UserFactory.create(
				'john.doe@link.com', username,
				'John Doe', '1234');

			//clean category and user tables
			(CategoryHelper.cleanCategoriesAndUsers(done))(); 

		});

		it('should create a new user', function(done){

			console.log();
			util.debug("should create a new user");

			request.post(UserFactory.optionsSignup(user),
					UserFactory.shouldCreateNewUser(username, done));
		});


		it('should authenticate user', function(done){

			console.log();
			util.debug("should authenticate user");

			request.post(UserFactory.optionsLogin(user.email, user.password),
				UserFactory.shouldAuthenticateUser(done));
		});

	});

	describe('controller /api/categories', function() {

		var newCategory = null;
		var categoryObj = null;

		it('should create a new category', function(done){

			console.log();
			util.debug("should create a new category");

			newCategory = {name: "javascript"};

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/categories",
				form: newCategory
			};

			request.post(options, function(err, res, body){

				if (err) return done(err);

				util.debug("== should create a new category JSON RESPONSE==> " + body);

				util.log(body);

				// HTTP/1.1 201 CREATED
				// Location: https://www.googleapis.com/tasks/v1/lists/taskListID/tasks/newTaskID			

				res.should.have.status(201);
				res.should.be.json;

				//retrieve category object.
				categoryObj = JSON.parse(body).category;

				categoryObj.should.have.be.a('object');
				categoryObj.should.have.property('id');
				categoryObj.should.have.property('user');

				categoryObj.name.should.be.equal(newCategory.name);

				done();
				
			});

		});


		it ('should find a category by id', function(done){

			console.log();
			util.debug("should find a category by id");

			//lets retrive the newly created object
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/categories/" + categoryObj.id
			};

			var _this = this;

			request(options, function(err, _res, _body){

				if (err) return done(err);

				util.debug("== should find a category by id JSON RESPONSE==> " + _body);

				_res.should.have.status(200);
				_res.should.be.json;
				
				var _categoryObj = JSON.parse(_body).category;
				
				_categoryObj.should.be.a('object');
				_categoryObj.should.have.property('id');

				//Verify that the id and url are the same.
				_categoryObj.id.should.equal(categoryObj.id);
				_categoryObj.name.should.be.equal(categoryObj.name);
				_categoryObj.user.username.should.be.equal(username.toLowerCase());

				done();

			});

		});

		it ('should update a category', function(done){

			console.log();
			util.debug("should update a category");

			categoryObj.name = categoryObj.name + " updated";

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/categories/" + categoryObj.id,
				form: categoryObj
			};

			request.put(options, function(err, res, body){

				if (err) return done(err);

				util.debug("== should update a category JSON RESPONSE==> " + body);

				res.should.have.status(200);
				res.should.be.json;

				var respcategoryObj = JSON.parse(body).category;
				
				respcategoryObj.should.be.a('object');
				respcategoryObj.should.have.property('id');

				//Verify that the id and url are the same.
				respcategoryObj.id.should.equal(categoryObj.id);
				respcategoryObj.name.should.be.equal(categoryObj.name);

				respcategoryObj.user.username.should.be.equal(username.toLowerCase());

				done();

			});

		});

		it ('should delete a category', function(done){

			console.log();
			util.debug("should delete a category");

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/categories/" + categoryObj.id
			};

			request.del(options, function(err, res, body){

				if (err) return done(err);

				util.debug("== should delete a category JSON RESPONSE==> " + body);

				res.should.have.status(200);
				done();

			});

		});

		it ('should not find the deleted category', function(done){

			console.log();
			util.debug("should not find the deleted category");

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/categories/" + categoryObj.id
			};

			//now lets see if we can retrieve the deleted user
			request(options, function(err, res, body){

				if (err) return done(err);

				util.debug("== should not find the deleted category JSON RESPONSE==> " + body);

				//we should get a 404 resourcer not found
				res.should.have.status(404);
				res.should.be.json;

				var _categoryObj = JSON.parse(body);
				util.debug("error message: " + _categoryObj.error.message);
				done();

			});
		});

		//end describe
	});

	describe('controller /api/categories list', function() {

		var numCategories = 10;

		before(function(done){

			//clean categories
			(CategoryHelper.cleanCategories(done))(); 

		});


		it('should create 10 categories for user1'.format(numCategories), function(done){

			console.log();
			util.debug("should create 10 categories for user1".format(numCategories));

			var count = 0,
				options,
				category;

			var numCategory = 1;  //for "category 1"
			for (var i=1; i <= numCategories; i++){

				category = {name: "category {0}".format(i) };

				options = {
					url: "http://localhost:{0}/api/categories".format(app.settings.port),
					form: category
				};
				
				request.post(options, function(err, _res, _body){

					if (err) return done(err);

					_res.should.have.status(201);
					util.debug("created category: " + count + ", out of: " + numCategories);
					count++;
					if (count === numCategories){
						util.debug( "Done! {0} categories created.".format(numCategories) );
						done();
					}

				});

			}

		});		


		it ('should list 10 categories for user1'.format(numCategories), function(done){

			console.log();
			util.debug("should list 10 categories for user1".format(numCategories));

			//lets retrive the newly created object
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/categories"
			};

			//get
			request(options, function(err, res, body){

				if (err) return done(err);

				util.debug("== should list 10 categories for user1 JSON RESPONSE==> ".format(numCategories) + body);
				res.should.have.status(200);
				res.should.be.json;

				var data = JSON.parse(body);
				util.debug("retrieved '{0}' links.".format(data.categories.length));
				(data.categories.length).should.equal(numCategories);

				//save categories for future tests
				createdLinks = data.categories;

				done();
				
			});

		});				


		after(function(done){

			console.log();
			util.debug('========== end categories-test ========== ');
			console.log();

			done();

		});

		//end describe
	});

})

