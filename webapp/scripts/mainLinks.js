require.config({

  paths: {

    jquery: 'vendor/jquery/jquery',
    underscore: 'vendor/underscore/underscore',
    backbone: 'vendor/backbone/backbone',
    bootstrap: 'vendor/bootstrap/bootstrap',
    text: 'vendor/requirejs-text/text',
    templates: '../templates',
    baseView: 'baseView'
  },

  shim: {
    backbone: {
        deps: ["underscore", "jquery"],
        exports: "Backbone"
    },
    bootstrap: {
        deps: ["jquery"],
    },

    linknizer: {
        deps: ["backbone"],
        exports: "linknizer"
    }    
  }

});

require(['backbone', 'router', 'linknizer', 'views/appLinks'], 

  function(Backbone, Router, Linknizer, LinksView){

    //helper method to fire events
    window.vent = _.extend({}, Backbone.Events);

    //helper method to find a template
    window.template = function(id){
      return _.template($('#'+id).html());
    }
	// //initialize Links App    
	var appLinks = new LinksView();

});


