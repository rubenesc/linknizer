var mongoose = require('mongoose');
var	Link = mongoose.model('Link');
var	Category = mongoose.model('Category');
var	User = mongoose.model('User');
var util = require("util");


var LinkFactory = {

	create: function(url, title, category, tags){

		var link = {
			url: url || "",
			title: title || "",
			tags: tags || "",
			category: category || ""
		}

		return link;
	}, 

	cleanLinks: function(done){

		function clean() {

			console.log();
			util.debug('cleaning up the "links" MongoDB collection');
			Link.collection.remove(function(err){

				if (err) return done(err);

				done();
				
			});		

		}

		return clean;
	},

	
	cleanLinksAndCategories: function(done){

		function clean(){

			console.log();
			util.debug('cleaning up the "links" MongoDB collection');
			Link.collection.remove(function(err){

				if (err) return done(err);

				util.debug('cleaning up the "Category" MongoDB collection');
				Category.collection.remove(function(err){

					if (err) return done(err);

					done();
				});
				
			});			

		}

		return clean;

	},			

	cleanLinksCategoriesAndUsers: function(done){

		function clean(){

			console.log();
			util.debug('cleaning up the "Links" MongoDB collection');

			Link.collection.remove(function(err){

				if (err) return done(err);

				util.debug('cleaning up the "Categories" MongoDB collection for authentication tests');					

				Category.collection.remove(function(err){

					if (err) return done(err);

					util.debug('cleaning up the "Users" MongoDB collection for authentication tests');

					User.collection.remove(function(err){

						if (err) return done(err);

						return done();

					});

				});

			});

		}

		return clean;

	}
	
}

module.exports = LinkFactory;