
define(['baseView', 'models/link', 'text!templates/links/import-links.html'], 
	function(BaseView, LinkModel, importLinksTemplate) {

  var importLinksView = BaseView.extend({

    template: _.template(importLinksTemplate),

  	initialize: function(){
  		this.url = this.$('#xxx');
  	},

  	events: {
  		'click .upload': 'uploadFile',
    	"click .cancel": "cancel"
  	},

    render: function(){

      var html = this.template(this.model.toJSON() );
      this.$el.html(html);
      return this;

    },

    cancel: function(e){
		e.preventDefault();
		this.remove();
    },


  	uploadFile: function(e){

  		e.preventDefault();

		var file = $('input[name="file"]')[0].files[0]; 

		if (!file){
			return;
		}

  		var data = new FormData();
  		data.append('file', file);//name of the object in the request

		var self = this;
		$.ajax( {
		  url: '/api/links/import',
		  type: 'POST',
		  data: data,
		  processData: false,
		  contentType: false,
		    success: function(data){
				self.remove();
		    },
		    error: function(data){
		    }
		} );  		

  	}

  });

  return importLinksView;
  
});