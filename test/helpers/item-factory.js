var mongoose = require('mongoose');
var	Item = mongoose.model('Item');
var fs = require('fs');


var ItemFactory = {

	create: function(url, title, category, tags, imagePath){

		if (imagePath){
			var imageStream = fs.createReadStream(imagePath);
		}

		var item = {
			url: url || "",
			title: title || "",
			tags: tags || "",
			category: category || "",
			image: imageStream || ""

		}

		return item;
	}
	
}

module.exports = ItemFactory;