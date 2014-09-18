
var mongoose = require('mongoose')
   , util = require('util')
   , async = require('async');


module.exports = function(app, passport, auth, user) {

	var users = require('../app/controllers/users');
	var items = require('../app/controllers/items');
	var links = require('../app/controllers/links');
	var categories = require('../app/controllers/categories');

	app.get("/", function(req, res){
		if (req.currentUser){
			return res.redirect("/users/"+req.currentUser.username);		
		} else {
			return res.render("index");
		}
	});	

	//user
	app.get("/login", function(req, res){ res.render("login"); });
	app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), users.session);
	app.post('/signup', users.create);


	app.get("/signup", function(req, res){
		res.render("signup");
	});	

	app.get("/forgot", function(req, res){
		res.render("forgot");
	});	

	app.post("/forgot", users.forgot);
	app.get('/logout', auth.requiresLogin, users.logout);

	//links
	app.get('/links', auth.requiresLogin, links.list);
	app.get('/links/:username', auth.requiresLogin, links.list2);


	app.namespace('/api', function(){

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


		app.get('/items', auth.requiresLogin, items.list);
		app.post('/items', auth.requiresLogin, items.create);
		app.get('/items/:id', auth.requiresLogin, items.show);
		app.put('/items/:id', auth.requiresLogin, items.update);
		app.del('/items/:id', auth.requiresLogin, items.del);

		app.get('/links', auth.requiresLogin, links.list);
		app.post('/links', auth.requiresLogin, links.create);
		app.get('/links/:id', auth.requiresLogin, links.show);
		app.put('/links/:id', auth.requiresLogin, links.update);
		app.del('/links/:id', auth.requiresLogin, links.del);

		app.get('/categories', auth.requiresLogin, categories.list);
		app.post('/categories', auth.requiresLogin, categories.create);
		app.get('/categories/:id', auth.requiresLogin, categories.show);
		app.put('/categories/:id', auth.requiresLogin, categories.update);
		app.del('/categories/:id', auth.requiresLogin, categories.del);


	});

}





