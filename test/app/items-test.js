var assert = require('assert');
var request = require('request');
var app = require('../../app');
var should = require('should');
var prettyjson = require('prettyjson');
var mongoose = require('mongoose');
var	Item = mongoose.model('Item');
var ItemFactory = require("../helpers/item-factory");
var	User = mongoose.model('User');
var UserFactory = require("../helpers/user-factory");
var util = require("util");
var fs = require('fs');

var env = process.env.NODE_ENV || 'development'
  , config = require('../../config/conf')[env];

var knox = require('knox').createClient({
    key: config.s3.key,
    secret: config.s3.secret,
    bucket: config.s3.bucket
});



/**
	tests:
	
	--clean items db
	--clean users db

	create a new user ------------------------ POST 201 
	authenticate user ------------------------ POST 200

	create a new item ------------------------ POST 201               
	find an item by id ----------------------- GET  200
	retrieve items image --------------------- GET  200
	update an item --------------------------- PUT  200
	update an item image --------------------- PUT  200
	should retrieve items updated image ------ GET  200
	delete an item --------------------------- DELETE 200
	not find the deleted item ---------------- GET 404
	not find deleted items image ------------- GET 404

	--clean items db
	not create a new item, no image ---------- POST 400
	not create a new item, invalid image ----- POST 400
	
	--clean items db
	create 10 items for user1 ---------------- POST 201
	list 10 items for user1 ------------------ GET  200
	list 5 items for user1 ------------------- GET  200
	list 4 items for user1 and category 1 ---- GET  200

**/

