
define(['baseView', 'views/links/editlink'],

function(BaseView, EditLinkView) {
  
  var appView2 = BaseView.extend({

    initialize: function() {
    	console.log("[AppView2.initialize]");
    	vent.on("link:edit", this.editLink, this);
    },



  });

  return appView2;

});
