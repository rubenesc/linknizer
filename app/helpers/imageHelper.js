var fs = require('fs');
var util = require('util');

var FileHelper = require("../helpers/fileHelper");
var ApplicationError = require("../helpers/applicationErrors");

var env = process.env.NODE_ENV || 'development'
var config = require('../../config/config')[env];

var knox = require('knox').createClient({
    key: config.s3.key,
    secret: config.s3.secret,
    bucket: config.s3.bucket
});

var gm = require("gm");
var im = gm.subClass({ imageMagick: true });

var renditions = {
	one: 600,
	two: 300,
	three: 90
}


var ImageHelper = {


    /**
     * 
     * @param url: https://s3.amazonaws.com/bucket/130721/ab3a/000002/i/13072116.jpeg
     * 
     * @return {
     *      url: https://s3.amazonaws.com/bucket/130721/ab3a/000002/i/r/130721160.jpeg
     *      90:       https://s3.amazonaws.com/bucket/130721/ab3a/000002/i/r/13072116090.jpeg,
     *      300:      https://s3.amazonaws.com/bucket/130721/ab3a/000002/i/r/13072116300.jpeg,
     *      600:      https://s3.amazonaws.com/bucket/130721/ab3a/000002/i/r/13072116600.jpeg",
     *      }
     *
     */
    buildRenditionUrls: function(url, bucketname){

		var lis = url.lastIndexOf("/"); 
		var renditionUrl = url.substring(0,lis).concat("/r").concat(url.substring(lis));

		var lid = renditionUrl.lastIndexOf("."); 

        return {
        	url: url,
            90: renditionUrl.substring(0,lid).concat(renditions.three).concat(renditionUrl.substring(lid)),
            300: renditionUrl.substring(0,lid).concat(renditions.two).concat(renditionUrl.substring(lid)),
            600: renditionUrl.substring(0,lid).concat(renditions.one).concat(renditionUrl.substring(lid))
        }

    },


    /**
     * 
     * @param url: https://s3.amazonaws.com/bucket/130721/ab3a/000002/i/13072116.jpeg
     *
     */
	deleteItem: function(url, cb){

		// 130721/ab3a/000002/i/13072116.jpeg
		var relativeFilePath = FileHelper.convertToRelativePath(url, config.s3.bucket);

		knox.deleteFile(relativeFilePath, function(err, res){

			if (err)return cb(err);

			return cb();
		});

	},

    /**
     * 
     * General method in charge of putting together all process of retrieving 
     * an uploaded image and :
	 * 
     *  1. generating the appropriate renditions based on the uploaded image.
     *          - resizing to a width of no more than ...
     *          - creating a square thumbnail of ...
     *
     *  2. uploading the generated renditions to S3, to an items path, according
     *     to the user.
	 *
     *  3. delete the images from the servers file system once they have been 
     *     uploaded to S3.
     *
	 *
     * @param opts: {request: request with the information of the uploaded image.
     *                isUpdate: true or false
     *                updateUrl: if isUpdate=true, then https://s3.amazonaws.com/bucket/130721/1035/000002/i/130721rz.jpeg
     *				}     
     *
     * @return url1: the url of the uploaded image in S3
     *         url2: the url of thumbnail in S3
     */
	processItem: function(opts, cb){

		var req = opts.request;

		// /tmp/7953dc2bbb28f8698afb8020bcc390f7 
		// it is in a temp folder in the servers filesystem.
		var sourcePath = req.files.image.path;

		ImageHelper.resizeImages(sourcePath, function(err, resizeTarget1, resizeTarget2, resizeTarget3){

			if (err) return cb(err);

			ImageHelper.uploadFilesToS3(opts, sourcePath, resizeTarget1, resizeTarget2, resizeTarget3, function(err, url1, url2){

				if (err) return cb(err);

				ImageHelper.removeTempFiles( sourcePath, resizeTarget1, resizeTarget2, resizeTarget3, function(err){

					if (err) return cb(err);

					return cb(null, url1, url2);

				});

			});

		});

	},


    /**
     * 
     * @param sourcePath: /tmp/b83a3d84be9b4dc1bf90426f988a3ba3
     *
     * @return resizeTarget1: /tmp/600_r_b83a3d84be9b4dc1bf90426f988a3ba3
     *         resizeTarget2: /tmp/350_r_b83a3d84be9b4dc1bf90426f988a3ba3
     *         resizeTarget3: /tmp/150_r_b83a3d84be9b4dc1bf90426f988a3ba3
     */	
	resizeImages: function(sourcePath, cb){

		// /tmp/600_r_b83a3d84be9b4dc1bf90426f988a3ba3
		var target1 = ImageHelper.buildTargetPath(sourcePath, renditions.one + "_r_");

 		ImageHelper.resizeImage(sourcePath, target1, renditions.one, false, function(err, sourcePath1, resizeTarget1){

		 	if (err)return cb(err);

		 	// /tmp/350_r_b83a3d84be9b4dc1bf90426f988a3ba3
	   		var target2 = ImageHelper.buildTargetPath(sourcePath, renditions.two + "_r_");

			ImageHelper.resizeImage(resizeTarget1, target2, renditions.two, false, function(err, sourcePath2, resizeTarget2){

				if (err) return cb(err);

			 	// /tmp/150_r_b83a3d84be9b4dc1bf90426f988a3ba3
		   		var target3 = ImageHelper.buildTargetPath(sourcePath, renditions.three + "_r_");

				ImageHelper.resizeImage(sourcePath, target3, renditions.three, true, function(err, sourcePath3, resizeTarget3){
	
					if (err) return cb(err);

					return cb(null, resizeTarget1, resizeTarget2, resizeTarget3);

				});

			});

		 });

	},


    /**
     * 
     * @param opts: {request: request object
     *                isUpdate: true or false
     *                updateUrl: if isUpdate=true, then https://s3.amazonaws.com/bucket/130721/1035/000002/i/130721rz.jpeg
     *				}
     * @param source: /tmp/3bd15a35e3ff26a19e674b74adaf91dd
     * @param file1:  /tmp/600_r_3bd15a35e3ff26a19e674b74adaf91dd
     * @param file2:  /tmp/350_r_3bd15a35e3ff26a19e674b74adaf91dd
     * ...
     *
     * @return s3Url1: https://s3.amazonaws.com/bucket/130721/1035/000002/i/130721za.jpeg
     *         s3Url2: https://s3.amazonaws.com/bucket/130721/1035/000002/i/r/130721za600.jpeg
     *         s3Url3: https://s3.amazonaws.com/bucket/130721/1035/000002/i/r/130721za350.jpeg
	 *         ...
     */	
	uploadFilesToS3: function(opts, source, file1, file2, file3, cb){

		var req = opts.request;
		var contentType = req.files.image.type;
		
		// 130721/1035/000002/i/130721za.jpeg
		if (opts.isUpdate){
			var itemPath = FileHelper.convertToRelativePath(opts.updateUrl, config.s3.bucket);
		} else {
			var itemPath = FileHelper.buildItemPath(req.user._id, req.files.image.name);
		}

		// 130721/1035/000002/i/r/130721za600.jpeg <-- this depends on itemPath
		var renditionPath1 = FileHelper.buildRenditionPath(itemPath, renditions.one);

		//upload rendition 0
		ImageHelper.uploadFileToS3(source, itemPath, contentType, function(err, s3Url1){

			if (err) return cb(err);
			//upload rendition 1
			ImageHelper.uploadFileToS3(file1, renditionPath1, contentType, function(err, s3Url2){

				if (err) return cb(err);

				// 130721/1035/000002/i/r/130721za350.jpeg]
				var renditionPath2 = FileHelper.buildRenditionPath(itemPath, renditions.two);
		
				//upload rendition 2
				ImageHelper.uploadFileToS3(file2, renditionPath2, contentType, function(err, s3Url3){

					if (err) return cb(err);

					var renditionPath3 = FileHelper.buildRenditionPath(itemPath, renditions.three);

					//upload rendition 3
					ImageHelper.uploadFileToS3(file3, renditionPath3, contentType, function(err, s3Url4){

						if (err) return cb(err);

						//done!
						return cb(null, s3Url1, s3Url2, s3Url3, s3Url4);

					});

				});

			});

		});

	},

    /**
     * 
     * @param sourcePath: /tmp/69c0a0336850e88beea02573491dba52
     * @param targetPath: 130721/a235/000002/i/130721fn.jpeg
     * @param contentType: image/jpeg
     *
     * @return url: https://s3.amazonaws.com/bucket/130721/a235/000002/i/130721fn.jpeg
     *
     */	
	uploadFileToS3: function (sourcePath, targetPath, contentType, cb){

		//upload file to S3
		knox.putFile(sourcePath, targetPath, 
				{'Content-Type': contentType,
				  'x-amz-acl': 'public-read'}, function(err, result) {

			if(err) return cb(err);
			
		    if (200 == result.statusCode) { 

				return cb(null, result.client._httpMessage.url);

			} else { 

				var errors = ["Failed to upload file to Amazon S3"];
				var message = "Item could not be created, result status: " + result.statusCode;

				return cb(new ApplicationError.Validation(message, errors)); //return a 400
			}
		});
	},

	resizeImage: function(source, target, width, squareImg, cb){

		ImageHelper.getNewImageSize(source, width, squareImg, function(err, newWidth, newHeight){

			if (err) return cb(err);			

			ImageHelper.resizeAndSquare(source, target, newWidth, newHeight, squareImg, function(err, data){

				if (err) return cb(err);			

				cb(null, source, target);

			});

		});

	},

    resizeAndSquare: function(source, target, width, height, squareImg, cb){

	    ImageHelper.resize(source, target, width, height, function(err){

			if (err) return cb(err);			

		    if (squareImg){

	    		ImageHelper.crop(target, target, width,width, 0, 0, function(err){

					if (err) return cb(err);			

					return cb();

	    		});	

		    } else {
				return cb();
		    }

	    });

    },


    /**
     *
     * Deletes files from the servers file system. 
	 *
     * @param file1: /tmp/69c0a0336850e88beea02573491dba52
     * ...
     *
     */	
	removeTempFiles: function(file1, file2, file3, file4, cb){

		fs.unlink(file1, function(err) {

			if (err) return cb(err);

			fs.unlink(file2, function(err) {

				if (err) return cb(err);

				fs.unlink(file3, function(err) {

					if (err) return cb(err);

					fs.unlink(file4, function(err) {

						if (err) return cb(err);

						return cb();

					});

				});

			});

		});

	},


    /**
     * 
     * @param source: /tmp/7953dc2bbb28f8698afb8020bcc390f7 
     * @param prefix: "_resize_150_"
     *
     * @return path: /tmp/_resize_150_7953dc2bbb28f8698afb8020bcc390f7 
     *         
     */	
	buildTargetPath: function(source, prefix){
		var l = source.lastIndexOf("/") + 1;
		return source.substring(0, l) + prefix + source.substring(l);
    },

    getNewImageSize: function(source, width, squareImg, cb){

		//get the images size
		im(source).size(function (err, size) {

			if (err) return cb(err);

		    var thumbWidth = width;

		    var thumbHeight = ImageHelper.calculateNewHeight(size.width, size.height, width);

		    if (squareImg){

		    	if (thumbHeight < width){
		    		thumbHeight = width;
		    		thumbWidth = ImageHelper.calculateNewWidth(size.width, size.height, width);
		    	}

		    }

		    cb(null, thumbWidth, thumbHeight);
	   });
    },

   calculateNewHeight: function(imageWidth, imageHeight, newWidth) {
        var aspectRatio =  imageHeight /  imageWidth;
        var newHeight = (aspectRatio *  newWidth);
        return newHeight;
    },

    calculateNewWidth: function(imageWidth, imageHeight, newHeight) {
        var aspectRatio =  imageWidth / imageHeight;
        var newWidth = (aspectRatio *  newHeight);
        return newWidth;
    }, 

	resize: function(source, target, width, height, cb){

		im(source)
		.resize(width, height)
		// .noProfile()
		.write(target, function (err) {

			if (err) return cb(err);

			return cb();
			
		});
	},

	crop: function(source, target, width, height, x, y, cb){

		im(source)
			.crop(width, height, x, y)
			.write(target, function (err) {

			if (err) return cb(err);

			return cb();

		});
	}

}

module.exports = ImageHelper;



