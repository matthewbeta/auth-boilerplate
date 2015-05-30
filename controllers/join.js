var User = require('../models/user.js');

exports.get = function(req, res) {
  res.render('join', {
    user: req.user
  });
}

exports.post = function(req, res) {
  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  user.save(function(err) {
    req.logIn(user, function(err) {
      req.flash('success', 'Welcome aboard, ' + user.username + '!')
      res.redirect('/');
    });
  });
}
