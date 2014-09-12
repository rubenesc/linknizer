require.config({

  paths: {

    jquery: 'vendor/jquery/jquery',
    underscore: 'vendor/underscore/underscore',
    backbone: 'vendor/backbone/backbone',
    text: 'vendor/requirejs-text/text',
    templates: '../templates',
    baseView: 'baseView'
  },

  shim: {
    backbone: {
        deps: ["underscore", "jquery"],
        exports: "Backbone"
    },

    linknizer: {
        deps: ["backbone"],
        exports: "linknizer"
    }    
  }

});

require(['backbone', 'router', 'linknizer', 'views/app'], 
  function(Backbone, Router, Linknizer, AppView){

  console.log("Linknizer starting ...");

    //define a global namepsace
  (function(){

    window.App = {
      Models: {},
      Collections: {},
      Views: {},
      Router: {}
    };

    //helper method to fire events
    window.vent = _.extend({}, Backbone.Events);

    //helper method to find a template
    window.template = function(id){
      return _.template($('#'+id).html());
    }
    
    //initialize app    
    var appView = new AppView();

    App.router = new Router();

    //Start watching for hash change events
    Backbone.history.start(); 

    Linknizer.initialize();
    
    console.log("[Linknizer started]");


  })();


});


