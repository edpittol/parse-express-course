exports = module.exports = function(config) {

  var Category = require(config.root + '/models/category');

  return {
    admin: function(req, res) {
      // Create a Promise with all categories
      var allQuery = new Parse.Query(Category);
      allQuery.ascending("name");
      var allPromise = allQuery.find();

      // Create a Promise with the category being edited
      var editPromise;
      if(req.params.id) {
        var editQuery = new Parse.Query(Category);
        editQuery.equalTo("objectId", req.params.id);
        editPromise = editQuery.first();
      } else {
        editPromise = Parse.Promise.as(new Category());
      }

      Parse.Promise
        .when(allPromise, editPromise)
        .then(
          function(all, edit) {
            res.render('admin/categories', {
              categories : all,
              editCategory : edit
            });
          },
          function(error) {
            res.send(500, "Internal Error");
          }
        );
    },

    delete: function(req, res) {
      var query = new Parse.Query(Category);
      query.equalTo("objectId", req.params.id);
      query.first().then(function(category) {
        category.destroy({
          success: function(category) {
            res.redirect('/admin/categories');
          }, 
          error: function(term, error) {
            res.send(500, 'Internal Error');
          } 
        });
      });
    },

    save: function(req, res) {
      var promise;
      if(req.params.id) {
        var query = new Parse.Query(Category);
        query.equalTo("objectId", req.params.id);
        promise = query.first();
      } else {
        promise = Parse.Promise.as(new Category());
      }

      Parse.Promise.when(promise).then(function(category) {
        category.set("name", req.body['name']);
        category.save();
        if(req.params.id) {
          res.redirect("/admin/categories/" + req.params.id);
        } else {
          res.redirect("/admin/categories");
        }
      });
    }
  }
}