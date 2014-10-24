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

// Routes
app.get('/', function(req, res) {
  res.render('products');
});

app.get('/product', function(req, res) {
  res.render('product');
});

app.get('/cart', function(req, res) {
  res.render('cart');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/finish', function(req, res) {
  res.render('finish');
});

// Backend routes
app.get('/admin', function(req, res) {
  res.render('admin/orders');
});

app.get('/admin/products', function(req, res) {
  res.render('admin/products');
});

app.get('/admin/categories', function(req, res) {
  res.render('admin/categories');
});

app.get('/admin/clients', function(req, res) {
  res.render('admin/clients');
});

app.get('/admin/settings', function(req, res) {
  res.render('admin/settings');
});

// Attach the Express app to Cloud Code.
app.listen(config.port);