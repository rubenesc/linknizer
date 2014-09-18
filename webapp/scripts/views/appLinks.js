
define(['baseView', 'views/links/links', 'views/links/addlink', 'views/links/editlink', 'collections/links', 'models/link'],

function(BaseView, LinksView, AddLinkView, EditLinkView, LinksCol, LinkModel) {
  
  var appLinks = BaseView.extend({

  	editLinkView: null,

    initialize: function() {

    	vent.on("link:edit", this.editLink, this);

    	var links = new LinksCol();

    	links.fetch().then(function(){

			var addLinkView = new AddLinkView({collection: links});

			var allLinksView = new LinksView({collection: links});
			
			$("#links").append(allLinksView.render().el);
			// $("#links-wrapper").append(allLinksView.render().el);

    	})



		// addLinkView.el.render();
		// $("#edit-link").html(editLinkView.el);


    },

    editLink: function(link){
		//Create new EditLinkView
		//bind the model
		//append form to dom

		if (this.editLinkView){
			this.editLinkView.undelegateEvents();
		}

		this.editLinkView = new EditLinkView({model: link});
		// $("#edit-link").html(editLinkView.el);
    }

  });

  return appLinks;

});
