
define(function() {

  var initialize = function() {
    console.log("[linknizer.initialize]");
    checkLogin(runApplication);
  };

  var checkLogin = function(callback) {

    $.ajax("/api/authenticated", {
      method: "GET",
      success: function() {
        return callback(true);
      },
      error: function(data) {
        return callback(false);
      }
    });
  };

  var runApplication = function(authenticated) {
    if (!authenticated) {
      App.router.navigate("/login", true);
    } else {
      App.router.navigate("/links", true);
    }

  };

  return {
    initialize: initialize
  };

});
