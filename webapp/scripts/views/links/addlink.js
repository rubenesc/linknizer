
define(['baseView', 'models/link', 'text!templates/links/add-link.html'], 
	function(BaseView, LinkModel, addLinkTemplate) {

  var addLinkView = BaseView.extend({

    template: _.template(addLinkTemplate),

  	initialize: function(){

      this.render();
      
  		this.url = this.$('#url');
  		this.title = this.$('#title');

  	},

  	events: {
       "click .save": "addLink",
       "click .cancel": "cancel"
  	},

    render: function(){

      var html = this.template(this.model.toJSON() );
      this.$el.html(html);
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

    cancel: function(e){
      this.remove();
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

              vent.trigger('link:addToCollection', model);
		  	 	    self.clearForm();
            },

            error: function (err) {
            }
        });      


  	},

  	clearForm: function(){
  		this.url.val('');
  		this.title.val('');
      this.cancel();
  	}

  });

  return addLinkView;
  
});