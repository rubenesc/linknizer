
define(['baseView', 'views/links/editlink'],

function(BaseView, EditLinkView) {
  
  var appView = BaseView.extend({

    initialize: function() {
    	console.log("[AppView1.initialize]");
    	vent.on("link:edit", this.editLink, this);
    },

    editLink: function(link){
		//Create new EditLinkView
		//bind the model
		//append form to dom
		var editLinkView = new EditLinkView({model: link});
		$("#edit-link").html(editLinkView.el);
    }

  });

  return appView;

});
