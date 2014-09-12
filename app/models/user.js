
/**
 * Module dependencies.
 */

    var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      crypto = require('crypto'),
      _ = require('underscore'),
      authTypes = ['twitter', 'facebook', 'google'],
      AppError = require("../helpers/appError");

    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,4}))$/;

    //Example: john.doe, only letters, numbers and dots. no spaces, or anything else. Its very simple
    var usernameRegex = /(^[a-z0-9](?=[a-z0-9.]{1,60}$)[a-z0-9]*.?[a-z0-9]*$)/;

    //===Embedded Schemas Start=========================================//
    //===Embedded Schemas End===========================================//
 

    var UserSchema = new Schema({

      email: { type: String, unique: true, 
               lowercase: true, match: emailRegex },

      username: { type: String, unique: true, required: true, 
                  index: { unique: true }, lowercase: true, 
                  match: usernameRegex },
      name: { type: String, default: '' },
      provider: { type: String, default: '' },
      hashed_password: { type: String, default: '' },
      salt: { type: String, default: '' },
      authToken: { type: String, default: '' },
      facebook: {},
      twitter: {},
      github: {},
      google: {},
      createdDate: { type: Date, default: Date.now },
      modifiedDate: { type: Date }
    });

    // virtual attributes
    UserSchema
      .virtual('password')
      .set(function(password) {
        this._password = password
        this.salt = this.makeSalt()
        this.hashed_password = this.encryptPassword(password)
      }).get(function() {
        return this._password
      });


    // validations
    var validatePresenceOf = function(value) {
      return value && value.length
    };

    // the below 4 validations only apply if you are signing up traditionally
    UserSchema.path('name').validate(function(name) {
      // if you are authenticating by any of the oauth strategies, don't validate
      if(authTypes.indexOf(this.provider) !== -1) return true
      return name.length
    }, 'Name cannot be blank');

    UserSchema.path('email').validate(function(email) {
      // if you are authenticating by any of the oauth strategies, don't validate
      if(authTypes.indexOf(this.provider) !== -1) return true
      return email.length
    }, 'Email cannot be blank');

    UserSchema.path('username').validate(function(username) {
      // if you are authenticating by any of the oauth strategies, don't validate
      if(authTypes.indexOf(this.provider) !== -1) return true
      return username.length
    }, 'Username cannot be blank');

    UserSchema.path('hashed_password').validate(function(hashed_password) {
      // if you are authenticating by any of the oauth strategies, don't validate
      if(authTypes.indexOf(this.provider) !== -1) return true
      return hashed_password.length
    }, 'Password cannot be blank');


    // pre save hooks
    UserSchema.pre('save', function(next) {

      if(!this.isNew) {
        this.modifiedDate = new Date;
        return next();
      }

      //if no name is specified, then I'll use the username
      // if (!name){
      //   name = username;
      // }
      if(!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1){
        next(new AppError('Invalid password'))
      } else {
        next();
      } 

    });



      // UserSchema.pre("save",function(next, done) {
      //     var self = this;
      //     mongoose.models["User"].findOne({username : self.username},function(err, user) {
      //         if(err) {
      //             done(err);
      //         } else if(user) {
      //             self.invalidate("username","username must be unique");
      //             done(new AppError("username must be unique"));
      //         } else {
      //             done();
      //         }
      //     });
      //     next();
      // });

  /*
    Methods
  */
  UserSchema.method('authenticate', function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  });

  UserSchema.method('makeSalt', function() {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  });

  UserSchema.method('encryptPassword', function(password) {
    if(!password) return ''
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
  });


  UserSchema.method('toClient', function() {
    var obj = this.toObject();

    //remove _ from id's
    if (obj._id){
        obj.id = obj._id;
        delete obj._id;
    }

    //delete security fields
    delete obj.provider;
    delete obj.hashed_password;
    delete obj.salt;
    delete obj.authToken;
    delete obj.facebook;
    delete obj.twitter;
    delete obj.github;
    delete obj.google;

    return obj;
});

/*
  static methods
*/
UserSchema.statics = {
 
  //http://mongoosejs.com/docs/2.7.x/docs/methods-statics.html
  validateEmail: function(email) {
      return emailRegex.test(email);
  },

  // createCategory: function(userId, category, cb){

  //   User.findOne({ _id: userId }, function (err, user) {

  //     if (err) return callback(err, null);

  //     user.categories.push({name: category});

  //     user.save(function(err, user){

  //       if (err) return callback(err, null);

  //       return callback(null, user.categories);

  //     });

  //   });

  // },

  findByEmail: function(email, callback) {
    if (!email){
      return callback(new AppError('email is required'));
    }

    return this.findOne({email: email.toLowerCase()}, callback);
  },

  findByUsername: function(username, callback) {

    if (!username){
      return callback(new AppError('username is required'));
    }

    return this.findOne({username: username.toLowerCase()}, callback);
  },

  findByUniqueFields: function(user, callback){

    var UserModel = mongoose.model('User');

    UserModel.findByUsername(user.username, function(err, data){

      if (err){
        return callback(err);
      } else {
        if (data){
          return callback(null, data, 'username'); //found user by username
        } else {
          UserModel.findByEmail(user.email, function(_err, _data){
            if (_err){
              return callback(_err);
            } else {
              if (_data){
                return callback(null, _data, 'email'); //found user by email
              } else {
                return callback(null, null);
              }

            }
          });
        }
      }
    });
  }
}

module.exports = mongoose.model('User', UserSchema);   


