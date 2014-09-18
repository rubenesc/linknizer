
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , passport = require('passport')
  , prettyjson = require('prettyjson'); // this is cool for debugging

var util = require('util');  

//this provides namespace capabilities to express routes.
require('express-namespace');
   
// Load configurations
var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env]
  , auth = require('./config/middleware/auth/authorization')
  , mongoose = require('mongoose');

//first, checks if it isn't implemented yet
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

util.log("");
util.log('configuration: ');
util.log(prettyjson.render(config));
util.log("");
util.log("process.env.NODE_ENV: " + process.env.NODE_ENV);  

// Bootstrap db connection
mongoose.connect(config.db);

// Bootstrap models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file)
});

// initialize and configue connect-roles
var user = require('./config/middleware/auth/connectRoles')();

// bootstrap passport config
require('./config/middleware/auth/passport')(passport, config);

//export the app variable, so it can be used in mocha tests.
var app = module.exports = express();

// express settings
require('./config/express')(app, config, passport, user)

//Flash messages
require('./config/middleware/upgrade')(app);

// Bootstrap routes
require('./config/routes')(app, passport, auth, user);


var server = app.listen(app.settings.port, function(){
  util.log(util.format("Express server listening on port: '%d' in '%s' mode", app.settings.port, app.settings.env));
});

// Express 3.0 returns the server after the call to `listen`.
require('./app/socket-io')(app, server);