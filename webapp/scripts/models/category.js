
define(['backbone'], function(Backbone){

  var Category = Backbone.Model.extend({
	
	urlRoot: "/api/categories",

	defaults: {
		name: ''
	},

	parse: function(response){

		//if it comes from calling the API.
		// category: { ... }
		if (response.hasOwnProperty('category')){
			return response.category;
		}

		return response;
	},

	validate: function(attrs){

		if (!attrs.name){
			return 'A name is required';
		}

	}

  });

  return Category;
});
