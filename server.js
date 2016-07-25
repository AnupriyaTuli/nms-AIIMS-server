var express = require('express');
var app = express();
var port = 9144;

var User = require('./app/models/user');

var morgan = require('morgan');

var cookieParser = require("cookie-parser");
var session = require("express-session");
var mongoose = require("mongoose");
var configDB = require('./config/database.js');
var bodyParser = require('body-parser');
var passport = require("passport");
var flash = require('connect-flash')


mongoose.connect(configDB.url);
require('./config/passport')(passport);

app.use(morgan('dev')); //logs every request
app.use(cookieParser()) //logs cookies of every request(if present)
app.use(session({secret:'notasecret',		//this is an express session
				saveUninitialized: true,
				resave: true})); //
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(passport.initialize()); //starts passport 
app.use(passport.session()); //passport uses the above created express session, so the express session creation should always be done before this.
app.use(flash());
app.use('/views', express.static('views'));

//admin password(after 9 rounds of encryption)
//https://www.dailycred.com/article/bcrypt-calculator
var aPass = "$2a$09$9anxl4ieA/eRZTPaqZYW8.SoPCrXQO3wugd.jZL1./p3KJz81PmOO";
User.findOne({'local.username': "admin"}, function(err, user){
	if(err)
		throw err;
	if(user==null){
		var newUser = new User();
		newUser.local.username = "admin";
		newUser.local.password = aPass;
		newUser.save(function(err){
			if(err)
				throw err;
			console.log("Admin created.");
		})	
	}
})

require('./app/routes.js')(app,passport);
require('./app/websiteRoutes.js')(app,passport);

app.listen(port);

console.log("Server running on port: "+port);