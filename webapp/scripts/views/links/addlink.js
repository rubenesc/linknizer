
define(['baseView', 'models/link', 'text!templates/links/link-detail.html'], 
	function(BaseView, LinkModel, linkDetailTemplate) {

  var addLinkView = BaseView.extend({

  	el: '#add-link',

    // template: _.template(linkDetailTemplate),

  	initialize: function(){

		this.$("form").hide();

  		this.url = this.$('#url');
  		this.title = this.$('#title');

  	},

  	events: {
       // "change": "change",
  		'submit': 'addLink'
       , "click .add-link": "showAddLinkForm"
       , "click .cancel": "cancelAddLinkForm"
  	},

    render: function(){
      // console.log("abbbbbzzzzzsdds");

      // // var newLink = new LinkModel();
      // this.model = new LinkModel();
      // var html = this.template( this.model.toJSON() );
      // this.$el.html(html);

      // console.log("abbbbbzzzzz");
      // console.log(this.el);

      // return this;


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

    showAddLinkForm: function(e){

		e.preventDefault();

		this.$("form").show();
      // this.remove();
      // App.router.navigate("/links", true);
    },

    cancelAddLinkForm: function(e){

		e.preventDefault();

		this.$("form").hide();
		this.clearForm();
    },


  	addLink: function(e){

  		e.preventDefault();

        var self = this;

        //create a Model, 
        var linkModel = new LinkModel({
  			url: this.url.val(),
  			title: this.title.val()});

        linkModel.save(null, {
            success: function (model) {
			    // console.log(resp);
            	self.collection.add(linkModel);	
				this.$("form").hide();
		  		self.clearForm();
            },
            error: function (err) {
            }
        });        
        //save it,



  	// 	console.log("add link, collection.size[" + this.collection.length+"]");
  	// 	var newLink = this.collection.create({
  	// 		url: this.url.val(),
  	// 		title: this.title.val()
  	// 	}, {
  	// 		at: 0,
  	// 		wait: true, // {wait: true} means wait for the server response to add it to the collection.

			// success : function(resp){
			//     console.log('success callback');
			//     console.log(resp);
		 //  		self.clearForm();
			//     // that.redirectHomePage();
			// },

			// error : function(err) {
			//     console.log('error callback');
			//     // this error message for dev only
			//     alert('There was an error. See console for details');
			//     console.log(err);
			// }


  	// 	}); 

  		// console.log(newLink);



        // this.model.save(null, {
        //     success: function (model) {
        //       self.render();
        //       App.router.navigate("/links", true);
        //       // utils.showAlert('Success!', 'Wine saved successfully', 'alert-success');
        //     },
        //     error: function () {
        //         // utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
        //     }
        // });


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
		this.url.val('');
		this.title.val('');
		// this.category.val('');
  	}

  });

  return addLinkView;
  
});