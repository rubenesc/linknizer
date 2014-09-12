
define(['baseView', 'collections/categories', 'views/categories/category'], 
	function(BaseView, CategoriesCollection, CategoryView) {

  var categoriesView = BaseView.extend({

  	tagName: 'ul',

    // template: _.template(linkListTemplate),

  	initialize: function(){

      console.log("{---categoriesView.initialize---}");  


    //   this.collection = new LinksCollection();
    //   this.collection.fetch({reset: true}); // NEW

  		// console.log(this.collection.toJSON()); 

      var self = this;
      App.categories = new CategoriesCollection();
      
      //fetch links
      App.categories.fetch().then(function(){
		
		self.collection = App.categories;
		console.log(self.collection.toJSON()); 		        
        
        //inject links to view
        // var linksView = new LinksView({ collection: App.links});
        //render view and append to DOM
        // $("#content").html(linksView.render().el);
        
        // self.changeView(linksView);

	      // 'sync' gets triggered when we create or edit an item, and get
	      // the response from the server. In this case, we call an action
	      // to add it to the collection.
	      // this.collection.on('sync', this.addOne, this); 
	  		self.collection.on('add', this.addOne, this); 
      });




      // this.collection.on('reset', this.render, this);
  	},

  	render: function(){
  		//injected when view was created
      // this.$el.html(this.template());

      this.collection.each(this.addOne, this);

      // $(this.el).html('<ul class="thumbnails"></ul>');

      // this.el = 

      console.log("xxaaxxx");
      console.log(this.el);

  		return this;
  	},

  	addOne: function(category){
  		//each item from the collection.
  		var categoryView = new CategoryView({model: category});
      // this.$el.append(categoryView.render().el); 

      this.$('ul').append(categoryView.render().el);

      // console.log(this.template().app);
      // $('#mytable').append(row);

  		// this.template.append(categoryView.render().el); 
  	}

  });

  return categoriesView;
  
});