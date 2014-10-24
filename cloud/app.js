// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();

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

// Routes
// Product
var product = require(config.root + '/routes/product');
app.get('/', product.products);
app.get('/product', product.product);
app.get('/admin/products', product.admin);

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

// Category
var category = require(config.root + '/routes/category');
app.get('/admin/categories', category.admin);

// Setting
var setting = require(config.root + '/routes/setting');
app.get('/admin/settings', setting.admin);

// Attach the Express app to Cloud Code.
app.listen(config.port);
