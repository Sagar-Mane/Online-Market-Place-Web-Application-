var mongo=require('./mongo');
var url = 'mongodb://localhost:27017/Ebay';
var crypt=require('bcrypt-nodejs');
function handle_request(msg, callback){
	
	var res = {};
	var count;
	console.log("In handle request:"+ msg.username);
	console.log(msg.firstname);
	console.log(msg.lastname);
	console.log(msg.username);
	console.log(msg.password);
	var cryptedpassword = crypt.hashSync(msg.password);
	
	if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(msg.username)){
		count=1;
	}
	if(count==1)
	{	
		response={'statusCode':200};
		res.code="200";
		res.value="successfull registration";
		mongo.connect(url,function(){
			var collection=mongo.collection('users');
			var user1 = {firstname: msg.firstname, lastname: msg.lastname, username:msg.username,password:cryptedpassword,"birthday":msg.birthday,"handle":msg.handle,"contact":msg.contact,"location":msg.location};
			collection.insert(user1,function(err,result){
				if(err){
					console.log(err);
				}
				else{
					console.log("data inserted into the db");
				//	res.send(response);
				}
			})
		})

	}
	else
		{
			response={'statusCode':401};
			res.code="401";
			res.value="regitration failed";
	//		res.send(response);
		}

	callback(null,res);
	
}
/*exports.login_request=function(msg, callback){
	var res = {};
	console.log("sevices login madhe ala call");
	console.log(msg.username);
	console.log(msg.password);
	res.code="200";
	
	
	var json_responses;
	mongo.connect(url,function(){
		
		var collection=mongo.collection('users');
		collection.findOne({username: msg.username, password:msg.password}, function(err, user){
			if (user) {
				// This way subsequent requests will know the user is logged in.
				//req.session.username = user.username;
				//console.log(req.session.username +" is the session");
				console.log("user found using rabitmq");
				res.code="200";
				res.value="user found"
				//json_responses = {"statusCode" : 200};
				//res.send(json_responses);

			} else {
				console.log("returned false");
				res.code="401";
				res.value="user not found";
				//json_responses = {"statusCode" : 401};
				//res.send(json_responses);
			}
		});
	});
	
	callback(null,res);
}*/
exports.profile_request=function(msg, callback){
	var res = {};
	console.log("inside profile request");
	mongo.connect(url,function(){
		var collection=mongo.collection('users');
			
			collection.find({username: msg.username}).toArray(function (err, result) {
			       if (result) {
			        console.log('Found:', result);
			        profile=JSON.stringify(result);
			        res.code="200";
			        res.value=profile;
			        console.log(res.code);
				//	response={"profile":profile};
			       // res.send(response);
			      } else {
			        console.log('No document(s) found!');
			        res.code="401";
			        res.value="profile not found"
			      }
			       console.log(res);
					callback(null,res);
			    });
			
		});
	
}
exports.handle_request = handle_request;
