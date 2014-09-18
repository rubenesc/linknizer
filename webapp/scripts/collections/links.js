
define(['backbone', 'models/link'], function(Backbone, Link) {

  var Links = Backbone.Collection.extend({

	url: "/api/links",

    model: Link,

    //this is because our server response is different
    //then what backbone expects
	parse: function(response){
		this.page = response.page;
		this.pages = response.pages;
		return response.links;
	},

	validate: function(attrs){
		if (!attrs.url){
			return "Please enter a url";
		}
	}

  });

  return Links;
});