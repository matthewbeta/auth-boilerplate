exports.get = function(req, res) {
  res.render('loggedin', {
    user: req.user,
    username: req.user.username,
    email: req.user.email,
  });
}
