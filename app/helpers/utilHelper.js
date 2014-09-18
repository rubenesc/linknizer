
var crypto = require('crypto');

var UtilHelper = {

   /*   http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript 
	*   Random values from limited set of characters
	*   random(10);         --> returns "rkp6rt7EBc"
	*	random(10, "ABBB"); --> returns "BABBBBABAB"
	*/
	random: function(howMany, chars) {
	    chars = chars 
	        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
	    var rnd = crypto.randomBytes(howMany)
	        , value = new Array(howMany)
	        , len = chars.length;

	    for (var i = 0; i < howMany; i++) {
	        value[i] = chars[rnd[i] % len]
	    };

	    return value.join('');
	}

}


module.exports = UtilHelper;

