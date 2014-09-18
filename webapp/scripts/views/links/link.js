
define(['baseView', 'text!templates/links/link-list-item.html'], 
	function(BaseView, linkListItemTemplate) {

  var linkView = BaseView.extend({

  	tagName: 'tr',

    template: _.template(linkListItemTemplate),
  	// template: template("linkItemTemplate"),

  	events: {
      'click .delete': 'deleteLink',
  		'click .edit': 'editLink'
  	},

    initialize: function(){
      
      this.model.on('destroy', this.unrender, this);
      this.model.on('change', this.render, this);

      //Convert a backbone date to mm/dd/yyyy format.
      _.template.formatdate = function (bDate) {
        var d = new Date(bDate),
            fragments = [
                d.getMonth() + 1,
                d.getDate(),
                d.getFullYear()
            ]; 
          return fragments.join('/');
      }      

    },

  	render: function(){
  		// this.$el.html( this.template( this.model.toJSON() ) );
  		// console.log("linkView.render ["+ this.template( this.model.toJSON() ) +"]");
      this.$el.html( _.template(linkListItemTemplate, this.model.toJSON() ) );
  		// this.$el.html( this.template(this.model.toJSON()) );
    	return this;

  	},

    editLink: function(){
      vent.trigger("link:edit", this.model);
    },

  	deleteLink: function(){
  		this.model.destroy();
  	},

  	unrender: function(){
      // console.log("link.unrender [" + this.model.get("id") +"][" + this.model.get("url") +"]["+ this.model.get("title")+"] ");
  		//shortcut for: this.$el.remove();
      this.unbind();
  		this.remove();
  	}

  });

  return linkView;
  
});