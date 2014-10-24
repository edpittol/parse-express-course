var Product = require(config.root + '/models/product');
var Category = require(config.root + '/models/category');

module.exports = {

  products: function(req, res) {
    var query = new Parse.Query(Product);
    query.descending("creatAt");
    query.find().then(function(products) {
      res.render('products', {
        products : products
      });
    });
  },

  product: function(req, res) {
    var query = new Parse.Query(Product);
    query.equalTo("objectId", req.params.id);
    query.first().then(function(product) {
      res.render('product', {
        product: product
      });
    })
  },

  admin: function(req, res) {
    // Create a Promise with all products
    var allQuery = new Parse.Query(Product);
    allQuery.ascending("name");
    var allPromise = allQuery.find();

    // Create a Promise with the product being edited
    var editPromise;
    if(req.params.id) {
      var editQuery = new Parse.Query(Product);
      editQuery.equalTo("objectId", req.params.id);
      editPromise = editQuery.first();
    } else {
      editPromise = Parse.Promise.as(new Product());
    }

    // Call all categories
    var categoriesQuery = new Parse.Query(Category);
    categoriesQuery.ascending("name");
    var categoriesPromise = categoriesQuery.find();

    Parse.Promise
      .when(allPromise, editPromise, categoriesPromise)
      .then(
        function(all, edit, categories) {
          res.render('admin/products', {
            products : all,
            editProduct : edit,
            categories : categories
          });
        },
        function(error) {
          res.send(500, "Internal Error");
        }
      );
  },

  delete: function(req, res) {
    var query = new Parse.Query(Product);
    query.equalTo("objectId", req.params.id);
    query.first().then(function(product) {
      product.destroy({
        success: function(product) {
          res.redirect('/admin/products');
        }, 
        error: function(term, error) {
          res.send(500, 'Internal Error');
        } 
      });
    });
  },

  save: function(req, res) {
    var productPromise;
    if(req.params.id) {
      var productQuery = new Parse.Query(Product);
      productQuery.equalTo("objectId", req.params.id);
      productPromise = productQuery.first();
    } else {
      productPromise = Parse.Promise.as(new Product());
    }

    // Get selected Category objects
    var categoryQuery = new Parse.Query(Category);
    categoryQuery.equalTo("objectId", req.body['category']);
    var categoryPromise = categoryQuery.first();


    Parse.Promise.when(productPromise, categoryPromise).then(function(product, category) {
      product.set("name", req.body['name']);
      product.set("price", parseInt(req.body['price']));
      product.set("category", category);
      product.set("description", req.body['description']);
      product.save();
      if(req.params.id) {
        res.redirect("/admin/products/" + req.params.id);
      } else {
        res.redirect("/admin/products");
      }
    });
  }
}
