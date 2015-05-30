var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var secrets = require('../config/secrets.js');
var User = require('../models/user.js');


exports.getForgot = function(req, res) {
  res.render('forgot', {
    user: req.user
  });
}

exports.postForgot = function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        if (!user) {
          req.flash('error',
            'Sorry. No account exists for that email why not <a href="/join">Join now</a>'
          )
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; //1 href
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: secrets.mailAddress,
          pass: secrets.mailPassword
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Password reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err, info) {
        req.flash('info', 'An e-mail has been sent to ' + user.email +
          ' with instructions to reset your password');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/forgot');
  });
}

exports.getReset = function(req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (!user) {
      req.flash('error',
        'Password reset token is invalid or has expired');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
}

exports.postReset = function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function(err, user) {
        if (!user) {
          req.flash('error',
            'Password reset token is invalid or has expired');
          return res.redirect('/');
        }

        user.password = req.body.pasword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          })
        });

      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: secrets.mailAddress,
          pass: secrets.mailPassword
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Password changed',
        text: 'Your password has been updated'
      };
      smtpTransport.sendMail(mailOptions, function(err, info) {
        req.flash('success', 'Your password has been updated');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
}
