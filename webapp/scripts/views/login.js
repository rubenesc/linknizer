

define(['baseView', 'models/user', 'text!templates/login.html'], 
  function(BaseView, UserModel, loginTemplate) {

  var loginView = BaseView.extend({

    requireLogin: false,
    
    el: $('#content'),

    events: {
      "submit form": "login"
    },

    login: function() {

      var user = new UserModel();
      user.login(this.$('form').serialize(), this.fail);

      return false;

    },

    fail: function(){
      
        $("#error").text('Unable to login.');
        $("#error").slideDown();
    },

    render: function() {

      this.$el.html(loginTemplate);
      $("#error").hide();
      $("input[name=email]").focus();

    }

  });

  return loginView;
});
