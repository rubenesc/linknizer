
define(['baseView', 'views/links/link', 'views/categories/categories'], 
	function(BaseView, LinkView, CategoriesView) {

  var linksView = BaseView.extend({

    tagName: 'tbody',

  	initialize: function(){

      // 'sync' gets triggered when we create or edit an item, and get
      // the response from the server. In this case, we call an action
      // to add it to the collection.
      // this.collection.on('sync', this.addOne, this); 
  		this.collection.on('add', this.addOnePrepend, this); 

      // this.collection.on('reset', this.render, this);

  	},

  	render: function(){
  		//injected when view was created
      // this.$el.html(this.template());

      this.collection.each(this.addOne, this);
  		return this;
  	},

  	addOne: function(link){

  		//each item from the collection.
  		var linkView = new LinkView({model: link});
      this.$el.append(linkView.render().el); 

  	},

    addOnePrepend: function(link){

      //each item from the collection.
      var linkView = new LinkView({model: link});
      this.$el.prepend(linkView.render().el); 

    }    



  });

  return linksView;
  
});