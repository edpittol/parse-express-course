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
  },

  signin: function(req, res) {
    Parse.User.logIn(req.body.email, req.body.password).then(
      function(user) {
        // Redirect to admin panel if user is admin
        var query = new Parse.Query(Parse.Role);
        query.equalTo("name", "admin");
        query.equalTo("users", user);
        query.first().then(
          function(user) {
            if(user) {
              res.redirect('/admin');
            } else {
              res.redirect('/');
            }
          }, function() {
            res.send(500, 'Internal Error');
          }
        );
      }, function() {
        res.send(500, 'Invalid credentials.');
      }
    );
  },

  signout: function(req, res) {
    Parse.User.logOut();
    res.redirect('/');
  },

  grant: function(req, res) {
    // The user must be logged
    if(!res.locals.user) {
      res.send('You must be logged');
      return;
    }

    // Create a Promise to the user that be granted
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", req.params.id);
    var userPromise = userQuery.first();

    // Create a Promise with the admin role
    var roleQuery = new Parse.Query(Parse.Role);
    roleQuery.equalTo("name", "admin");
    var rolePromise = roleQuery.first();

    Parse.Promise
      .when(userPromise, rolePromise)
      .then(
        function(user, role) {
          if(user && role) {
            var roleACL = role.getACL();
            
            // Remove the public access to the admin role
            roleACL.setPublicReadAccess(false);
            roleACL.setPublicWriteAccess(false);
            
            // Define that only the admins can read and write the role
            roleACL.setRoleReadAccess(role, true); 
            roleACL.setRoleWriteAccess(role, true); 

            // Add the user to the role and save 
            role.getUsers().add(user);
            role.save().then(
              function(role) {
                res.send('Permission granted');
              },
              function(error) {
                console.log(error);
                res.send(500, 'Error on grant permission');
              }
            );
          } else {
            res.send(500, 'Internal Error');
          }
        },
        function(error) {
          res.send(500, 'Internal Error');
        }
      );
  }
}