var mongoose = require('mongoose'),
	Category = mongoose.model('Category'),
	_ = require('underscore'),
	prettyjson = require('prettyjson'),
	check = require('validator').check;
var Validator = require('validator').Validator;	
var util = require('util');
var ApplicationError = require("../helpers/applicationErrors");


/**
 * List of categories
 *
 * @return {"categories":[{ category 1 }, {category 2}, ... ]}
 */
 exports.list = function(req, res) {

 	var opts = retrieveListOptions(req);
 	
	console.log();
	util.debug("--> categories.list ... user[{0}]".format(req.user));
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	util.debug('--> req.user: ' + req.user);

	Category.list(opts, function(err, data) {

		if (err) return next(err);

		var data2 = [];
		for (var i in data){
			data2.push(data[i].toClient());
		}

		return res.send({ categories: data2 });

	});
 }

exports.create = function(req, res, next) {

	console.log();
	util.debug('--> category.create: ' + req.body.url);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	util.debug('--> req.user: ' + req.user);

	//request validation
	var errors = validateCreateUpdateRequest(req);

	if(errors.length){
		var message = "Category could not be created";
		return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
	}

	//build obj
	var category = new Category({
		name: req.body.name,
		user: req.user
	});

	category.save(function(err, data){

    	if (err) return next(err);	

		return res.send(201, {category: data.toClient()});
	});

}

exports.show = function(req, res, next) {

	console.log();
	util.debug('--> categories.show: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());

	Category.loadByIdAndUser(req.params.id, req.user.id, function(err, data) {

		if(err || !data) {
			
			var message = "Resource not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);

		} else {

			return res.send({category: data.toClient()});
		}
	});


}

exports.update = function(req, res, next) {

	console.log();
	util.debug('--> category.update: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	util.debug('--> req.user._id: ' + req.user._id);
	util.debug('--> req.user.id: ' + req.user.id);

	Category.loadByIdAndUser(req.params.id, req.user.id, function(err, data) {

		if(err || !data) {
			var message = "Resource not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);
		}

		var errors = validateCreateUpdateRequest(req);

		if(errors.length){
			var message = "Category could not be created";
			return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
		}
 

		updateAndSaveCategory(req, data, function(err, _data){
	    
	    	if (err) return next(err);	

			return res.send(200, {category: _data.toClient()});
		});
			
	});
}


exports.del = function(req, res, next) {

	console.log();
	util.debug('--> categories.delete: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());

	Category.loadByIdAndUser(req.params.id, req.user.id, function(err, data) {

		if(err || !data) {
			var message = "Category not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);
		}

		data.remove(function(err) {

			if (err) return next(err);

			return res.send({});
		});

	});
}

function retrieveListOptions(req){

	//conditionally add members to object
	var criteria = {};

	if (req.user) criteria.user = req.user;

	return {
		criteria: criteria,
	}

}

function validateCreateUpdateRequest(req){

	var errors = [];

	req.onValidationError(function(msg){
		errors.push(msg);
	});

	req.check('name', 'Please enter a name').notEmpty();
	req.check('name', 'The name is to long').len(1, 30);

	return errors;
}

function updateAndSaveCategory(req, data, cb){

	data.name = req.body.name || data.name;

	data.save(function(err, _data) {

		cb(err, _data);

	});

}









