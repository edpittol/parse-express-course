module.exports = {
  products: function(req, res) {
    res.render('products');
  },

  product: function(req, res) {
    res.render('product');
  },

  admin: function(req, res) {
    res.render('admin/products');
  }
}
