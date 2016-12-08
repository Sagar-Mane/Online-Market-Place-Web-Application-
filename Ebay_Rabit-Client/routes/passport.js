
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require('./mongo');
var loginDatabase = "mongodb://localhost:27017/Ebay";
var mq_client = require('../rpc/client');
var crypt=require('bcrypt-nodejs');

module.exports = function(passport) {
    passport.use('login', new LocalStrategy(function(username, password, done) {
    	console.log("in passsport");
    
    	mongo.connect(loginDatabase,function(){
    		
    		var json_responses;
    		var collection=mongo.collection('users');
    		
    		collection.findOne({username: username}, function(err, user){
    			if (user) {
    				console.log(username);
    				if(crypt.compareSync(password,user.password)){
    				console.log(user.password);
    				console.log("user exists");
    				done(null,user);
    				}
    				else{
    					console.log("invalid user");
        				return done(null,false);
    				}
    				
    			} else {
    				console.log("invalid user");
    				return done(null,false);
    			}
    		});
    	});
    	
    }));	
};


