var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('../models/user.js');


passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({
    username: username
  }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, {
        message: 'USERNAME ERROR'
      })
    }
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: 'PASSWORD ERROR'
        })
      }
    });
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
});

exports.get = function(req, res) {
  res.render('login', {
    user: req.user
  });
}

exports.login = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', 'Are you sure thats all right?')
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
}

exports.logout = function(req, res) {
  req.logout();
  req.flash('message', 'You have been logged out');
  res.redirect('/');
}

exports.isLoggedIn = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    req.session.returnTo = req.path;
    req.flash('info', 'You need to login first')
    res.redirect('/login');
  }
}
