
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var fs = require('fs');
var ImageHelper = require("../helpers/imageHelper");


/**
 * Getters
 *
 * tags: ["tag1", "tag2", "tag3"]
 *
 * return "tag1,tag2,tag3"
 */
var getTags = function (tags) {
  return tags.join(',');
}

/**
 * Setters
 * 
 *  tags: "tag1,tag2,tag3"  or   ["tag1","tag2","tag3"]
 *      
 */
var setTags = function (tags) {
	
	//Check to see if tags is an array.
	if( Object.prototype.toString.call( tags ) === '[object Array]' ) {
		return tags;
	}

	//conver string to array and trim values;
	tags = tags.split(','); 
	tags.forEach(function(value, index){
  		tags[index] = value.trim();
  	});

  	return tags;
}

var ItemSchema = new Schema({
	url: {type: String, required: true, trim: true},
	title: {type: String, trim: true},
	category: {type: String, trim: true},
	tags: {type: [], get: getTags, set: setTags},
	user: {type : Schema.ObjectId, ref : 'User'},
    createdDate  : {type : Date, default : Date.now},
    modifiedDate  : {type : Date}
});


ItemSchema.method('toClient', function() {
    var obj = this.toObject();

    //build urls
	obj.image = ImageHelper.buildRenditionUrls(obj.url);
	delete obj.url;

	//remove _ from id's
	if (obj._id){
	    obj.id = obj._id;
	    delete obj._id;
	}

	if (obj.user._id){
		obj.user.id = obj.user._id;
		delete obj.user._id;
	}

    return obj;
});


ItemSchema.methods.saveAndDelete = function saveAndDelete (tempImagePath, cb) {

		var _this = this;
			//save obj
			this.save(function(err) {

				if(err) {
					return next(err);
				} else {

					if (tempImagePath){
			  			//delete temp file on our system
			  			fs.unlink(tempImagePath, function() {

			            	if (err) {
				  				cb(err);
			            	} else {
			            		cb(null, _this);
			            	}

						});
						
					} else {
	            		cb(null, _this);
					}
				}

			});

};

// pre save hooks
ItemSchema.pre('save', function(next) {

  if(!this.isNew) {
    this.modifiedDate = new Date;
  }
  
  return next();

});


/**
 * Validations
 */

ItemSchema.path('url').validate(function (url) {
  return url.length > 0
}, 'Item url cannot be blank');


/*
  static methods
*/
ItemSchema.statics = {


	loadById: function (id, cb) {
		this.findOne({ _id : id })
		  .populate('user', 'username')
		  .exec(cb);
	},

	list: function(options, cb){
		var criteria = options.criteria || {};

		this.find(criteria)
			.populate('user', 'username')
			.sort({'createdDate': -1}) //sort by date, -1 (desc) or 1 (asc)
//			.sort({'title': 'asc'}) //sort by date
//			.sort({'title': 'asc'}) //sort by date
		.limit(options.limit)
			.skip(options.limit * options.page)
			.exec(cb);
	}

}

mongoose.model('Item', ItemSchema);