

var FileHelper = {

    /**
     * @param url: https://s3.amazonaws.com/somebucket/130721/ab3a/000002/i/13072116.jpeg
     * @param bucketname: somebucket
     *
     * @return relative path: 130721/ab3a/000002/i/13072116.jpeg
     */
    convertToRelativePath: function(url, bucketname){

        var s3Domain = 'https://s3.amazonaws.com/'+bucketname;
        // 130721/ab3a/000002/i/13072116.jpeg
        return url.substring(s3Domain.length+1, url.length);
    },

    /**
     * Generates the path where the item will be stored 
     * in S3.
     *
     * @param userId: 51e79bf5083a925006000023
     * @param fileName: whatever.gif
     *
     * @return s3 file path: 13/07/18/083a92/5006/000023/i/yyMMddRR.gif
     */
    buildItemPath: function(userId, fileName){
        
        //yyMMddRR.gif
        var uniqueFileName = FileHelper.getUniqueFileName(fileName);
        //13/07/18/083a92/5006/000023
        var relativeUserPath = FileHelper.getRelativeUserPath(userId);
        //13/07/18/083a92/5006/000023/i/yyMMddRR.gif
        return relativeUserPath + "/i/" + uniqueFileName;
    },

    /**
     *
     * @param filePath: /51e8e769/446f66/000023/i/130719sy.jpeg
     * @param postfix: 150
     *
     * @return generated rendition Path: /51e8e769/446f66/000023/i/r/130719sy150.jpeg
     */
    buildRenditionPath: function(filePath, postfix){

        var lastIndex = filePath.lastIndexOf("/");

        if (postfix){

            var fileName = filePath.substring(lastIndex); // /130719sy.jpeg
            var lastIndex2 = fileName.lastIndexOf(".");   // 25

            // /51e8e769/446f66/000023/i/r/130719sy150.jpeg
            return filePath.substring(0,lastIndex)+"/r"+
                fileName.substring(0, lastIndex2)+postfix+fileName.substring(lastIndex2);

        } else {

            // /51e8e769/446f66/000023/i/r/130719sy.jpeg
            return filePath.substring(0,lastIndex)+"/r"+filePath.substring(lastIndex);
            
        }
    },

    /**
     * Based on the Users mongo object _id which is an auto generated id
     * it will give a unique structured path we can store his assets in
     *
     *  example: for an _id of 51e79bf5083a925006000023 
     *                  --> 13/07/18/083a92/5006/000023
     *
     * @param user _id
     * @return generated Path
     */
    getRelativeUserPath: function(objectId){

        var _id = objectId.toString();
        var hexDate = _id.slice(0,8);
        var iDate = parseInt(hexDate, 16);
        var lDate = iDate*1000;
        var date =  new Date(lDate);

        var machineId = _id.slice(8, 14);
        var processId = _id.slice(14, 18);
        var counter = _id.slice(18, 24);

        //a: 130718
        var a = FileHelper.yymmdd(date);

        //x: 130718/083a92/5006/000023
        var x = a + "/"+machineId+"/"+processId+"/"+counter;

        //y: 130718/083a92/5006/000023
        var y = a + "/"+machineId+"/"+counter;

        //z: 130718/5006/000023
        var z = a + "/"+processId+"/"+counter;

        return z;
    },

   /**
     * 
     * @param url: http://www.w3schools.com/jsref/tryit.asp
     * @return: tryit.asp;
     *
     */     
    getUrlFileName: function(url){

        return url.split('/').pop();
    },

   /**
     *
     * If I upload "image333.jpg" then it returns a file name with the following pattern:
     *
     * yyMMddRR.jpg
     *
     * which RR means: 2 digit random alpha numeric number.
     *
     * @return 130720sa.jpg
     *
     */	
	getUniqueFileName: function(fileName){

		var extention = this.getFileExtention(fileName);

		if (extention){
			extention = ".".concat(extention);
		}

		return this.yymmdd(new Date()).concat(this.randomAlphanumeric(2)).concat(extention);

	},

   /**
     * Returns the extention of a file (in lowercase) if there is any.
     *
     * Example: image333.jpg  --> jpg
     *          image333.jPg  --> jpg
     *          image333  -->
     *
     * @param fileName:
     * @return
     */
	getFileExtention: function(fileName){

		var extention;

		if (fileName && fileName.indexOf('.') > 0){
			extention = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
		} else {
			extention = "";
		}

		return extention;
	},


   /**
     * 
     * @param date: Thu Jul 18 2013 00:40:37 GMT-0700 (PDT)
     * @return: 130718
     *
     */     
	yymmdd: function(date) {         
                  
        var yy = date.getFullYear().toString().slice(2);
        var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based         
        var dd  = date.getDate().toString();        
                            
        return yy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]);
   	}, 

   /**
     * 
     * @param date: Thu Jul 18 2013 00:40:37 GMT-0700 (PDT)
     * @return: 13/07/18
     *
     */     
    yy_mm_dd: function(date) {         
                  
        var yy = date.getFullYear().toString().slice(2);
        var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based         
        var dd  = date.getDate().toString();        
                            
        return yy + "/" + (mm[1]?mm:"0"+mm[0]) + "/" + (dd[1]?dd:"0"+dd[0]);
    },    

   	randomAlphanumeric: function(length){

		var chars =  '0123456789abcdefghijklmnopqrstuvwxyz';

	    var result = '';
	    for (var i = length; i > 0; --i){
	    	result += chars[Math.round(Math.random() * (chars.length - 1))];	
	    } 

	    return result;
   	}
}

module.exports = FileHelper;