
var mongo=require('./mongo');
var url = 'mongodb://localhost:27017/Ebay';
var ejs=require("ejs");
var mq_client = require('../rpc/client');

exports.register=function(req,res){
	var fname=req.param("firstname");
	var lname=req.param("lastname");
	var uname=req.param("username");
	var password=req.param("password");
	var birthday=req.param("birthday");
	var handle=req.param("handle");
	var contact=req.param("contact");
	var location=req.param("location");
	if(fname==null||lname==null||password==null||birthday==null||handle==null||contact==null||location==null){
		console.log("invalid input parameters")
		response={'statusCode':401};
		res.send(response);
	}
	else{
	var msg_payload={"firstname":fname,"lastname":lname,"username":uname,"password":password,"birthday":birthday,"handle":handle,"contact":contact,"location":location};
    mq_client.make_request('register_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("valid registration");
				response={'statusCode':200};
				res.send(response);
				
			
			}
			else {    
				
				console.log("Invalid registration");
				response={'statusCode':401};
				res.send(response);
			
			}
		}  
	});
}
};
/*exports.login=function(req,res){
	var username=req.param("username");
	var password=req.param("password");
	console.log("inside login user",username,password);
	req.session.username=username;
	var msg_payload={"username":username,"password":password};
	mq_client.make_request('login_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log(results.code);
				console.log("valid login");
				json_responses = {"statusCode" : 200};
				res.send(json_responses);
			
			}
			else {    
				
				console.log("Invalid login");
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
				
			}
		}  
	});
	
	
};*/	
exports.profile=function(req,res){
	console.log("inside profile");
	console.log(req.session.username);
	var msg_payload={"username":req.session.username};
	mq_client.make_request('profile_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			console.log(results.code);
			if(results.code == 200){
				console.log("success profile");
				response={"profile":results.value};
				res.send(response);
			}
			else {    
				console.log("failed profile");
			}
		}  
	});
	
};
	
	
	

	

exports.loadlogin=function(req,res){
	ejs.renderFile('./views/login.ejs', function(err, result) {
		// render on success
		if (!err) {
			res.end(result);
			console.log("login rendered successfully");
		}
		// render or error
		else {
			res.end('An error occurred while rendering login');
			console.log(err);
		}
	});
	
};

