
/**
 * Module dependencies.
 */

    var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      crypto = require('crypto'),
      _ = require('underscore'),
      AppError = require("../helpers/appError");

    var oAuthTypes = [
      'twitter',
      'facebook',
      'google'
    ];      

    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,4}))$/;

    //Example: john.doe, only letters, numbers and dots. no spaces, or anything else. Its very simple
    var usernameRegex = /(^[a-z0-9](?=[a-z0-9.]{1,60}$)[a-z0-9]*.?[a-z0-9]*$)/;

    //===Embedded Schemas Start=========================================//
    //===Embedded Schemas End===========================================//
 

    var UserSchema = new Schema({

      email: { type: String, unique: true, 
               lowercase: true, match: emailRegex },

      username: { type: String, unique: true, 
                  index: { unique: true }, lowercase: true, 
                  match: usernameRegex },
      name: { type: String, default: '' },
      role: { type: String, default: '' },
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
    UserSchema.path('email').validate(function(email) {
      if (this.skipValidation()) return true;
      return email.length
    }, 'Email cannot be blank');

    UserSchema.path('username').validate(function(username) {
      if (this.skipValidation()) return true;
      return username.length
    }, 'Username cannot be blank');

    UserSchema.path('hashed_password').validate(function(hashed_password) {
      if (this.skipValidation()) return true;
      return hashed_password.length
    }, 'Password cannot be blank');


    // pre save hooks
    UserSchema.pre('save', function(next) {

      if(!this.isNew) {
        this.modifiedDate = new Date;
        return next();
      }
      if (!this.username){
        this.username = this._id;
      }

      if (!validatePresenceOf(this.password) && !this.skipValidation()) {
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



/**
 * Methods
 */

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },

  makeSalt: function() {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  encryptPassword: function(password) {
    if(!password) return ''
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
  },

  /**
   * Validation is not required if using OAuth
   */
  skipValidation: function() {
    var x = ~oAuthTypes.indexOf(this.provider);
    console.log("skipValidation=["+x+"]");
    return ~oAuthTypes.indexOf(this.provider);
  },  

  isAdmin: function() {
    // if(role && role === 'admin') return true;
    if (this.username === 'admin') return true;
    return false;
  },  

  toClient: function() {
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
  }

 };    

/*
  static methods
*/
UserSchema.statics = {
 
  //http://mongoosejs.com/docs/2.7.x/docs/methods-statics.html
  validateEmail: function(email) {
      return emailRegex.test(email);
  },

  load: function (options, cb) {
    options.select = options.select || 'name username';
    this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
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


