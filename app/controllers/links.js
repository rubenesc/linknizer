var mongoose = require('mongoose'),
	Link = mongoose.model('Link'),
	_ = require('underscore'),
	prettyjson = require('prettyjson'),
	check = require('validator').check;
var Validator = require('validator').Validator;	
var util = require('util');
var ApplicationError = require("../helpers/applicationErrors");



 exports.list2 = function(req, res, next) {

 	if (true){

 		var opts = retrieveListOptions(req);

		Link.list(opts, function(err, data) {

			if (err) return next(err);

			var data2 = [];
			for (var i in data){
				data2.push(data[i].toClient());
			}

		    Link.count().exec(function (err, count) {

				if (err) return next(err);

				// res.send({
				// 	currentUser: req.currentUser,
				// 	links: data2, 
			 //        page: opts.page + 1,
	   //      		pages: Math.ceil(count / opts.limit)
				// });

				res.render("links/links", {
					currentUser: req.currentUser,
					links: JSON.stringify(data2), 
			        page: opts.page + 1,
	        		pages: Math.ceil(count / opts.limit)
				});
		    });

		});


		return;
 	}

	var canEdit = false;
	var isAdmin = false; 

	CacheHelper.getConfig(function(err, config){

		if (err) return next(err);

		User.findByUsername(req.params.username, function(err, profileUser){


			if (err || !profileUser) return next(err);

			if (req.currentUser.id === profileUser.id){
				canEdit = true;
			}


			if (canEdit && !profileUser.isAdmin()){
				//if I am a normal user, and I am in my profile, verify if
				//the I can still the scores based on the time window.
				
				var now = new Date();
				var limiteDate = config.startDate;

				if (now >= limiteDate){
					canEdit = false;
				}

			}



		 	var opts = retrieveListOptions(req);
		 	
			console.log();
			util.debug("--> games.list ... page: {0}, limit: {1}".format(opts.page, opts.limit));
			util.debug(prettyjson.render(req.body));
			opts.criteria.user  = profileUser;



			User.list({}, function(err, userList){

				Game.list(opts, function(err, data) {

					if (err) return next(err);

					var data2 = [];
					for (var i in data){
						data2.push(data[i].toClient());
					}

				    Game.count().exec(function (err, count) {

						if (err) return next(err);

						res.render("user/games", {
							loggedIn: req.currentUser.toClient(),
							games: JSON.stringify(data2), 
							currentUser: profileUser.toClient(),
							canEdit: JSON.stringify(canEdit),
							users: userList,
					        page: opts.page + 1,
			        		pages: Math.ceil(count / opts.limit)
						});
				    });

				});

			});

		});
	});


//	opts = {};

//	});

}

/**
 * List of links
 *
 * @return {"links":[{ link1 }, {link2}, ... ]}
 */
 exports.list = function(req, res) {

 	var opts = retrieveListOptions(req);
 	
	console.log();
	if (opts.criteria.category){
		util.debug("--> links.list ... page: {0}, limit: {1}, category: [{2}]".format(opts.page, opts.limit, opts.criteria.category));
	} else {
		util.debug("--> links.list ... page: {0}, limit: {1}".format(opts.page, opts.limit));
	}
	util.debug(prettyjson.render(req.body));

	Link.list(opts, function(err, data) {

		if (err) return next(err);

		var data2 = [];
		for (var i in data){
			data2.push(data[i].toClient());
		}

	    Link.count().exec(function (err, count) {

			if (err) return next(err);

			res.send({
				links: data2, 
		        page: opts.page + 1,
        		pages: Math.ceil(count / opts.limit)
			});
	    });

	});
}

exports.create = function(req, res, next) {

	console.log();
	util.debug('--> links.create: ' + req.body.url);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	util.debug('--> req.user: ' + req.user);

	//request validation
	var errors = validateCreateRequest(req);

	if(errors.length){
		var message = "Link could not be created";
		return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
	}

	//build obj
	var link = new Link({
		url: req.body.url, 
		title: req.body.title,
		// category: req.body.category,
		// tags: req.body.tags,
		user: req.currentUser
	});

	link.save(function(err, _link){

    	if (err) return next(err);	

		return res.send(201, {link: _link.toClient()});
	});

}

exports.show = function(req, res, next) {

	console.log();
	util.debug('--> links.show: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());

	Link.loadById(req.params.id, function(err, data) {

		if(err || !data) {
			
			var message = "Resource not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);

		} else {

			return res.send({link: data.toClient()});
		}
	});
}



exports.update = function(req, res, next) {

	console.log();
	util.debug('--> links.update: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	// util.debug(prettyjson.render(req.body));

	Link.loadById(req.params.id, function(err, data) {

		if(err || !data) {
			var message = "Resource not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);
		}

		var errors = validateUpdateRequest(req);

		if(errors.length){
			var message = "Link could not be created";
			return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
		}
 

		updateAndSaveLink(req, data, function(err, _data){
	    
	    	if (err) return next(err);	

			return res.send(200, {link: _data.toClient()});
		});
			
	});
}


exports.del = function(req, res, next) {

	console.log();
	util.debug('--> links.delete: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());

	Link.loadById(req.params.id, function(err, data) {

		if(err || !data) {
			var message = "Link not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);
		}

		data.remove(function(err) {

			if (err) return next(err);

			return res.send({});
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

	req.check('url', 'Please enter a valid url').isUrl();

	return errors;
}

function validateUpdateRequest(req){

	var errors = [];

	req.onValidationError(function(msg){
		errors.push(msg);
	});

	var validator = new Validator();

	Validator.prototype.error = function (msg) {
		errors.push(msg);
	    return this;
	}

	if (req.body.url){
		req.check('url', 'Please enter a valid url').isUrl();
	}

	return errors;

}

function updateAndSaveLink(req, data, cb){

	data.url = req.body.url || data.url;
	data.title = req.body.title || data.title;
	data.category = req.body.category || data.category;
	data.tags = req.body.tags || data.tags;

	data.save(function(err, _data) {

		cb(err, _data);

	});

}

/*
	opts: {
		criteria: {
			user: "username",
			category: "javascript"
		},
		limit: 15,
		page: 2
	}
*/
function retrieveListOptions(req){

	var page = (req.param('page') > 0 ? req.param('page') : 1) - 1

	//number of individual objects that are returned in each page. 
	var limit = (req.param('limit') > 0 && req.param('limit') < 50) 
					? req.param('limit') : 15;


	//conditionally add members to object
	var criteria = {};

	if (req.currentUser) criteria.user = req.currentUser;
	if (req.body.category) criteria.category = req.body.category;

	return {
		criteria: criteria,
		limit: limit,
		page: page
	}

}



