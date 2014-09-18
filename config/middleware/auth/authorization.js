
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {

  if (!req.isAuthenticated()) {
   // return res.send(403, "requires authentication");
    return res.redirect('/login')
  }

  next(); 
};


/*
 *  User authorizations routing middleware
 */

exports.user = {
    hasAuthorization : function (req, res, next) {

      if (req.profile.id != req.user.id) {
//       return res.send(403, "you do not have authorization");
            return res.redirect('/login', {msg: "you do not have authorization"})
      }
      
      next();
    }
}


/*
 *  Article authorizations routing middleware
 */

exports.link = {
    hasAuthorization : function (req, res, next) {

      console.log("");
      console.log("link.hasAuthorization ");
      console.log(require('util').inspect(req.link, { showHidden: false, depth: null }));

      if (req.link.id != req.user.id) {
        //return res.send(403, "you do not have authorization.");
          return res.redirect('/login', {msg: "you do not have authorization"})

      }
      next();
    }
}
