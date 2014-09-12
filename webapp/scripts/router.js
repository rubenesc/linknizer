define([
  'views/header', 'views/login', 'views/index', 'views/register', 'views/forgotpassword', 
  'views/links/links', 'views/links/addlink', 'models/link', 'collections/links', 'models/user',
  'views/categories/categories', 'views/categories/addcategory', 'models/category', 'collections/categories'],
       function(HeaderView, LoginView, IndexView, RegisterView, ForgotPasswordView, 
        LinksView, AddLinkView, LinkModel, LinksCollection, UserModel,
        CategoriesView, AddCategoryView, CategoryModel, CategoriesCollection) {

  var Router = Backbone.Router.extend({
    
    currentView: null,

    routes: {
      "login": "login",
      "logout": "logout",
      "index": "index",
      'register': 'register',
      'forgotpassword': 'forgotpassword',

      "links"         : "links",
      "links/add"     : "addLink",
      "links/:id"     : "linkDetails",

      "categories"         : "categories",
      "categories/add"     : "addCategory",
      "categories/:id"     : "categoryDetails",
      "*path": "notFound"
      // ,
      
      // "dress/add": "addItem",
      // "dress/:id": "itemDetails",
      // "dress/:id/edit": "editItem",

      // "login": "login",
      // "register": "register",
      // "forgotpassword": "forgotpassword"
    },

    initialize: function () {
        console.log("[router.initialize]");
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);


        var x = (App.currentView) ? App.currentView.email : "none";
        console.log("user: " + x);
    },    


    // Backbone does not undelegate events on its own especially when multiple
    // views loading into the same **el**
    changeView: function(view) {
      if ( null != this.currentView ) {
        this.currentView.undelegateEvents();
      }
      this.currentView = view;
      this.currentView.render();
    },

    login: function() {
      console.log("router.login");
      this.changeView(new LoginView());
    },    

    logout: function() {
      console.log("router.logout");
      var user = new UserModel();
      user.logout();
      this.changeView(new LoginView());
    },   

    //===Links==============================//

    links: function(){
      
      console.log("router.links...");

      var self = this;
      App.links = new LinksCollection();
      
      //fetch links
      App.links.fetch().then(function(){
        
        //inject links to view
        var linksView = new LinksView({ collection: App.links});
        //render view and append to DOM
        $("#content").html(linksView.render().el);

        self.changeView(linksView);

      });

    },

    addLink: function(){

      console.log("router.addLink...");
      var link = new LinkModel();
      var addLinkView = new AddLinkView();
      $('#content').html(addLinkView.render().el);

      this.changeView(addLinkView);

      // this.headerView.selectMenuItem('add-menu');

    },

    linkDetails: function(){
      console.log("router.linkDetails...");
    },


    //===Categories==============================//

    categories: function(){
      
      console.log("router.categories...");

    },

    addCategory: function(){

      console.log("router.addCategory...");
      var category = new CategoryModel();
      var addCategoryView = new AddCategoryView();
      $('#content').html(addCategoryView.render().el);

      this.changeView(addCategoryView);

      // this.headerView.selectMenuItem('add-menu');

    },

    categoryDetails: function(){

    },   

    //=============================================//

    index: function() {

      console.log("router.index...");

      var indexView = new IndexView();
      this.changeView(indexView);
      $('#content').html(indexView.render());

      //option 1

      var self = this;

      //retrieve the items
      // App.items = new ItemsCollection();
      // App.items.fetch().then(function(){
      //   //once I retrieve the items, create and render the view.
      //   var itemsView = new ItemsView({ collection: App.items});
      //   itemsView.initialize();
      //   self.changeView(itemsView);

      // });

      //option 2 

      // //create the Items Collection
      // App.items = new ItemsCollection();

      // //render the Items View
      // this.changeView(new ItemsView({
      //   collection: App.items
      // }));

      // //Now fetch the items from the server
      // App.items.fetch();

      //option 3

     //  App.links = new LinksCollection();

     // var addLinkView = new AddLinkView({collection: App.links});


     //  App.links.fetch().then(function(){
     //    var linksView = new LinksView({ collection: App.links});
     //    // linksView.render();

     //    $('#links').append(linksView.render().el);
     //  });

    },

    forgotpassword: function() {
      console.log("router.forgotpassword...");      
      this.changeView(new ForgotPasswordView());
    },

    register: function() {
      console.log("router.register...");      
      this.changeView(new RegisterView());
    },    

    // addItem: function() {

    //   console.log("add item!!!");
    //   this.changeView(new AddItemView());
    // },


    // itemDetails: function(id) {

    //   console.log("item details: " + id);
    //   this.changeView(new AddItemView());
    // },

    // editItem: function() {

    //   console.log("edit item!!!");
    //   this.currentView.
    //   this.changeView(new AddItemView());

    // },
    

    // forgotpassword: function() {
    //   this.changeView(new ForgotPasswordView());
    // },

    // register: function() {
    //   this.changeView(new RegisterView());
    // }

    notFound: function(path){
      console.log("Sorry! There is no content here ["+path+"]");
      App.router.navigate("/login", true);
    }

  });

  return Router;
});

