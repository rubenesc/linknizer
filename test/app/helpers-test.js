var should = require('should');
var prettyjson = require('prettyjson');
var mongoose = require('mongoose');
var	User = mongoose.model('User');
var UserFactory = require("../helpers/user-factory");
var util = require("util");
var FileHelper = require("../../app/helpers/FileHelper");
var ImageHelper = require("../../app/helpers/ImageHelper");


/**
	tests:
	
	create a new user
	
	should generate relative user path based on users Id

	delete a user

**/

describe('test user helper methods', function () {

	var user = null;
	var username = null;

	before(function(done){

		console.log();
		console.log('========== start helpers-test ========== ');

		//create test user
		user = new User(UserFactory.create(
			'scott.tiger@link.com', 'scott.tiger',
			'Scott Tiger', '1234'));

		
		done();
		// user.save(function(err, data) {
		// 	if(err) {
		// 		return done(err);
		// 	} else {
		// 		data.should.have.be.a('object');
		// 		data.should.have.property('_id');
		// 		done();
		// 	}
		// });
	});

	it('should generate relative user path based on users Id', function () {

		console.log();
		util.debug("should generate relative user path based on users Id");

		var relativeUserPath = FileHelper.getRelativeUserPath(user._id);
		util.debug("user.id ["+user._id+"] relativeUserPath: " + relativeUserPath);
	});	


	it('should retrieve S3 Url relative path', function () {

		console.log();
		util.debug("should retrieve S3 Url relative path");
		
		var url = 'https://s3.amazonaws.com/somebucket/130721/ab3a/000002/i/13072116.jpeg'
		
		var relativePath = FileHelper.convertToRelativePath(url, 'somebucket');

		relativePath.should.be.equal('130721/ab3a/000002/i/13072116.jpeg');
		util.debug("["+url+"]["+relativePath+"]");
	});

	it('should build image rendition urls', function () {

		console.log();
		util.debug("should build image rendition url");
		
		var url = 'https://s3.amazonaws.com/somebucket/130721/ab3a/000002/i/13072116.jpeg'
		
		var imageUrls = ImageHelper.buildRenditionUrls(url, 'somebucket');

		util.debug("["+url+"]");
		util.debug(prettyjson.render(imageUrls));

	});


	after(function(done){

		console.log();
		console.log('========== end helpers-test ========== ');
		console.log();

		//delete test user
		user.remove(function(err){

			if (err) return done(err);

			return done();

		});

	});	

});




