var	_ = require('underscore');


var ErrorHelper = {

	createValidationMsg: function(msg, errors){

		var validationMessage = {
			message: msg,
			errors: errors
		};

		return validationMessage;
	},

	handleError: function(err, res, next, msg, statusCode){

		var errorMsgs = [];

		if (!err){
			var validationMessage = this.createValidationMsg(msg, errorMsgs);
			return res.send(statusCode, {error: validationMessage} );
		}

		if(_.isString(err)) {
			msg = err;
			var validationMessage = this.createValidationMsg(msg, errorMsgs);
			return res.send(statusCode, {error: validationMessage} );
		}

		if(err.code === 11000) {
			errorMsgs.push("record already exists");
			var validationMessage = this.createValidationMsg(msg, errorMsgs);
			return res.send(statusCode, {error: validationMessage} );
		} 

		if (err.name === 'ValidationError'){
			for (var path in err.errors){
				errorMsgs.push(path + ' is invalid');
			}

			var validationMessage = this.createValidationMsg(msg, errorMsgs);
			return res.send(statusCode, {error: validationMessage} );
		}

		return next(err);
	}
}

module.exports = ErrorHelper;