var mongoose = require('mongoose');
var cryptoJS = require("crypto-js");

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;

// User schema
var userSchema = mongoose.Schema({
    username:{
        type:String,
        index:true
    },
    password:{
        type:String
    },
    email:{
        type:String
    },
    name:{
        type:String
    },
    profileimage:{
        type:String
    }
});

var User = module.exports = mongoose.model('User',userSchema);

module.exports.comparePassword = function(candidatePassword,hash,callback){

    var passwordHash = cryptoJS.MD5(candidatePassword);

    if(passwordHash==hash){
        callback(null,true)
    }
    else{
        callback(null,false)
    }
}

module.exports.getUserByUsername = function(username,callback){
    var query = {username:username};
    User.findOne(query,callback);
}

module.exports.getUserById = function(id,callback){
    User.findById(id,callback);
}

module.exports.createUser = function(newUser,callback){
    var newPassword = cryptoJS.MD5(newUser.password);
    newUser.password = newPassword;
    newUser.save(callback);
}