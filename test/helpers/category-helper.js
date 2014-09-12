
var app = require('../../app');
var mongoose = require('mongoose');
var	Category = mongoose.model('Category');
var	User = mongoose.model('User');
// var UserFactory = require("../helpers/user-factory");
var util = require("util");

var CategoryHelper = {

	cleanCategories: function(done){

		function clean(){

			console.log();
			util.debug('cleaning up the "categories" MongoDB collection');

			Category.collection.remove(function(err){

				if (err) return done(err);
				
				done();
			});							

		}

		return clean;

	},

	cleanCategoriesAndUsers: function(done){

		function clean(){

			console.log();
			util.debug('cleaning up the "categories" MongoDB collection');

			Category.collection.remove(function(err){

				if (err) return done(err);

				console.log();
				util.debug('cleaning up the "users" MongoDB collection for authentication tests');

				User.collection.remove(function(err){

					if (err) return done(err);

					return done();

				});
				
			});	
					
		}

		return clean;
	},

	optionsCreateCategory: function(category){
			
		var options = {
			url: "http://localhost:{0}/api/categories".format(app.settings.port),
			form: category
		};

		return options;
	},

	shouldCreateCategory: function(newCategory, done){

		var categoryObj = null;

		function validate(err, res, body){

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
				
		}

		return this;

	}







}


module.exports = CategoryHelper;