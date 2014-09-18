
define(['baseView', 'text!templates/links/link-detail.html'], 
	function(BaseView, linkDetailTemplate) {

  var editLinkView = BaseView.extend({

  	template: _.template(linkDetailTemplate),

  	events: {
  		"submit form": "submit",
      "click button.cacenl": "cancel"
  	},

  	initialize: function(){
      console.log("{---editLinkView.initialize---}");  
      
  		this.render();

  		this.form = this.$("form");
  		this.url = this.form.find("#url");
  		this.title = this.form.find("#title");
  		this.category = this.form.find("#category");

  	},

  	render: function(){
  		var html = this.template( this.model.toJSON() );
  		this.$el.html(html);
  		return this;
  	},

  	submit: function(e){
  		e.preventDefault();

  		//grab related model
  		//update its attributes
  		//sync with server
  		this.model.save({
  			url: this.url.val(),
  			title: this.title.val(),
  			category: this.category.val()
  		});

      //we are done letting lets remove the form
  		this.remove();
  	}, 

    cancel: function(){
      this.remove();
    }

  });

  return editLinkView;
  
});