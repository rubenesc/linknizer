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