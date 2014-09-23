
var fs = require('fs');
var util = require('util');
var cheerio = require('cheerio');
var UrlHelper = require("./urlHelper");

var ImportUrlHelper = {

	process: function(opts, cb){ 
		
		var sourcePath = opts.path;

		console.log(sourcePath);

		//load file
		fs.readFile(sourcePath, "utf8", function(err, data){

			if (err) 
				return cb(err);
	
			$ = cheerio.load(data);


			var links = [];
			$('a').each(function(i, element){
				links.push(element.attribs.href);
			});

			
			var cont = 0;
			var length = links.length;
			var linksData = [];

			for (var i in links){

				UrlHelper.scrapData(links[i], function(err, data){

					cont ++;
					if (err){
						console.log(err);
					}

					linksData.push(data);

					if (cont === length){
						cb(null, linksData);
					}

				});		
			}
			
		});

	}	

}

module.exports = ImportUrlHelper;