/**
 * Module dependencies.
 */

var express = require('express'),
  mongoStore = require('connect-mongo')(express),
  flash = require('connect-flash'),
  viewHelpers = require('./middleware/view'),
  util = require('util'),
  expressValidator = require('express-validator'),
  ApplicationError = require("../app/helpers/applicationErrors");


module.exports = function(app, config, passport) {

  app.configure(function() {

    app.set('port', process.env.PORT || 3000);
    app.set('showStackError', true);

    // should be placed before express.static
    app.use(express.compress({
      filter: function(req, res) {
        console.log(res.getHeader('Content-Type'));
        return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
      },
      level: 9
    }));

    //Set response headers
    app.use(function(req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return next();
    });

    // set views path, template engine and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));

    // dynamic helpers
    app.use(viewHelpers(config));

    // limit the size of the request body depending on the content type.
    app.use(type('application/x-www-form-urlencoded', express.limit('64kb')));
    app.use(type('application/json', express.limit('32kb')));
    app.use(type('image', express.limit('3mb')));
    app.use(type('video', express.limit('5mb')));

    // bodyParser should be above methodOverride
    app.use(express.bodyParser());
    app.use(expressValidator);      
    app.use(express.methodOverride());

    // cookieParser should be above session
    app.use(express.cookieParser());

    // express/mongo session storage
    app.use(express.session({
      secret: config.sessionSecret,
      store: new mongoStore({
        url: config.db,
        collection: 'sessions'
      })
    }));

    // connect flash for flash messages
    app.use(flash());

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());    

    //compile coffee script or javascript out of an assets directory.
    app.use(require('connect-assets')());

    // routes should be at the last
    app.use(app.router);
    // sets up the public directory to use static files
    app.use(express.static(config.root + '/webapp'));

    //Error handling - after the router
    //http://expressjs.com/guide.html#error-handling
    app.use(logErrors);

    //handle errors
    app.use(function(err, req, res, next) {

      if (err instanceof ApplicationError.Validation){
        return res.send(400, {error: err} );
      }  

      if (err instanceof ApplicationError.ResourceNotFound){
        return res.send(404, {error: err} );
      }  

      //if it has a message then it was a cosume error
      if (err.message){

        var errorObj = { message: err.message, code: err.code};
        return res.send(err.status?err.status:'500', {error: errorObj} );
      }

      // if it has stack then something went really bad
      if (err.stack){
        return res.send('500', {
          error: 'Internal Server Error'
        });
      }
    
      //the next handler is the 404.
      next();

    });

    // assume 404 since no middleware responded
    app.use(function(req, res, next) {

      res.send('404', {
        message: "not found ...",
        url: req.url
      });

    });

  });

  app.configure('development', function() {

    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));

  });

  app.configure('test', function() {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    app.set('port', 3001);
  });

  app.configure('production', function() {
    app.use(express.errorHandler());
  });

}


//Wrap multiple limit() middleware based on the Content-Type of the request
function type(type, fn) {

  return function(req, res, next){

    var ct = req.headers['content-type'] || '';
    if (0 != ct.indexOf(type)) {
      return next();
    }
      
    fn(req, res, next);
  }

}



//refactor get move this somewhere else
function logErrors(err, req, res, next) {

  //I dont want to log any ValidationErrors
  if (!(err instanceof ApplicationError.Validation) && 
        !(err instanceof ApplicationError.ResourceNotFound)){

    if (err.stack){
      util.error("--server error stack --> " + err.stack);
    } else {
      if (err.message){
        util.error("--server error message --> " + err.message);
      }
    }

  }

  next(err);
}

// app.configure(function() {
//   app.set('port', process.env.PORT || 3000);
//   app.use(app.router);
// });