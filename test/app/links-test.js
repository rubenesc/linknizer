var assert = require('assert');
var request = require('request');
var app = require('../../app');
var should = require('should');
var prettyjson = require('prettyjson');
var mongoose = require('mongoose');
var	Link = mongoose.model('Link');
var	Category = mongoose.model('Category');
var	User = mongoose.model('User');
var LinkFactory = require("../helpers/link-factory");
var UserFactory = require("../helpers/user-factory");
var util = require("util");

var env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env];

/**
	tests:
	
	--clean links db
	--clean users db

	create a new user ------------------------ POST 201 
	authenticate user ------------------------ POST 200

	create a new category -------------------- POST 201               
	create a new link ------------------------ POST 201               
	find a link by id ----------------------- GET  200
	update a link --------------------------- PUT  200
	update a link url ----------------------- PUT  200
	delete a link --------------------------- DELETE 200
	not find the deleted link ---------------- GET 404

	--clean links db
	not create a new link, no url ------------ POST 400
	not create a new link, invalid image ----- POST 400
	
	--clean links db
	create 10 links for user1 ---------------- POST 201
	list 10 links for user1 ------------------ GET  200
	list 5 links for user1 ------------------- GET  200
	list 4 links for user1 and category 1 ---- GET  200

**/

describe('links controller, ', function() {

	var user;
	var userId;

	var categoryObj1 = null;
	var categoryObj2 = null;
	var categoryObj3 = null;
	var numCategories = 10
	var categories = [];

	var createdLinks, linkUpatedObj, link, linkObj, categoryNum;

	var user = null;

	describe('setup user to test', function() {

		var link = null;    		//link Obj 
		var linkObj = null; 		//link Obj returned from create api.
		var linkUpatedObj = null; 	//link Obj returned from update api.

		before(function(done) {

			console.log();
			util.debug('========== start links-test ========== ');

			//test user
			user = UserFactory.create('john.doe@link.com', 'john.doe', 'John Doe', '1234');

			(LinkFactory.cleanLinksCategoriesAndUsers(done))();

		});
	
		it('should create a new user', function(done){

			console.log();
			util.debug("should create a new user");

			request.post(UserFactory.optionsSignup(user),
					UserFactory.shouldCreateNewUser(user.username, done));
		});


		it('should authenticate user', function(done){

			console.log();
			util.debug("should authenticate user");

			request.post(UserFactory.optionsLogin(user.email, user.password),
				UserFactory.shouldAuthenticateUser(done));
		});


	});

	describe('controller /api/links', function() {

		it('it should create {0} categories for user1'.format(numCategories), function(done){

			console.log();
			util.debug("it should create {0} categories for user1".format(numCategories));

			var count = 0,
				options,
				category;

			var numCategory = 1;  //for "category 1"
			for (var i=1; i <= numCategories; i++){

				category = {name: "category {0}".format(i) };

				options = {
					url: "http://localhost:" + app.settings.port + "/api/categories",
					form: category
				};

				var categoryObj;
				request.post(options, function(err, _res, _body){

					if (err) return done(err);

					_res.should.have.status(201);
					util.debug("created category: " + count + ", out of: " + numCategories);
					count++;

					//retrieve category object.
					categoryObj = JSON.parse(_body).category;

					categoryObj.should.have.be.a('object');
					categoryObj.should.have.property('id');
					categoryObj.should.have.property('user');
					// categoryObj.name.should.be.equal(category.name);
					categories.push(categoryObj);

					if (count === numCategories){
						util.debug( "Done! {0} categories created.".format(numCategories) );

						categoryObj1 = categories[0];
						categoryObj2 = categories[1];
						categoryObj3 = categories[2];

						done();
					}

				});

			}

		});		

		it('should create a new link', function(done){

			console.log();
			util.debug("should create a new link, category[{0}]".format(categoryObj1.id));

			link = LinkFactory.create( 
				"http://en.wikipedia.org/wiki/Andromeda_Galaxy", "Andromeda Galaxy", categoryObj1.id, "tag1, tag2");			

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/links",
				form: link
			};

			request.post(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should create a new link JSON RESPONSE==> " + _body);

				// HTTP/1.1 201 CREATED
				// Location: https://www.googleapis.com/tasks/v1/lists/taskListID/tasks/newTaskID			
				_res.should.have.status(201);
				_res.should.be.json;

				//retrieve the link object.
				linkObj = JSON.parse(_body).link;

				linkObj.should.have.be.a('object');
				linkObj.should.have.property('id');
				linkObj.should.have.property('url');

				linkObj.title.should.be.equal(link.title);
				linkObj.category.should.be.equal(link.category);
				linkObj.tags.length.should.be.equal(link.tags.split(',').length);

				done();
				
			});

		});


		it ('should find a link by id', function(done){

			console.log();
			util.debug("should find a link by id");

			//lets retrive the newly created object
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/links/" + linkObj.id
			};

			request(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should find a link by id JSON RESPONSE==> " + _body);

				_res.should.have.status(200);
				_res.should.be.json;
				

				var _linkObj = JSON.parse(_body).link;
				
				_linkObj.should.be.a('object');
				_linkObj.should.have.property('id');

				//Verify that the id and url are the same.
				_linkObj.id.should.equal(linkObj.id);
				_linkObj.url.toLowerCase().should.equal(linkObj.url.toLowerCase());
				_linkObj.title.should.be.equal(linkObj.title);
				_linkObj.category.should.be.equal(linkObj.category);
				_linkObj.tags.length.should.be.equal(linkObj.tags.length); //linkObj.tags is an array, because we retrieved it from the server

				_linkObj.user.username.should.be.equal(user.username.toLowerCase());

				done();

			});

		});

		it ('should update a link', function(done){

			console.log();
			util.debug("should update a link");

			linkObj.title = linkObj.title + " updated";
			linkObj.category = categoryObj2.id;
			linkObj.tags = "tag2, tag3, tag1"

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/links/" + linkObj.id,
				form: linkObj
			};

			request.put(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should update a link JSON RESPONSE==> " + body);

				res.should.have.status(200);
				res.should.be.json;

				var respLinkObj = JSON.parse(body).link;
				
				respLinkObj.should.be.a('object');
				respLinkObj.should.have.property('id');

				//Verify that the id and url are the same.
				respLinkObj.id.should.equal(linkObj.id);
				respLinkObj.url.toLowerCase().should.equal(linkObj.url.toLowerCase());
				respLinkObj.title.should.be.equal(linkObj.title);
				respLinkObj.category.should.be.equal(linkObj.category);
				respLinkObj.tags.length.should.be.equal(linkObj.tags.split(',').length);

				respLinkObj.user.username.should.be.equal(user.username.toLowerCase());

				done();

			});

		});

		it ('should update a link url', function(done){

			console.log();
			util.debug("should update a link url");

			linkObj.url = "http://en.wikipedia.org/wiki/Triangulum_Galaxy"
			linkObj.title = "Triangulum Galaxy";
			linkObj.category = categoryObj3.id;
			linkObj.tags = "tag0";

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/links/" + linkObj.id,
				form: linkObj
			};

			request.put(options, function(err, res, body){

				if (err){
					done(err);
				} else {

					console.log("== should update a link url JSON RESPONSE==> " + body);
					
					res.should.have.status(200);
					res.should.be.json;

					//set the response in an object for future tests
					linkUpatedObj = JSON.parse(body).link;
					
					linkUpatedObj.should.be.a('object');
					linkUpatedObj.should.have.property('id');

					//Verify that the id and url are the same.
					linkUpatedObj.id.should.equal(linkObj.id);
					linkUpatedObj.should.have.property('url');
					linkUpatedObj.title.should.be.equal(linkObj.title);
					linkUpatedObj.category.should.be.equal(linkObj.category);
					linkUpatedObj.tags.length.should.be.equal(linkObj.tags.split(',').length);
					linkUpatedObj.url.should.be.equal(linkObj.url);

					linkUpatedObj.user.username.should.be.equal(user.username.toLowerCase());

					done();
				}

			});

		});

		it ('should delete a link', function(done){

			console.log();
			util.debug("should delete a link");

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/links/" + linkObj.id
			};

			request.del(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should delete a link JSON RESPONSE==> " + body);

				res.should.have.status(200);
				done();

			});

		});

		it ('should not find the deleted link', function(done){

			console.log();
			util.debug("should not find the deleted link");

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/links/" + linkObj.id
			};

			//now lets see if we can retrieve the deleted user
			request(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not find the deleted link JSON RESPONSE==> " + body);

				//we should get a 404 resourcer not found
				res.should.have.status(404);
				res.should.be.json;

				var _linkObj = JSON.parse(body);
				console.log(_linkObj);
				done();

			});
		});


		after(function(){

		});

		//end describe
	});

	describe('controller', function(){

		var link;

		before(function(done){

			(LinkFactory.cleanLinks(done))();	

		});


		it('should not create a new link, no url', function(done){

			console.log();
			util.debug("should not create a new link, no url");

			//test link
			var incompleteLink = LinkFactory.create( 
				null, "black top", categoryObj1.id, "tag1, tag2");			

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/links",
				form: incompleteLink
			};

			request.post(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not create a new link, no url JSON RESPONSE==> " + body);

				//Bad request
				res.should.have.status(400);
				res.should.be.json;
				var obj = JSON.parse(body);
				console.log(obj);
				done();

			});
		});


		it('should not create a new link, invalid url', function(done){

			console.log();
			util.debug("should not create a new link, invalid image");

			//test link
			link = LinkFactory.create( 
				"abcdefg", "green pants", categoryObj2.id, "tag1");			

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/links",
				form: link
			};

			request.post(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not create a new link, invalid image JSON RESPONSE==> " + body);

				//Bad request
				res.should.have.status(400);
				res.should.be.json;

				var obj = JSON.parse(body);
				console.log(obj);
				done();
			});

		});

		//end describe
	});


	describe("list user's links: ", function(){

		var link;
		var numLinks = 10;
		var numLinks2 = numLinks/2; //5
		var numLinksCategory1 = numLinks2-1; //4
		var createdLinks = null;
		
		before(function(done){

			(LinkFactory.cleanLinksAndCategories(done))()

		});

		it('it should create {0} categories for user1'.format(numCategories), function(done){

			console.log();
			util.debug("it should create {0} categories for user1".format(numCategories));

			var count = 0,
				options,
				category;

			var numCategory = 1;  //for "category 1"
			for (var i=1; i <= numCategories; i++){

				category = {name: "category {0}".format(i) };

				options = {
					url: "http://localhost:" + app.settings.port + "/api/categories",
					form: category
				};

				var categoryObj;
				request.post(options, function(err, _res, _body){

					if (err) return done(err);

					_res.should.have.status(201);
					util.debug("created category: " + count + ", out of: " + numCategories);
					count++;

					//retrieve category object.
					categoryObj = JSON.parse(_body).category;

					categoryObj.should.have.be.a('object');
					categoryObj.should.have.property('id');
					categoryObj.should.have.property('user');
					categories.push(categoryObj);

					if (count === numCategories){
						util.debug( "Done! {0} categories created.".format(numCategories) );

						categoryObj1 = categories[0];
						categoryObj2 = categories[1];
						categoryObj3 = categories[2];

						done();
					}

				});

			}

		});		



		it('it should create {0} links for user1'.format(numLinks), function(done){

			console.log();
			util.debug("it should create {0} links for user1".format(numLinks));

			var count = 0,
				options,
				link;

			var numCategory = 1;  //for "category 1"
			for (var i=1; i <= numLinks; i++){

				categoryNum = (i <= numLinksCategory1)?1:2;

	  		    var linkUrl = "http://somedomain.com/link_{0}.jpeg".format(i);

				link = LinkFactory.create( 
					linkUrl, "link {0}".format(i), categories[categoryNum-1].id, "tag {0}".format(i));			


				util.debug("==aaa=> [{0}]".format(link.category));
				var options = {
					url: "http://localhost:" + app.settings.port + "/api/links",
					form: link
				};

				request.post(options, function(err, _res, _body){

					if (err) return done(err);

					_res.should.have.status(201);
					util.debug("created link: " + count + ", out of: " + numLinks);
					count++;
					if (count === numLinks){
						util.debug( "Done! {0} links created.".format(numLinks) );
						done();
					}

				});

			}

		});


		it ('should list {0} links for user1'.format(numLinks), function(done){

			console.log();
			util.debug("should list {0} links for user1".format(numLinks));

			//lets retrive the newly created object
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/links"
			};

			//get
			request(options, function(err, res, body){

				if (err) return done(err);

				util.debug("== should list {0} links for user1 JSON RESPONSE==> ".format(numLinks) + body);
				res.should.have.status(200);
				res.should.be.json;

				var data = JSON.parse(body);
				util.debug("retrieved '{0}' links.".format(data.links.length));
				(data.links.length).should.equal(numLinks);

				//verify that links belong to user, and that
				//they are ordered in reverse chronological order.
				var previousLinkTime;
				data.links.forEach(function(link){
						
					(user.username).should.equal(link.user.username);
					if (previousLinkTime 
						&& (previousLinkTime < link.createdDate)){
						done(new Error("list should be in reverse chronological order"));
					} 

					previousLinkTime = link.createdDate;
				});

				//save links for future tests
				createdLinks = data.links;

				done();
				
			});

		});		


		it ('should list {0} links for user1'.format(numLinks2), function(done){

			console.log();
			util.debug("should list {0} links for user1".format(numLinks2));


			//lets retrive the newly created object
			var options = {
				url: "http://localhost:{0}/api/links?limit={1}".format(app.settings.port, 5)
			};

			//get
			request(options, function(err, res, body){

				if (err) return done(err);

				// console.log("== should list {0} links for user1 JSON RESPONSE==> ".format(numLinks2) + body);
				res.should.have.status(200);
				res.should.be.json;

				var data = JSON.parse(body);
				util.debug("retrieved '{0}' links.".format(data.links.length));
				(data.links.length).should.equal(numLinks2);

				//verify that links belong to user
				var previousLinkTime;
				data.links.forEach(function(link){
					
					(user.username).should.equal(link.user.username);
					if (previousLinkTime 
						&& (previousLinkTime < link.createdDate)){
						done(new Error("list should be in reverse chronological order"));
					} 

					previousLinkTime = link.createdDate;
				});				

				done();
			});

		});



		it ('should list {0} links for user1 and category 1'.format(numLinksCategory1), function(done){

			console.log();
			util.debug("should list {0} links for user1 and category".format(numLinksCategory1));

			//lets retrive the newly created object
			var options = {
				url: "http://localhost:{0}/api/links?category={1}".format(app.settings.port, categoryObj1.id),
				form: {category: categoryObj1.id}				
			};

			//get
			request(options, function(err, res, body){

				if (err) return done(err);

				// console.log("== should list {0} links for user1 JSON RESPONSE==> ".format(numLinks2) + body);
				res.should.have.status(200);
				res.should.be.json;

				var data = JSON.parse(body);
				util.debug("retrieved '{0}' links.".format(data.links.length));
				(data.links.length).should.equal(numLinksCategory1);

				//verify that links belong to user
				var previousLinkTime;
				data.links.forEach(function(link){
					
					(user.username).should.equal(link.user.username);
					categoryObj1.id.should.equal(link.category);

					if (previousLinkTime 
						&& (previousLinkTime < link.createdDate)){
						done(new Error("list should be in reverse chronological order"));
					} 

					previousLinkTime = link.createdDate;
				});			
					
				done();
			});

		});		


		it ('should paginate links', function(done){

			console.log();
			util.debug("should paginate links");

			var options = {
				url: "http://localhost:{0}/api/links?limit=4".format(app.settings.port),
			};

			//#1
			var count = 0;
			request(options, function(err, res, body){

				if (err) return done(err);

				res.should.have.status(200);

				var data = JSON.parse(body);
				util.debug("retrieved '{0}' links, page: [{1}], pages: [{2}]".format(data.links.length, data.page, data.pages));
				data.links.forEach(function(link, index){
					if (link.id !== createdLinks[count].id) 
						return done (new Error("pagination order does not match") );

					count ++;
				});


				//#2
				var options = {
					url: "http://localhost:{0}/api/links?limit=4&page=2".format(app.settings.port),
				};
				request(options, function(err, res, body){

					if (err) return done(err);

					res.should.have.status(200);

					var data = JSON.parse(body);
					util.debug("retrieved '{0}' links, page: [{1}], pages: [{2}]".format(data.links.length, data.page, data.pages));
					data.links.forEach(function(link, index){

						if (link.id !== createdLinks[count].id) 
							return done (new Error("pagination order does not match") );

						count ++;
					});

					//#3
					var options = {
						url: "http://localhost:{0}/api/links?limit=4&page=3".format(app.settings.port),
					};
					request(options, function(err, res, body){

						if (err) return done(err);

						res.should.have.status(200);

						var data = JSON.parse(body);
						util.debug("retrieved '{0}' links, page: [{1}], pages: [{2}]".format(data.links.length, data.page, data.pages));
						data.links.forEach(function(link, index){
							if (link.id !== createdLinks[count].id) 
								return done (new Error("pagination order does not match") );

							count ++;
						});

						if (count !== createdLinks.length)
							return done (new Error("pagination wrong number of links"));

						done();
					});

				});

			});

		});		

		// end describe
	});

	after(function(done){

		console.log();
		util.debug('========== end links-test ========== ');
		console.log();

		done();
	});	

});

