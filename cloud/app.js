// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var _ = require('underscore');

// Configuration settings
var config = {
  port: 80,
  root: 'cloud'
};
app.configure('development', function() {
  // Initialize Parse
  var global = require('../config/global.json');
  var keys = global.applications[global.applications._default.link];
  Parse = require('parse').Parse;
  Parse.initialize(keys.applicationId, keys.javascriptKey, keys.masterKey);
  GLOBAL.Parse = Parse;

  // Change configuration to local env
  config.port = 3000;
  config.root = __dirname;
  GLOBAL.config = config;

  GLOBAL._ = _;
  
  // Add public directory
  app.use(express.static(config.root + '/../public'));

  console.log("Starting web server on port %d", config.port);
});

// Global app configuration section
app.set('views', config.root + '/views'); // Specify the folder to find templates
app.set('view engine', 'ejs');            // Set the template engine
app.use(express.bodyParser());            // Middleware for reading request body

// Set logged user
app.use(function(req, res, next){
  var user = Parse.User.current();
  if(user && !user.authenticated()) {
    user = null; // Only get the user object if has a guarantee that is autenticated
  }
  res.locals.user = user; // Define the variable global
  next();
});

// Sidebar categories
app.use(function(req, res, next) {
  var Category = require(config.root + '/models/category');
  var query = new Parse.Query(Category);
  query.ascending("name");
  query.find({
    success: function(results) {
      res.locals.sidebarCategories = results;
      next();
    },
    error: function(error) {
      res.send(500, 'Internal Error');
    }
  });
});

// Roles
app.use(function(req, res, next) {
  // Set the ACL as public to register the first user as admin
  var adminACL = new Parse.ACL();
  adminACL.setPublicReadAccess(true);
  adminACL.setPublicWriteAccess(true);

  // Create the admin role
  var adminRole = new Parse.Role('admin', adminACL);
  adminRole.save();

  next();
});

// Routes
// Validate admin access 
app.all(/^\/admin(\/.*)/, function(req, res, next) {
  if(!res.locals.user) {
    res.redirect('/login');
  }

  next();
});

// Product
var product = require(config.root + '/routes/product');
app.get('/', product.products);
app.get('/product/:id', product.product);
app.get('/admin/products', product.admin);
app.get('/admin/products/:id', product.admin);
app.get('/admin/products/:id/delete', product.delete);
app.post('/admin/products', product.save);
app.post('/admin/products/:id', product.save);

// Order
var order = require(config.root + '/routes/order');
app.get('/cart', order.cart);
app.get('/finish', order.finish);
app.get('/admin', order.admin);

// User
var user = require(config.root + '/routes/user');
app.get('/login', user.login);
app.post('/signup', user.signup);
app.post('/signin', user.signin);
app.get('/signout', user.signout);
app.get('/admin/clients', user.admin);
app.get('/grant/:id', user.grant);

// Category
var category = require(config.root + '/routes/category');
app.get('/category/:id', category.category);
app.get('/admin/categories', category.admin);
app.get('/admin/categories/:id', category.admin);
app.get('/admin/categories/:id/delete', category.delete);
app.post('/admin/categories', category.save);
app.post('/admin/categories/:id', category.save);

// Setting
var setting = require(config.root + '/routes/setting');
app.get('/admin/settings', setting.admin);

// Attach the Express app to Cloud Code.
app.listen(config.port);
