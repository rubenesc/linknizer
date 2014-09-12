
define(['baseView', 'views/links/link', 'views/categories/categories', 'text!templates/links/link-list.html'], 
	function(BaseView, LinkView, CategoriesView, linkListTemplate) {

  var linksView = BaseView.extend({

    template: _.template(linkListTemplate),

  	initialize: function(){

      console.log("{---linksView.initialize---}");  

  		console.log(this.collection.toJSON()); 

      // 'sync' gets triggered when we create or edit an item, and get
      // the response from the server. In this case, we call an action
      // to add it to the collection.
      // this.collection.on('sync', this.addOne, this); 
  		this.collection.on('add', this.addOne, this); 

      // this.collection.on('reset', this.render, this);

      //------

      console.log("[linksview ... creating category view]");
      var categoriesView = new CategoriesView();



  	},

  	render: function(){
  		//injected when view was created
      this.$el.html(this.template());

      this.collection.each(this.addOne, this);

      // $(this.el).html('<ul class="thumbnails"></ul>');

      // this.el = 

      console.log("abbbbb");
      console.log(this.el);

  		return this;
  	},

  	addOne: function(link){
  		//each item from the collection.
  		var linkView = new LinkView({model: link});
      // this.$el.append(linkView.render().el); 

      this.$('tbody').append(linkView.render().el);

      // console.log(this.template().app);
      // $('#mytable').append(row);

  		// this.template.append(linkView.render().el); 
  	}

  });

  return linksView;
  
});