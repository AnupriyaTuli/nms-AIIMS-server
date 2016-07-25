var LocalStrategy = require('passport-local').Strategy;
var GoogleTokenStrategy = require('passport-google-plus');
var GooglePlusStrategy = require('passport-google-plus');
var User = require('../app/models/user');

module.exports = function(passport){
	passport.serializeUser(function(user,done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id,done){
		User.findById(id,function(err,user){
			done(err,user);
		});
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done){
		process.nextTick(function(){
			console.log(req.body);
			User.findOne({'local.username': email}, function(err, user){
				if(err)
					return done(err);
				if(user){
					return done(null, false, req.flash('signupMessage', 'That email already taken'));
				} else {
					var newUser = new User();
					newUser.local.username = email;
					newUser.local.password = newUser.generateHash(password);
					newUser.local.phone = req.body.phone;
					newUser.local.department = req.body.department;
					newUser.local.name = req.body.name;
					newUser.save(function(err){
						if(err)
							throw err;
						return done(null, newUser);
					})
				}
			})

		});
	}));

	passport.use('local-login',new LocalStrategy({
		usernameField:'email',
		passwordField:'password',
		passReqToCallback:true
	},
	function(req,email,password,done){
		process.nextTick(function(){
			User.findOne({'local.username':email},function(err,user){
				if(err){
					return done(err);
				}
				if(!user){
					return done(null,false,req.flash('loginMessage', 'No User Found'));
				}
				if(!user.validPassword(password)){
					return done(null, false, req.flash('loginMessage', 'Invalid Password'));
				}
				return done(null,user);
			})
		})
	}));

	passport.use(new GooglePlusStrategy({
	    clientID: '437599163255-137tnb460uf1u3qctsc4l2sqnkvdb68n.apps.googleusercontent.com',
	    clientSecret: 'MvdkeXA9Lf-SEz-Swb4fr3hO'
	    //passReqToCallback: true
	  }, 
	  function(tokens, profile, done) {
	  	console.log(profile);
	  	console.log(accessToken);
	    User.findOrCreate({ 'local.username': profile.id }, function (err, user, profile) {
	    	console.log(profile);
	    	console.log(err);
	    	return done(err, user, profile);
	    });
	}
	));
}