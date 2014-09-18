
var ConnectRoles = require('connect-roles');    


module.exports = function () {

  var user = new ConnectRoles({

    failureHandler: function (req, res, action) {

      // optional function to customize code that runs when
      // user fails authorization
      var accept = req.headers.accept || '';
      res.status(403);

      if (~accept.indexOf('html')) {
        res.render('access-denied', {action: action});
      } else {
        res.send('Access Denied - You don\'t have permission to: ' + action);
      }
    }

  });


	//anonymous users can only access the home page
	//returning false stops any more rules from being
	//considered
	user.use(function (req, action) {
	  if (!req.isAuthenticated()) return action === 'access home page';
	})

	//moderator users can access private page, but
	//they might not be the only ones so we don't return
	//false if the user isn't a moderator
	user.use('access admin page', function (req) {
	  if (req.currentUser.role === 'moderator' || req.currentUser.role === 'admin') {
	    return true;
	  }
	});

	//admin users can access all pages
	user.use(function (req) {
	  if (req.currentUser.role === 'admin') {
	    return true;
	  }
	});


  return user;

}


