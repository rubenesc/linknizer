
define(['backbone', 'models/category'], function(Backbone, Category) {

  var Categories = Backbone.Collection.extend({

	url: "/api/categories",

    model: Category,

    //this is because our server response is different
    //then what backbone expects
	parse: function(response){
		// this.page = response.page;
		// this.pages = response.pages;
		return response.categories;
	}

  });

  return Categories;
});