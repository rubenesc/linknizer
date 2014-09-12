
// http://dustinsenos.com/articles/customErrorsInNode

var util = require('util');
var Http = require('http');


//Abstract Error constructor
var AbstractError = function (msg, constr) {

	// If defined, pass the constr property to V8's
  	// captureStackTrace to clean up the output
	Error.captureStackTrace(this, constr || this);
	
	// If defined, store a custom error message
	this.message = msg || 'Error'; 

};

// Extend AbstractError from Error
util.inherits(AbstractError, Error);

//Abstract error a name property.
AbstractError.prototype.name = 'Abstract Error';

//---start AppError ---//
var AppError = function (/* (new Error) or (code, message) */ ) {
  AppError.super_.call(this, msg, this.constructor);

  if (arguments[0] instanceof Error) {

  	//Error
  	var error = arguments[0];
  	this.data = error;
  	this.response.code = error.code || 500;
  	if (error.message){
  		this.message = error.message;
  	}

  } else {

  	//code, message
  	var code = arguments[0];
  	var message = arguments[1];

 	//First argument must be a number (400+)
  	if ( !isNaN(parseFloat(code)) && isFinite(code) && code >= 400 ){
	  	this.response.code = code;
  	} else {
	  	this.response.code = 500;
	}

  	if (message){
		this.message = message;
  	}

  	var payloadError = Http.STATUS_CODES[this.response.code] || 'Unknown';
	util.debug("payloadError: " + payloadError); 
  }


};

util.inherits(AppError, AbstractError);

AppError.prototype.name = 'Application Error';
//---end AppError ---//


var badRequestError = function(message){
	return new AppError(400, message);
};

module.exports = {
  AppError: AppError,
  badRequest: badRequestError
}