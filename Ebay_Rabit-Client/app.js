
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var login=require('./routes/login');
var home=require("./routes/home");
var passport = require('passport');
require('./routes/passport')(passport);

var mongoSessionConnectURL = "mongodb://localhost:27017/Ebay";
var session=require("express-session");
var mongoStore = require("connect-mongo/es5")(session);
app.use(session({
	cookieName: 'session',
	secret: 'compe273_test_string',
	resave: false,
	saveUninitialized: false,
	duration: 30*60*1000,
	activeDuration:5*60*1000,
	store: new mongoStore({
	    url: mongoSessionConnectURL
	  })
}));



// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/login',login.loadlogin);
app.get('/home',home.loadhome);

app.post('/register',login.register);
//app.post('/login',login.login);

app.post('/login', function(req, res, next) {
	var json_responses;
	  passport.authenticate('login', function(err, user, info) {
	    if(err) {
	      return next(err);
	    }

	    if(!user) {
	      json_responses = {"statusCode" : 401};
	      res.send(json_responses);
	      //return res.redirect('/');
	    }

	    req.logIn(user, {session:false}, function(err) {
	      if(err) {
	        return next(err);
	      }

	      req.session.username = user.username;
	      console.log("session initilized")
	      json_responses = {"statusCode" : 200};
	      res.send(json_responses);
	      //return res.render('home', {user:user});
	    })
	  })(req, res, next);
	});

	app.get('/', isAuthenticated, function(req, res) {
	  res.render('home', {user:{username: req.session.user}});
	});

	function isAuthenticated(req, res, next) {
	  if(req.session.user) {
	     console.log(req.session.user);
	     return next();
	  }

	  res.redirect('/');
	}


app.post('/profile',login.profile);
app.post('/logout',home.logout);
app.post('/allproducts',home.allproducts);
app.post('/allproductswithoutrabit',home.allproductswithoutrabit);
app.post('/addproduct',home.addproduct);
app.post('/addtocart',home.addtocart);
app.post('/getcart',home.getcart);
app.post('/removefromcart',home.removefromcart);
app.post('/placebids',home.placebids);
app.post('/checkout',home.checkout);
app.post('/allproductswithconnectionpool',home.allproductswithconnectionpool);
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
