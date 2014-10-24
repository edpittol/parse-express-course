exports = module.exports = {
  login: function(req, res) {
    res.render('login');
  },

  admin: function(req, res) {
    res.render('admin/clients');
  }
}