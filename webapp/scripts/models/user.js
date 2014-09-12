


define(['backbone'], function(Backbone){

	var User = Backbone.Model.extend({

	    urlRoot: "/api/users",

	    // idAttribute  : "_id",

		validate: function(attrs){

			// if (!attrs.title){
			// 	return 'A title is required.';
			// }
		},

    	isSignedIn : function() {
        	return !this.isNew();
      	},

		login: function(userData, onFail) {

			$.ajax({
				url       : '/api/login',
				type      : 'POST',
				dataType  : 'json',
				data      : userData,
				error     : onFail,
				success   : this.loginSuccess,
				context   : this
			});

			return this;
		},

		loginSuccess: function(data){
			
          App.currentUser = this.userData;
          App.router.navigate("/index", true);

		},

	    logout : function() {
	      $.ajax({
	        url: '/api/logout',
	        type: 'POST'
	        }).done(function() {
	          App.currentUser = {};
	        });
	      }

	    });      	

	return User;
});

