
define(['baseView', 'text!templates/links/link-detail.html'], 
	function(BaseView, linkDetailTemplate) {

  var editLinkView = BaseView.extend({

    el: '#edit-link',

  	events: {
  		// "submit": "submit",
      "click .save": "submit",
      "click .cancel": "cancel"
  	},


    initialize: function(){
      
      this.dialog = $(".modal");
      this.url = this.$("#url");
      this.title = this.$("#title");

      if (this.model){
        this.url.val(this.model.get("url"));
        this.title.val(this.model.get("title"));
      }

      this.render();

    },


  	render: function(){
  		return this;
  	},

  	submit: function(e){

      e.preventDefault();

      var self = this;

  		var m = this.model.save({
  			url: this.url.val(),
  			title: this.title.val()
  		}, {

        wait:true,

        success: function (model) {

          self.dialog.modal('hide');
          self.clearForm();

        },

        error: function (err) {

        }

      });  

      // console.dir(m);      

  	}, 

    cancel: function(){
        this.clearForm();
    },

    clearForm: function(){
      this.url.val('');
      this.title.val('');
    }


  });

  return editLinkView;
  
});