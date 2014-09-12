



define(['backbone', 'text!templates/header.html'], function(Backbone, headerTemplate){

    var HeaderView = Backbone.View.extend({

        template: _.template(headerTemplate),

        initialize: function () {
            this.render();
        },

        render: function () {
            $(this.el).html(this.template());
            return this;
        },

        selectMenuItem: function (menuItem) {
            $('.nav li').removeClass('active');
            if (menuItem) {
                $('.' + menuItem).addClass('active');
            }
        }

    });

    return HeaderView;

});
