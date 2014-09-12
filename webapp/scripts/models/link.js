
define(['backbone'], function(Backbone){

  var Link = Backbone.Model.extend({
	
	urlRoot: "/api/links",

	defaults: {
		url: '',
		title: '',
		category: ''
	},

	parse: function(response){

		//if it comes from calling the API.
		// link: { ... }
		if (response.hasOwnProperty('link')){
			return response.link;
		}

		return response;
	},

	validate: function(attrs){

		if (!attrs.url){
			return 'A url is required';
		}

	}

  });

  return Link;
});
