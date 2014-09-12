
define(['baseView', 'text!templates/links/link-list-item.html'], 
	function(BaseView, linkListItemTemplate) {

  var linkView = BaseView.extend({

  	tagName: 'tr',

  	template: _.template(linkListItemTemplate),

  	events: {
      'click a.delete': 'deleteLink',
  		'click a.edit': 'editLink'
  	},

    initialize: function(){
      
      this.model.on('destroy', this.unrender, this);
      this.model.on('change', this.render, this);

    },

  	render: function(){
  		// this.$el.html( this.template( this.model.toJSON() ) );
  		// console.log("linkView.render ["+ this.template( this.model.toJSON() ) +"]");
  		this.$el.html( _.template(linkListItemTemplate, this.model.toJSON() ) );
      	return this;
  	},

    editLink: function(){
      console.log("link.editLink [" + this.model.get("id") +"][" + this.model.get("url") +"]["+ this.model.get("title")+"] ");
      vent.trigger("link:edit", this.model);
    },

  	deleteLink: function(){
      console.log("link.deleteLink [" + this.model.get("id") +"][" + this.model.get("url") +"]["+ this.model.get("title")+"] ");
  		this.model.destroy();
  	},

  	unrender: function(){
      console.log("link.unrender [" + this.model.get("id") +"][" + this.model.get("url") +"]["+ this.model.get("title")+"] ");
  		//shortcut for: this.$el.remove();
      this.unbind();
  		this.remove();
  	}

  });

  return linkView;
  
});