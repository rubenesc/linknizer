

var mongoose = require('mongoose')
    , cache_manager = require('cache-manager')
	, Config = mongoose.model('Config');

var memory_cache = cache_manager.caching({store: 'memory', max: 100, ttl: 10/*seconds*/});


// Instead of manually managing the cache like this:
function getCachedConfig(cb) {

    memory_cache.get("config", function (err, result) {

        if (err) { return cb(err); }

        if (result) {
            return cb(null, result);
        }

		Config.load(function(err, result) {

            if (err) { return cb(err); }
            
            memory_cache.set("config", result);
            
            cb(null, result);

        });
    });
}

var CacheHelper = {

	getConfig: function(cb) {

	    memory_cache.get("config", function (err, result) {

	        if (err) { return cb(err); }

	        if (result) {
	            return cb(null, result);
	        }

			Config.load(function(err, result) {

	            if (err) { return cb(err); }
	            
	            memory_cache.set("config", result);
	            
	            cb(null, result);

	        });
	    });
	},

	reset: function(){
		console.log("...reset cache...");
		memory_cache.reset();
	}

}


module.exports = CacheHelper;
