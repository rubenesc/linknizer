
var moment = require('moment');

var parseDateFormats = [
						'MM/DD/YY @ HH:mm', 'MM/DD/YY HH:mm',
                        'MM/DD/YYYY @ HH:mm', 'MM/DD/YYYY HH:mm',
				     	'DD MMM YY @ HH:mm', 'DD MMM YY HH:mm',
                        'DD MMM YYYY @ HH:mm', 'DD MMM YYYY HH:mm',
                        'DD/MM/YY @ HH:mm', 'DD/MM/YY HH:mm',
                        'DD/MM/YYYY @ HH:mm', 'DD/MM/YYYY HH:mm',
                        'DD-MM-YY @ HH:mm', 'DD-MM-YY HH:mm',
                        'DD-MM-YYYY @ HH:mm', 'DD-MM-YYYY HH:mm',
                        'YYYY-MM-DD @ HH:mm', 'YYYY-MM-DD HH:mm',
                        'DD MMM @ HH:mm', 'DD MMM HH:mm'],
    displayDateFormat = 'DD MMM YY @ HH:mm';

/**
 * Add missing timestamps
 */
var verifyTimeStamp = function (dateString) {
    if (dateString && !dateString.slice(-5).match(/\d+:\d\d/)) {
        dateString += ' 12:00';
    }
    return dateString;
};


var DateHelper = {

	//Parses a string to a Moment
	parseDateString: function (value) {
		return value ? moment(verifyTimeStamp(value), parseDateFormats, true) : undefined;
	},

	//Formats a Date or Moment
	formatDate: function (value) {
	    return verifyTimeStamp(value ? moment(value).format(displayDateFormat) : '');
	},

	/*
	*   Convert String in to Date Object
	*   strDate = "07/23/2014"
	*   format = "mm/dd/yyyy" (optional, defaults to mm/dd/yyyy)
	*
	*	return Date Object
	*/
	buildDate: function(strDate, format){

		if (!format){
			format = "mm/dd/yyyy";
		}

		if (format === "mm/dd/yyyy"){
			var arr = strDate.split("/");
			return new Date(arr[2], arr[0] - 1, arr[1]);
		} else if (format === "dd/mm/yyyy"){
			var arr = strDate.split("/");
			return new Date(arr[2], arr[1] - 1, arr[0]);
		}

		return new Date();
	}

}


module.exports = DateHelper;

