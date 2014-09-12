var mongoose = require('mongoose'),
	Item = mongoose.model('Item'),
	_ = require('underscore'),
	prettyjson = require('prettyjson'),
	check = require('validator').check;
var Validator = require('validator').Validator;	
var util = require('util');
var ApplicationError = require("../helpers/applicationErrors");
var ImageHelper = require("../helpers/imageHelper");


/**
 * List of items
 *
 * @return {"items":[{ item1 }, {item2}, ... ]}
 */
 exports.list = function(req, res) {

 	var opts = retrieveListOptions(req);
 	
	console.log();
	if (opts.criteria.category){
		util.debug("--> items.list ... page: {0}, limit: {1}, category: [{2}]".format(opts.page, opts.limit, opts.criteria.category));
	} else {
		util.debug("--> items.list ... page: {0}, limit: {1}".format(opts.page, opts.limit));
	}
	util.debug(prettyjson.render(req.body));

	Item.list(opts, function(err, data) {

		if (err) return next(err);

		var data2 = [];
		for (var i in data){
			data2.push(data[i].toClient());
		}

	    Item.count().exec(function (err, count) {

			if (err) return next(err);

			res.send({
				items: data2, 
		        page: opts.page + 1,
        		pages: Math.ceil(count / opts.limit)
			});
	    });



	});
}

exports.create = function(req, res, next) {

	console.log();
	util.debug('--> items.create: ' + req.body.url);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	util.debug('--> req.user: ' + req.user);

	//request validation
	var errors = validateCreateRequest(req);

	if(errors.length){
		var message = "Item could not be created";
		return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
	}

	ImageHelper.processItem({'request': req, 'isUpdate': false}, function(err, target1, target2){

	 	if (err) return next(err);

		//build obj
		var item = new Item({
			url: target1, //the url of the uploaded file
			title: req.body.title,
			category: req.body.category,
			tags: req.body.tags,
			user: req.user
		});

		item.save(function(err, _item){

	    	if (err) return next(err);	

			return res.send(201, {item: _item.toClient()});
		});

	});	

}

exports.show = function(req, res, next) {

	console.log();
	util.debug('--> items.show: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());

	Item.loadById(req.params.id, function(err, data) {

		if(err || !data) {
			
			var message = "Resource not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);

		} else {

			return res.send({item: data.toClient()});
		}
	});
}

exports.update = function(req, res, next) {

	console.log();
	util.debug('--> items.update: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	// util.debug(prettyjson.render(req.body));

	Item.loadById(req.params.id, function(err, data) {

		if(err || !data) {
			var message = "Resource not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);
		}

		util.debug("---req files--> " + req.files)
		if (req.files && req.files.image){

			//validate Image
			var errors = validateImageRequest(req);

			if(errors.length){
				var message = "Item could not be created";
				return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
			}

			ImageHelper.processItem({'request': req, 'isUpdate': true, 'updateUrl': data.url}, function(err, target1, target2){

			 	if (err) return next(err);

				//update obj
				data.url = target1; //the url of the uploaded file

				updateAndSaveItem(req, data, function(err, _data){

			    	if (err) return next(err);	

					return res.send(200, {item: _data.toClient()});
				});

			});				


		} else {

			updateAndSaveItem(req, data, function(err, _data){
		    
		    	if (err) return next(err);	

				return res.send(200, {item: _data.toClient()});
			});
			
		}

	});
}


exports.del = function(req, res, next) {

	console.log();
	util.debug('--> items.delete: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());

	Item.loadById(req.params.id, function(err, data) {

		if(err || !data) {
			var message = "Resource not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);
		}

		data.remove(function(err) {

			if (err) return next(err);

			ImageHelper.deleteItem(data.url, function(err){

				if (err)return next(err);
				
				return res.send({});

			});

		});

	});
}



function validateCreateRequest(req){

	var errors = [];

	req.onValidationError(function(msg){
		errors.push(msg);
	});

	var validator = new Validator();

	Validator.prototype.error = function (msg) {
		errors.push(msg);
	    return this;
	}

	if (typeof req.files === "undefined") {
		errors.push('please upload an image');
	} else {

		validator.check(req.files.image, 'please upload an image').notNull();

		if (req.files.image){
			validator.check(req.files.image.type, 'the file ' + req.files.image.name + ', must be an image.').contains('image/');
		}
	}

	return errors;
}

function updateAndSaveItem(req, data, cb){

	data.title = req.body.title || data.title;
	data.category = req.body.category || data.category;
	data.tags = req.body.tags || data.tags;

	data.save(function(err, _data) {

		cb(err, _data);

	});

}


function validateImageRequest(req){

	var errors = [];

	var validator = new Validator();
	
	Validator.prototype.error = function (msg) {
		errors.push(msg);
	    return this;
	}

	validator.check(req.files.image.type, 'the file ' + req.files.image.name + ', must be an image.').contains('image/');

	return errors;
}

function retrieveListOptions(req){

	var page = (req.param('page') > 0 ? req.param('page') : 1) - 1

	//number of individual objects that are returned in each page. 
	var limit = (req.param('limit') > 0 && req.param('limit') < 50) 
					? req.param('limit') : 15;


	//conditionally add members to object
	var criteria = {};

	if (req.user) criteria.user = req.user;
	if (req.body.category) criteria.category = req.body.category;

	return {
		criteria: criteria,
		limit: limit,
		page: page
	}

}



