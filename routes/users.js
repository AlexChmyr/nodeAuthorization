var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;


// models
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render("register",{
    'title':'Register'
  });
});

router.get('/login', function(req, res, next) {
  res.render("login",{
    'title':'Login'
  });
});

router.post('/register', function(req, res, next) {
  
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  
  console.log(req.file);
  if(req.file){
    console.log('Uploading file...');
    
    // image info
    var imgOriginalName = req.file.originalName;
    var imgName = req.file.filename;
    var imgMime = req.file.mimetype;
    var imgPath = req.file.path;
    var imgSize = req.file.size;
  }
  else{
    var imgName = 'noimage.png';
  }
  
  // form validation
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','E-mail field is required').notEmpty();
  req.checkBody('email','E-mail field should be valid e-mail').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(password);
  
  // Check for errors
  var errors = req.validationErrors();
  if(errors){
    res.render("register",{
      errors:errors,
      name:name,
      email:email,
      username:username,
      password:password,
      password2:password2,
      title:'Register'
    });
  }
  else{
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: imgName
    });
    
    // create user
    User.createUser(newUser,function(err,user){
      if(err){
        throw err;
      }
      console.log(user);

      req.flash('success','You are now registered and may log in');
    });
    
    res.location('/');
    res.redirect('/');
  }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// Local authentication strategy
passport.use(new localStrategy(
    function (username,password,done) {
      User.getUserByUsername(username,function(err,user){
        if(err) throw err;
        if(!user){
          console.log("Unknown user");
          return done(null,false,{message:"Unknown user"});
        }
        
        User.comparePassword(password,user.password,function (err,isMatch) {
          if(err) throw err;
          if(isMatch){
            return done(null, user);
          }
          else{
            console.log("Invalid password");
            return done(null,false,{message:"Unknown user"});
          }
        });
        
      });
    }
));

router.post('/login',  passport.authenticate('local',{failureRedirect: '/users/login',failureFlash:"Invalid username or password"}),function(req, res) {
  console.log("Authentication Success");
  req.flash('success',"You are logged in.");
  res.redirect('/');
});

router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('success','You have logged out');
  res.redirect('/users/login');
});


module.exports = router;
