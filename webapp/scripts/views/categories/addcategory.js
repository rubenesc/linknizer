
define(['baseView', 'models/category', 'text!templates/categories/category-detail.html'], 
	function(BaseView, CategoryModel, categoryDetailTemplate) {

  var addCategoryView = BaseView.extend({

  //	el: '#add-link',

    template: _.template(categoryDetailTemplate),

  	initialize: function(){
  		console.log("{---addCategoryView.initialize---}");	

  		this.url = this.$('#name');

  	},

  	events: {
      	"change": "change",
  		'submit': 'addCategory'
       // , "click button.save": "saveLink"
       , "click button.cancel": "cancelAddCategoryForm"
  	},

    render: function(){

      // var newLink = new CategoryModel();
      this.model = new CategoryModel();
      var html = this.template( this.model.toJSON() );
      this.$el.html(html);

      console.log(this.el);

      return this;
    },

    change: function (event) {
        // Remove any existing alert message
        // utils.hideAlert();

        // Apply the change to the model
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);

        // // Run validation rule (if any) on changed item
        // var check = this.model.validateItem(target.id);
        // if (check.isValid === false) {
        //     utils.addValidationError(target.id, check.message);
        // } else {
        //     utils.removeValidationError(target.id);
        // }
    },    

    saveLink: function(){

      console.log("addLinkForm");
      this.render();

    },

    cancelAddCategoryForm: function(){

      console.log("cancelAddCategoryForm");
      this.remove();
      App.router.navigate("/links", true);

    },

  	addCategory: function(e){
		e.preventDefault();

    	console.log("add Category");
        
        var self = this;
        this.model.save(null, {
            success: function (model) {
              self.render();
              App.router.navigate("/links", true);
              // utils.showAlert('Success!', 'Wine saved successfully', 'alert-success');
            },
            error: function () {
                // utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
            }
        });


  		// if (this.collection){

	  	// 	console.log("add link, collection.size[" + this.collection.length+"]");
	  	// 	var newLink = this.collection.create({
	  	// 		url: this.url.val(),
	  	// 		title: this.title.val(),
	  	// 		category: this.category.val()
	  	// 	}, {wait: true}); // {wait: true} means wait for the server response to add it to the collection.

	  	// 	this.clearForm();
  		// } else {
	  	// 	console.log("add link, collection is null");
  		// }
  	},

  	clearForm: function(){
		this.name.val('');
  	}

  });

  return addCategoryView;
  
});