
define(['baseView', 'text!templates/register.html'], function(BaseView, registerTemplate) {

  var registerView = BaseView.extend({

    requireLogin: false,

	el: $('#content'),

    events: {
      "submit form": "register"
    },

    register: function() {

      $.post('/api/users', {
        username: $('input[name=username]').val(),
        name: $('input[name=name]').val(),
        email: $('input[name=email]').val(),
        password: $('input[name=password]').val(),

      }, function(data) {

        App.router.navigate("/index", true);

      });

      return false;

    },

    render: function() {
      this.$el.html(registerTemplate);
    }

  });

  return registerView;
});
