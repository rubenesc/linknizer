
var exphbs = require('express3-handlebars');
var moment = require('moment');


var DateFormats = {
       short: "MM/DD/YYYY",
       long: "dddd DD.MM.YYYY HH:mm"
};

module.exports = function () {

    // set views path, template engine and default layout
    var hbs = exphbs.create({
       defaultLayout: 'main',
        // Specify helpers which are only registered on this instance.
        helpers: {
          ifCond: function(v1, v2, options) {

              if(v1 === v2) {
                return options.fn(this);
              }
              return options.inverse(this);
          }, 

          // .../140603/48b3/d90261/i/  140627y2  .jpg
          // .../140603/48b3/d90261/i/r/140627y290.jpg
          getImageRendition: function(v1, v2, options){

           if (v1 && v2){

              // .../140603/48b3/d90261/i/140627y2.jpg

              //  .../140603/48b3/d90261/i/
              //  /r
              //  /140627y2
              //  90
              //  .jpg
              // -->.../140603/48b3/d90261/i/r/140627y290.jpg

              v1 = v1.substring(0, v1.lastIndexOf("/")) 
                    + "/r" 
                    + v1.substring(v1.lastIndexOf("/"), v1.lastIndexOf(".")) 
                    + v2 
                    + v1.substring(v1.lastIndexOf("."));

            }

            return v1;
          },

          // dateTime: Date Object
          // format: "short" || "long" || ...
          //
          // converts the Date Object to a String to display in an html page.
          formatDate: function(dateTime, format){

            var dateFormat = DateFormats[format]; //ex: MM/DD/YYYY
            return moment(dateTime).format(dateFormat);            
            
          }


        }
    });

	return hbs;

}
