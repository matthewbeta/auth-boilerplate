var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');

var flash = require('express-flash');
var secrets = require('./config/secrets.js');
var app = express();

var homeController = require('./controllers/index.js');
var authController = require('./controllers/auth.js');
var joinController = require('./controllers/join.js');
var resetController = require('./controllers/reset.js');

mongoose.connect(secrets.db);

// Middleware
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
//need to explicitly set extended option as the default is changng in an upcoming release
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({
  secret: secrets.sessionSecret
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', homeController.index);

app.get('/login', authController.get);

app.post('/login', authController.login);

app.get('/logout', authController.logout);

app.get('/join', joinController.get);

app.post('/join', joinController.post);

app.get('/forgot', resetController.getForgot);

app.post('/forgot', resetController.postForgot);

app.get('/reset/:token', resetController.getReset);

app.post('/reset/:token', resetController.postReset);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
