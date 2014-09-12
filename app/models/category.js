var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: {type: String, index: { unique: true }, required: true, trim: true},
  user: {type : Schema.ObjectId, ref : 'User'},
  createdDate  : {type : Date, default : Date.now},
  modifiedDate  : {type : Date}
});

CategorySchema.method('toClient', function() {

    var obj = this.toObject();

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



// pre save hooks
CategorySchema.pre('save', function(next) {

  if(!this.isNew) {
    this.modifiedDate = new Date;
  }
  
  return next();
});


CategorySchema.statics = {

	loadById: function (id, cb) {
		this.findOne({ _id : id })
		  .populate('user', 'username')
		  .exec(cb);
	},

	loadByIdAndUser: function (id, userId, cb) {
		this.findOne({ _id : id, user : userId })
		  .populate('user', 'username')
		  .exec(cb);
	},

	// createCategory: function(userId, category, cb){

	// 	User.findOne({ _id: userId }, function (err, user) {

	// 	  if (err) return callback(err, null);

	// 	  user.categories.push({name: category});

	// 	  user.save(function(err, user){

	// 	    if (err) return callback(err, null);

	// 	    return callback(null, user.categories);

	// 	  });

	// 	});
	// },

	list: function(options, cb){
		
		var criteria = options.criteria || {};

		this.find(criteria)
			.populate('user', 'username')
			// .sort({'createdDate': -1}) //sort by date, -1 (desc) or 1 (asc)
			.sort({'title': 'asc'}) //sort by date
	//			.sort({'title': 'asc'}) //sort by date
			// .limit(options.limit)
			// .skip(options.limit * options.page)
			.exec(cb);
	}


}
 



module.exports = mongoose.model('Category', CategorySchema);   