describe('items controller, ', function() {

	var user;
	var userId;

	describe('controller /api/items', function() {

		var item = null;    		//item Obj 
		var itemObj = null; 		//item Obj returned from create api.
		var itemUpatedObj = null; 	//item Obj returned from update api.

		before(function(done) {

			console.log();
			console.log('========== start items-test ========== ');

			console.log();
			console.log('cleaning up the "items" MongoDB collection');

			Item.collection.remove(function(err){

				if (err) return done(err);

				console.log();
				console.log('cleaning up the "users" MongoDB collection for authentication tests');
				User.collection.remove(function(err){

					if (err) return done(err);

					return done();

				});
				
			});			

		});
	
		it("should clean s3 items", function(done){
			console.log();
			util.debug("should clean s3 items");

			 knox.list(function (err, data) {

			 	if (err){
			 		done(err);
			 	} else {

			 		util.debug("# of files in s3: " + data.Contents.length);

			 		if (data.Contents.length === 0){

			 			done();

			 		} else {

				 		//extract the keys in an array 
				 		var keys = data.Contents.map(function (entry) { return entry.Key; });

						knox.deleteMultiple(keys, function (_err, _res) {

							if (err) return done(err);

							_res.should.have.status(200);

				        	knox.list(function (__err, __data) {
				        		if (__err){
				        			done(__err);
				        		} else {

							 		util.debug("# of files in s3 after delete: " + __data.Contents.length);
				        			__data.Contents.should.have.lengthOf(0);
			 						done();
				        		}
				        	});
					
						});
			 			
			 		}
			 	}

			 });

		});


		//create test user
		it("should create a new user", function(done){

			console.log();
			util.debug("should create a new user");

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

				_res.should.have.status(201);
				_res.should.be.json;

				var _obj = JSON.parse(_body).user;
				console.log(_obj);

				_obj.should.have.be.a('object');
				_obj.should.have.property('id');
				userId = _obj.id;

				//The usernames are stored lowercase.
				_obj.username.toLowerCase().should.equal(user.username.toLowerCase());
				done();
				
			});
		});

		it('should authenticate user', function(done){

			console.log();
			util.debug("should authenticate user");

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

				_res.should.have.status(200);
				_res.should.be.json;

				var _obj = JSON.parse(_body);
				console.log(_obj);
				_obj.should.have.be.a('object');

				done();
			});
		});

		it('should create a new item', function(done){

			console.log();
			util.debug("should create a new item");

  		    //test image
  		    var itemPath = __dirname + "/../fixtures/black_top.jpeg";

			item = ItemFactory.create( 
				null, "black top", "category 1", "tag1, tag2", itemPath);			

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/items",
				form: item
			};

			var req = request.post(options.url, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should create a new item JSON RESPONSE==> " + _body);

				// HTTP/1.1 201 CREATED
				// Location: https://www.googleapis.com/tasks/v1/lists/taskListID/tasks/newTaskID			
				_res.should.have.status(201);
				_res.should.be.json;

				//retrieve the item object.
				itemObj = JSON.parse(_body).item;

				itemObj.should.have.be.a('object');
				itemObj.should.have.property('id');
				itemObj.should.have.property('image');
				itemObj.image.should.have.property('url');


				itemObj.title.should.be.equal(item.title);
				itemObj.category.should.be.equal(item.category);
				itemObj.tags.length.should.be.equal(item.tags.split(',').length);

				done();
				
			});

			//create a form and set the items properties to the form.
			var form = req.form();

			for (var prop in item ){
				if (item.hasOwnProperty(prop)){
					if (item[prop]){
						form.append(prop, item[prop]);
					}
				}
			}

		});


		it ('should find an item by id', function(done){

			console.log();
			util.debug("should find an item by id");

			//lets retrive the newly created object
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/items/" + itemObj.id
			};

			request(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("== should find an item by id JSON RESPONSE==> " + _body);

				_res.should.have.status(200);
				_res.should.be.json;
				

				var _itemObj = JSON.parse(_body).item;
				
				_itemObj.should.be.a('object');
				_itemObj.should.have.property('id');

				//Verify that the id and url are the same.
				_itemObj.id.should.equal(itemObj.id);
				_itemObj.image.url.toLowerCase().should.equal(itemObj.image.url.toLowerCase());
				_itemObj.title.should.be.equal(itemObj.title);
				_itemObj.category.should.be.equal(itemObj.category);
				_itemObj.tags.length.should.be.equal(itemObj.tags.length); //itemObj.tags is an array, because we retrieved it from the server

				_itemObj.user.username.should.be.equal(user.username.toLowerCase());

				done();

			});

		});

		it ('should retrieve items image', function(done){

			console.log();
			util.debug("should retrieve items image: " + itemObj.image.url);

			var options = {
				url: itemObj.image.url
			};

			request(options, function(err, _res, _body){

				if (err) return done(err);

				_res.should.have.status(200);

				done();
			});

		});

		it ('should update an item', function(done){

			console.log();
			util.debug("should update an item");

			itemObj.title = itemObj.title + " updated";
			itemObj.category = itemObj.category + " updated";
			itemObj.tags = "tag2, tag3, tag1"

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/items/" + itemObj.id,
				form: itemObj
			};

			request.put(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should update an item JSON RESPONSE==> " + body);

				res.should.have.status(200);
				res.should.be.json;

				var respItemObj = JSON.parse(body).item;
				
				respItemObj.should.be.a('object');
				respItemObj.should.have.property('id');

				//Verify that the id and url are the same.
				respItemObj.id.should.equal(itemObj.id);
				respItemObj.image.url.toLowerCase().should.equal(itemObj.image.url.toLowerCase());
				respItemObj.title.should.be.equal(itemObj.title);
				respItemObj.category.should.be.equal(itemObj.category);
				respItemObj.tags.length.should.be.equal(itemObj.tags.split(',').length);

				respItemObj.user.username.should.be.equal(user.username.toLowerCase());

				done();

			});

		});

		it ('should update an item image', function(done){

			console.log();
			util.debug("should update an item image");

  		    var imagePath = __dirname + "/../fixtures/leather_jacket.jpeg";

  		    //Store the original image info to compare it later
  		    var originalImageInfo = itemObj.image;

			itemObj.image = fs.createReadStream(imagePath);
			itemObj.title = "leather jacket";
			itemObj.category = itemObj.category + " updated 2";
			itemObj.tags = "tag0";

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/items/" + itemObj.id,
				form: itemObj
			};

			var req = request.put(options.url, function(err, res, body){

				if (err){
					done(err);
				} else {

					console.log("== should update an item image JSON RESPONSE==> " + body);
					
					res.should.have.status(200);
					res.should.be.json;

					//set the response in an object for future tests
					itemUpatedObj = JSON.parse(body).item;
					
					itemUpatedObj.should.be.a('object');
					itemUpatedObj.should.have.property('id');

					//Verify that the id and url are the same.
					itemUpatedObj.id.should.equal(itemObj.id);
					itemUpatedObj.should.have.property('image');
					itemUpatedObj.image.should.have.property('url');
					itemUpatedObj.title.should.be.equal(itemObj.title);
					itemUpatedObj.category.should.be.equal(itemObj.category);
					itemUpatedObj.tags.length.should.be.equal(itemObj.tags.split(',').length);

					//The updated Image url has to be the same as the initial url
					itemUpatedObj.image.url.should.be.equal(originalImageInfo.url);

					itemUpatedObj.user.username.should.be.equal(user.username.toLowerCase());

					done();
				}

			});

			//create a form and set the items properties to the form.
			var form = req.form();

			for (var prop in itemObj ){
				if (itemObj.hasOwnProperty(prop)){

					// since Im updating an object I retrieved there are some 
					// paramters I dont want to send back like the 'images'
					if (itemObj[prop] && prop !== "image"){
						form.append(prop, itemObj[prop]);
					}
				}
			}

		});


		it ('should retrieve items updated image', function(done){

			console.log();
			util.debug("should retrieve items updated image: " + itemUpatedObj.image.url);

			var options = {
				url: itemUpatedObj.image.url
			};

			request(options, function(err, _res, _body){
				if (err) return done(err);

				console.log("should retrieve items updated image status: " + _res.statusCode);
				_res.should.have.status(200);

				done();
			});

		});	

		it ('should delete an item', function(done){

			console.log();
			util.debug("should delete an item");

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/items/" + itemObj.id
			};

			request.del(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should delete an item JSON RESPONSE==> " + body);

				res.should.have.status(200);
				done();

			});

		});

		it ('should not find the deleted item', function(done){

			console.log();
			util.debug("should not find the deleted item");

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/items/" + itemObj.id
			};

			//now lets see if we can retrieve the deleted user
			request(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not find the deleted item JSON RESPONSE==> " + body);

				//we should get a 404 resourcer not found
				res.should.have.status(404);
				res.should.be.json;

				var _itemObj = JSON.parse(body);
				console.log(_itemObj);
				done();

			});
		});


		it ('should not find deleted items image', function(done){

			console.log();
			util.debug("should not find deleted items image: " + itemUpatedObj.image.url);

			var options = {
				url: itemUpatedObj.image.url
			};

			request(options, function(err, _res, _body){

				if (err) return done(err);

				console.log("should not find deleted items image status: " + _res.statusCode);

				var isDeleted = (_res.statusCode === 403 
								|| _res.statusCode === 404)?true:false;

				isDeleted.should.be.ok
				// _res.should.have.status(404);

				done();
			});

		});		


		after(function(){

		});

		//end describe
	});

	describe('controller', function(){

		var item;

		before(function(done){

			console.log();
			console.log('cleaning up the "items" MongoDB collection');
			Item.collection.remove(function(err){

				if (err) return done(err);

				done();
				
			});							

		});


		it('should not create a new item, no image', function(done){

			console.log();
			util.debug("should not create a new item, no image");

			//test item
			var incompleteItem = ItemFactory.create( 
				null, "black top", "category 2", "tag1, tag2", null);			

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/items",
				form: incompleteItem
			};

			request.post(options, function(err, res, body){

				if (err) return done(err);

				console.log("== should not create a new item, no image JSON RESPONSE==> " + body);

				//Bad request
				res.should.have.status(400);
				res.should.be.json;
				var obj = JSON.parse(body);
				console.log(obj);
				done();

			});
		});


		it('should not create a new item, invalid image', function(done){

			console.log();
			util.debug("should not create a new item, invalid image");

			//test item
  		    var itemPath = __dirname + "/../fixtures/lorem.txt";

			item = ItemFactory.create( 
				null, "green pants", "pants", "tag1", itemPath);			

			var options = {
				url: "http://localhost:" + app.settings.port + "/api/items",
				form: item
			};

			var req = request.post(options.url, function(err, res, body){

				if (err) return done(err);

				console.log("== should not create a new item, invalid image JSON RESPONSE==> " + body);

				//Bad request
				res.should.have.status(400);
				res.should.be.json;

				var obj = JSON.parse(body);
				console.log(obj);
				done();
			});

			//create a form and set the items properties to the form.
			var form = req.form();

			for (var prop in item ){
				if (item.hasOwnProperty(prop)){
					if (item[prop]){
						form.append(prop, item[prop]);
					}
				}
			}

		});

		//end describe
	});


	describe("list user's items: ", function(){

		var item;
		var numItems = 10;
		var numItems2 = numItems/2; //5
		var numItemsCategory1 = numItems2-1; //4
		var createdItems;

		before(function(done){

			console.log();
			console.log('cleaning up the "items" MongoDB collection');
			Item.collection.remove(function(err){

				if (err) return done(err);
				
				done();
			});							

		});


		it('it should create {0} items for user1'.format(numItems), function(done){

			console.log();
			util.debug("it should create {0} items for user1".format(numItems));

			var count = 0,
				options,
				item;

			var numCategory = 1;  //for "category 1"
			for (var i=1; i <= numItems; i++){

				categoryNum = (i <= numItemsCategory1)?1:2;

	  		    var itemPath = __dirname + "/../fixtures/item_{0}.jpeg".format(i);

				item = ItemFactory.create( 
					null, "item {0}".format(i), "category {0}".format(categoryNum), "tag {0}".format(i), itemPath);			

				var options = {
					url: "http://localhost:" + app.settings.port + "/api/items",
					form: item
				};

				var req = request.post(options.url, function(err, _res, _body){

					if (err) return done(err);

					_res.should.have.status(201);
					util.debug("created item: " + count + ", out of: " + numItems);
					count++;
					if (count === numItems){
						util.debug( "Done! {0} items created.".format(numItems) );
						done();
					}

				});

				//create a form and set the items properties to the form.
				var form = req.form();

				for (var prop in item ){
					if (item.hasOwnProperty(prop)){
						if (item[prop]){
							form.append(prop, item[prop]);
						}
					}
				}

			}
		});


		it ('should list {0} items for user1'.format(numItems), function(done){

			console.log();
			util.debug("should list {0} items for user1".format(numItems));

			//lets retrive the newly created object
			var options = {
				url: "http://localhost:" + app.settings.port + "/api/items"
			};

			//get
			request(options, function(err, res, body){

				if (err) return done(err);

				// console.log("== should list {0} items for user1 JSON RESPONSE==> ".format(numItems) + body);
				res.should.have.status(200);
				res.should.be.json;

				var data = JSON.parse(body);
				util.debug("retrieved '{0}' items.".format(data.items.length));
				(data.items.length).should.equal(numItems);

				//verify that items belong to user, and that
				//they are ordered in reverse chronological order.
				var previousItemTime;
				data.items.forEach(function(item){
					
					userId.should.equal(item.user.id);
					if (previousItemTime 
						&& (previousItemTime < item.createdDate)){
						done(new Error("list should be in reverse chronological order"));
					} 

					previousItemTime = item.createdDate;
				});

				//save items for future tests
				createdItems = data.items;

				done();
				
			});

		});		


		it ('should list {0} items for user1'.format(numItems2), function(done){

			console.log();
			util.debug("should list {0} items for user1".format(numItems2));


			//lets retrive the newly created object
			var options = {
				url: "http://localhost:{0}/api/items?limit={1}".format(app.settings.port, 5)
			};

			//get
			request(options, function(err, res, body){

				if (err) return done(err);

				// console.log("== should list {0} items for user1 JSON RESPONSE==> ".format(numItems2) + body);
				res.should.have.status(200);
				res.should.be.json;

				var data = JSON.parse(body);
				util.debug("retrieved '{0}' items.".format(data.items.length));
				(data.items.length).should.equal(numItems2);

				//verify that items belong to user
				var previousItemTime;
				data.items.forEach(function(item){
					
					userId.should.equal(item.user.id);
					if (previousItemTime 
						&& (previousItemTime < item.createdDate)){
						done(new Error("list should be in reverse chronological order"));
					} 

					previousItemTime = item.createdDate;
				});				

				done();
			});

		});



		it ('should list {0} items for user1 and category 1'.format(numItemsCategory1), function(done){

			console.log();
			util.debug("should list {0} items for user1 and category 1".format(numItemsCategory1));


			//lets retrive the newly created object
			var options = {
				url: "http://localhost:{0}/api/items?category=category 1".format(app.settings.port),
				form: {category: "category 1"}				
			};

			//get
			request(options, function(err, res, body){

				if (err) return done(err);

				// console.log("== should list {0} items for user1 JSON RESPONSE==> ".format(numItems2) + body);
				res.should.have.status(200);
				res.should.be.json;

				var data = JSON.parse(body);
				util.debug("retrieved '{0}' items.".format(data.items.length));
				(data.items.length).should.equal(numItemsCategory1);

				//verify that items belong to user
				var previousItemTime;
				data.items.forEach(function(item){
					
					userId.should.equal(item.user.id);
					"category 1".should.equal(item.category);

					if (previousItemTime 
						&& (previousItemTime < item.createdDate)){
						done(new Error("list should be in reverse chronological order"));
					} 

					previousItemTime = item.createdDate;
				});			
					
				done();
			});

		});		


		it ('should paginate items', function(done){

			console.log();
			util.debug("should paginate items");

			var options = {
				url: "http://localhost:{0}/api/items?limit=4".format(app.settings.port),
			};

			//#1
			var count = 0;
			request(options, function(err, res, body){

				if (err) return done(err);

				res.should.have.status(200);

				var data = JSON.parse(body);
				util.debug("retrieved '{0}' items, page: [{1}], pages: [{2}]".format(data.items.length, data.page, data.pages));
				data.items.forEach(function(item, index){
					if (item.id !== createdItems[count].id) 
						return done (new Error("pagination order does not match") );

					count ++;
				});


				//#2
				var options = {
					url: "http://localhost:{0}/api/items?limit=4&page=2".format(app.settings.port),
				};
				request(options, function(err, res, body){

					if (err) return done(err);

					res.should.have.status(200);

					var data = JSON.parse(body);
					util.debug("retrieved '{0}' items, page: [{1}], pages: [{2}]".format(data.items.length, data.page, data.pages));
					data.items.forEach(function(item, index){

						if (item.id !== createdItems[count].id) 
							return done (new Error("pagination order does not match") );

						count ++;
					});

					//#3
					var options = {
						url: "http://localhost:{0}/api/items?limit=4&page=3".format(app.settings.port),
					};
					request(options, function(err, res, body){

						if (err) return done(err);

						res.should.have.status(200);

						var data = JSON.parse(body);
						util.debug("retrieved '{0}' items, page: [{1}], pages: [{2}]".format(data.items.length, data.page, data.pages));
						data.items.forEach(function(item, index){
							if (item.id !== createdItems[count].id) 
								return done (new Error("pagination order does not match") );

							count ++;
						});

						if (count !== createdItems.length)
							return done (new Error("pagination wrong number of items"));

						done();
					});

				});

			});

		});		

		// end describe
	});

	after(function(done){

		console.log();
		console.log('========== end items-test ========== ');
		console.log();

		done();
	});	

});

