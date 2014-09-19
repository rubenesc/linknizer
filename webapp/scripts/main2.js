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

require(['backbone', 'router', 'linknizer', 'views/app', 'views/app2'], 
  function(Backbone, Router, Linknizer, AppView, AppView2){

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


    var root = $("[data-main][data-root]").data("root");
    root = root ? root : '/';

    console.log("====> ["+root+"]");    
    
    // //initialize app    
    // var appView = new AppView();
    var appView2 = new AppView2();

    // App.router = new Router();

    // //Start watching for hash change events
    // Backbone.history.start(); 

    // Linknizer.initialize();
    
    // console.log("[Linknizer started]");


  })();


});


