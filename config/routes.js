
var mongoose = require('mongoose')
   , util = require('util')
   , async = require('async');


module.exports = function(app, passport, auth) {


	app.get('/', function(req, res){
  		res.render('index.jade');
	});

	app.namespace('/api', function(){

		var users = require('../app/controllers/users');
		app.post('/signup', users.create);
		app.get('/users/:username', users.show);
		app.put('/users/:username', users.update);
		app.del('/users/:username', users.del);

		// https://github.com/spumko/boom/blob/master/lib/index.js		
		// http://passportjs.org/guide/login/
		// https://github.com/madhums/nodejs-express-mongoose-demo/blob/master/config/routes.js
		
		app.post('/login', passport.authenticate('local'), users.session);
		app.post('/logout', auth.requiresLogin, users.logout);
		app.get('/authenticated', users.isAuthenticated);

		//Authentication check
		// app.all('/*', function(req, res, next){

		// 	if (!req.session.currentUser){

		// 		var error = {
		// 			status: 401,
		// 			message: "Access denied: " + req.url,
		// 			code: 12345
		// 		};

		// 		return next(error);

		// 	}
		// 	next();  //user authenticated
		// });

		var items = require('../app/controllers/items');
		app.get('/items', auth.requiresLogin, items.list);
		app.post('/items', auth.requiresLogin, items.create);
		app.get('/items/:id', auth.requiresLogin, items.show);
		app.put('/items/:id', auth.requiresLogin, items.update);
		app.del('/items/:id', auth.requiresLogin, items.del);

		var links = require('../app/controllers/links');
		app.get('/links', auth.requiresLogin, links.list);
		app.post('/links', auth.requiresLogin, links.create);
		app.get('/links/:id', auth.requiresLogin, links.show);
		app.put('/links/:id', auth.requiresLogin, links.update);
		app.del('/links/:id', auth.requiresLogin, links.del);

		var categories = require('../app/controllers/categories');
		app.get('/categories', auth.requiresLogin, categories.list);
		app.post('/categories', auth.requiresLogin, categories.create);
		app.get('/categories/:id', auth.requiresLogin, categories.show);
		app.put('/categories/:id', auth.requiresLogin, categories.update);
		app.del('/categories/:id', auth.requiresLogin, categories.del);


	});

}





