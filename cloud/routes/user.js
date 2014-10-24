exports = module.exports = {
  login: function(req, res) {
    res.render('login');
  },

  admin: function(req, res) {
    res.render('admin/clients');
  },

  signup: function(req, res) {
    Parse.User.signUp(req.body.email, req.body.password, {
      name : req.body.name,
      email : req.body.email
    }).then(
      function() {
        res.redirect('/');
      }, function() {
        res.send(500, 'Error on sign up.');
      }
    );
  }
}