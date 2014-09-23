
define(['baseView', 'views/links/links', 'views/links/addlink', 'views/links/importlinks', 
		'views/links/editlink', 'collections/links', 'models/link',
		'text!templates/links/stats.html'],

function(BaseView, LinksView, AddLinkView, ImportLinksView, 
	EditLinkView, LinksCol, LinkModel, statsTemplate) {
  
  var appLinks = BaseView.extend({

	el: '.container',

    template: _.template(statsTemplate),

	addLinkView: null, 
  	editLinkView: null,
  	importLinksView: null, 

    initialize: function() {

    	vent.on("link:edit", this.editLink, this);
    	vent.on("link:addToCollection", this.addLinkToCollection, this);

		//display all links table
		this.allLinksView = new LinksView({collection: this.collection});
		
		$("#links").append(this.allLinksView.render().el);

		//
		this.$header = this.$('#links-header');

		// console.log($(".add-link"));

		this.listenTo(this.collection, 'add', this.render);
		this.listenTo(this.collection, 'remove', this.render);

		this.render();
    	
    },

  	events: {
       "click .add-link": "showAddLinkForm",
       "click .import-links": "showImportLinksForm"
  	},

  	render: function () {

      var html = this.template({total: this.collection.length});
      this.$header.html(html);
      return this;
      
  	},

  	showAddLinkForm: function(e){

		e.preventDefault();

		if (this.addLinkView){
			this.addLinkView.undelegateEvents();
		}

		var link = new LinkModel();
		this.addLinkView = new AddLinkView({model: link});

		$("#link-forms").html(this.addLinkView.el);
  	},

  	showImportLinksForm: function(e){

		e.preventDefault();
		
		if (this.importLinksView){
			this.importLinksView.undelegateEvents();
		}

		var link = new LinkModel();
		this.importLinksView = new ImportLinksView({model: link});
		$("#link-forms").html(this.importLinksView.render().el);
  	},


  	addLinkToCollection: function(link){
  		this.collection.add(link);
  	},

    editLink: function(link){

		if (this.editLinkView){
			this.editLinkView.undelegateEvents();
		}

		this.editLinkView = new EditLinkView({model: link});
    }

  });

  return appLinks;

});
