

var request = require('request');
var util = require('util');
var cheerio = require('cheerio');

exports.scrapData = function(url, cb){

	request(url, function(err, response, html){

		if (err) 
			return cb(err, null);

		var json = { title : "" };
		 
		if (!err && response.statusCode == 200) {

			 var $ = cheerio.load(html);

			 json.title = $('title').text();

	  	}
		
		return cb(null, json);

	});


}


