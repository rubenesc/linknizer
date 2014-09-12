
define(['baseView', 'text!templates/categories/category-list-item.html'], 
  function(BaseView, categoryListItemTemplate) {

  var categoryView = BaseView.extend({

    tagName: 'li',

    template: _.template(categoryListItemTemplate),

    events: {
      'click a.delete': 'deleteCategory',
      'click a.edit': 'editCategory'
    },

    initialize: function(){
      
      this.model.on('destroy', this.unrender, this);
      this.model.on('change', this.render, this);

    },

    render: function(){
      // this.$el.html( this.template( this.model.toJSON() ) );
      // console.log("linkView.render ["+ this.template( this.model.toJSON() ) +"]");
      this.$el.html( _.template(categoryListItemTemplate, this.model.toJSON() ) );
        return this;
    },

    editCategory: function(){
      console.log("category.editCategory [" + this.model.get("id") +"][" + this.model.get("url") +"]["+ this.model.get("title")+"] ");
      vent.trigger("category:edit", this.model);
    },

    deleteCategory: function(){
      console.log("category.deleteCategory [" + this.model.get("id") +"][" + this.model.get("url") +"]["+ this.model.get("title")+"] ");
      this.model.destroy();
    },

    unrender: function(){
      console.log("category.unrender [" + this.model.get("id") +"][" + this.model.get("url") +"]["+ this.model.get("title")+"] ");
      //shortcut for: this.$el.remove();
      this.unbind();
      this.remove();
    }

  });

  return categoryView;
  
});