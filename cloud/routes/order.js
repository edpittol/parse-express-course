exports = module.exports = {
  cart: function(req, res) {
    res.render('cart');
  },

  finish: function(req, res) {
    res.render('finish');
  },

  admin: function(req, res) {
    res.render('admin/orders');
  }
}