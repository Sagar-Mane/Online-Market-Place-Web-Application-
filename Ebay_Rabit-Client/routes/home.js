var ejs=require("ejs");
var mongo=require('./mongo');
var url='mongodb://localhost:27017/Ebay';
var mq_client = require('../rpc/client');
var moment = require('moment');

var winston = require('winston');

var logger1 = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: 'userTracking.log' })
	]
});

var logger2 = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: 'Bids.log' })
	]
});

/*setInterval(function(){
	console.log("hello from bidding cron job");
	logger2.log('info',"bidding cron job executing-" ,"timestamp:"+new Date());
	var currentdate=new Date();
	mongo.connect(url,function(){
		var collection=mongo.collection('products');
		collection.find({biddableproduct:"yes"}).toArray(function(err,product){
	  		  if(product){
	  			 // console.log(product[0].Bids[0].Max_bid);
	  			 // console.log(product[0].Bids[0].Bidder);
	  			  for(var i=0;i<product.length;i++){
	  				console.log(product[i].Bids[0].Max_bid);
	  				console.log(product[i].Bids[0].Bidder);
	  				console.log(product[i].Bids[0].enddate);
	  				console.log(product[i].productname);
	  				var username=product[i].Bids[0].Bidder;
	  				if(product[i].Bids[0].enddate<currentdate){
	  					console.log(product[i].Bids[0].Bidder," is the winner of the bid");
	  					logger2.log('info',"Bid Ended Winner is-"+product[i].Bids[0].Bidder,"timestamp:"+new Date());
	  					var collection2=mongo.collection('users');
	  					bought=[{"productname":product[i].productname,"description":product[i].description,"price":product[i].Bids[0].Max_bid}];
	  					collection2.update(
	  			                { username: username },
	  			                { $push: { Bought: { $each: [bought] } } }
	  			            );
	  					collection.remove({ "productname" : product[i].productname });
	  				}
	  			  }
	  		  }
	  		  else{
	  			  console.log("not found");
	  			  }
	  		  });
		});
},10000);*/

exports.allproductswithoutrabit=function(req,res){
	
	var productsarray=[];
	var products=[];
	var biddableproducts=[];
	console.log("inside get all products");
	console.log(new Date());
	var username=req.session.user;
	mongo.connect(url,function(){
		var collection=mongo.collection('products');
			collection.find({biddableproduct:"no",seller:{$ne:username}}).toArray(function (err, result) {
			      if (err) {
			        console.log(err);
			      } else if (result.length>0) {
			    
			        products=result; 
			        collection.find({biddableproduct:"yes"}).toArray(function(err,result){
			        	if(err){
			        		console.log(err);
			        	}
			        	else if(result.length>0){
			        		console.log("found2 biddable product");
			        		//console.log(result[0].Bids[0].Max_bid);
			        		biddableproducts=result;
			        	}
			        	var response={"products":products,"biddableproducts":biddableproducts};
			        	res.send(response);
			        });
			      
			      } 
			      
			      else {
			        console.log('Nothing found');
			      }
			      
			    });
			
		});
	
};

exports.loadhome=function(req,res){
	ejs.renderFile('./views/home.ejs', function(err, result) {
		
		if (!err) {
			res.end(result);
			console.log("Home rendered successfully");
		}
		
		else {
			res.end('An error occurred while rendering home');
			console.log(err);
		}
	});
	
};
exports.logout=function(req,res){
	var lastlogin = moment().format('LLLL');
	console.log(lastlogin);
	console.log("inside rabit logout");
	msg_payload={"session":req.session.username,"lastlogin":lastlogin};
    mq_client.make_request('logout_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			console.log(results.code);
			if(results.code == 200){
				
				req.session.destroy();
				console.log("logout successful");
				res.send();
			}
			else {    
				console.log("logout failed");
			}
		}  
	});
	
	
	
};
exports.allproducts=function(req,res){
	
	var productsarray=[];
	var products=[];
	var biddableproducts=[];
	console.log("inside get all products");
	console.log(new Date());
	var username=req.session.user;
	logger1.log('info',"User Viewing Products-"+req.session.username,"timestamp:"+new Date());
	msg_payload={"username":username};
    mq_client.make_request('allproducts_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			console.log(results.code);
			if(results.code == 200){
				console.log("success");
				var response={"products":results.value1,"biddableproducts":results.value2};
	        	res.send(response);
				
			}
			else {    
				console.log("failed");
			}
		}  
	});
	
};

exports.addproduct=function(req,res){
	logger1.log('info',"User placing advertisements for Product-"+req.session.username,"timestamp:"+new Date());
	var flag=0;
	console.log("inside add product");
	var name=req.param("productname");
	var description=req.param("description");
	var price=req.param("price");
	var quantity=req.param("quantity");
	var biddableproduct=req.param("biddableproduct");
	var condition=req.param("condition");
	if(name==null||description==null||price==null||quantity==null||biddableproduct==null||condition==null){
		console.log("Wrong Input");
		response={'statusCode':401};
		res.send(response);
	}
	if(flag==0){
	var user=req.session.username;
	var response;
	console.log(user);
	console.log(name);
	var msg_payload={"seller":user,"productname": name, "description": description, "price":price,"quantity":quantity,"biddableproduct":biddableproduct,"condition":condition};
    mq_client.make_request('addproduct_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			console.log(results.code);
			console.log(results.code2);
			if(results.code == 200){
				console.log("success");
				console.log("data inserted into the db");
				response={'statusCode':200};
				res.send(response);
				
			}
			else {    
				console.log("failed");
			}
		}  
	});
	}
};
exports.addtocart=function(req,res){
	logger1.log('info',"User adding products to the cart-"+req.session.username,"timestamp:"+new Date());
	var user=req.session.username;
	var product=req.param("productname");
	var productname=product.productname;
	var description=product.description;
	var price=product.price;
	var seller=product.seller;
	var msg_payload={"user":user,"productname":productname, "description":description, "price":price, "seller":seller};
    mq_client.make_request('addtocart_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			console.log(results.code);
			if(results.code == 200){
				console.log("success");
				res.send();
			}
			else {    
				console.log("failed");
			}
		}  
	});
	
};
exports.getcart=function(req,res){
	logger1.log('info',"Users cart-"+req.session.username,"timestamp:"+new Date());
	console.log("in getcart function");
	var cart=[];
	var user=req.session.username;
	var usercart;
	var total=0;
	var msg_payload={"user":user};
    mq_client.make_request('getcart_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			console.log(results.code);
			if(results.code == 200){
				console.log("success");
				var response={"cart":results.value1,"total":results.value2};
		        res.send(response);
			}
			else {    
				console.log("failed");
			}
		}  
	});
		
};
exports.removefromcart=function(req,res){
	logger1.log('info',"User removing products from cart-"+req.session.username,"timestamp:"+new Date());
	var product=req.param("product");
	console.log(product.productname);
	var user=req.session.username;
	var msg_payload={"user":user,"productname":product.productname};
    mq_client.make_request('removefromcart_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			console.log(results.code);
			if(results.code == 200){
				console.log("success");
				res.send();
			
			}
			else {    
				console.log("failed");
			}
		}  
	});	
};
exports.placebids=function(req,res){
	logger1.log('info',"User placing bids for Product-"+req.session.username,"timestamp:"+new Date());
	var bidamount=req.param("bidamount");
	var product=req.param("product");
	var productname=product.productname;
	var description=product.description;
	var price=product.price;
	console.log(productname);
	var user=req.session.username;
	var max_bid;
	var response;
	var msg_payload={"productname":productname, "description":description, "bidamount":bidamount,"bidplacedby":user};
	 mq_client.make_request('placebids_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				console.log(results.code);
				if(results.code == 200){
					console.log("success");
					response={"statusCode":200};
					res.send(response);
					
				}
				else if(results.code==401){
					console.log("bid amount smaller than current bid");
					response={"statusCode":401};
					res.send(response);
				}
				else{    
					console.log("failed");
				}
			}  
		});
	
};
exports.getbids=function(req,res){
	var user=req.session.user;
	console.log("inside getbids");
	console.log(user);
	var bids=[];
	mongo.connect(url,function(){
		var collection=mongo.collection('products');
		collection.find({biddableproduct:"yes"},{Bids:1,_id:0}).toArray(function (err, result) {
		      if (err) {
		        console.log(err);
		      } else if (result.length) {
		        console.log('Found:');
		        bids=result;
		        for(var i=0;i<bids[0].Bids.length;i++){
		        	console.log("hello");
		        	console.log(bids[0].Bids[i].bidamount);
		        }
		        var response={"bids":bids};
		        res.send(response);
		      } else {
		        console.log('No document(s) found!');
		      }
		      
		    });
	});
};
exports.checkout=function(req,res){
	logger1.log('info',"User buying products on checkout page-"+req.session.username,"timestamp:"+new Date());
	console.log("inside checkout");
	var cardno=req.param("cardno");
	var username=req.session.username;
	var bought=[];
	var sold=[];
	var msg_payload={"username":username};
	if(cardno.length!=16){
		response={"statusCode" : 401};
		res.send(response);
		console.log("invalid card no");
	}
	else if(cardno.length==16){
		console.log("payment initiated");
		
    mq_client.make_request('checkout_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				console.log(results.code);
				if(results.code == 200){
					console.log("success");
					response={"statusCode" : 200};
					res.send(response);
				}	
				else {    
					console.log("failed");
				}
			}  
		});
		
	}
};
exports.allproductswithconnectionpool=function(req,res){
	var productsarray=[];
	var products=[];
	var biddableproducts=[];
	console.log("inside get all products using connection pool");
	console.log(new Date());
	var username=req.session.user;
	msg_payload={"username":username};
    mq_client.make_request('allproductsconnectionpool',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			console.log(results.code);
			if(results.code == 200){
				console.log("success");
				var response={"products":results.value1,"biddableproducts":results.value2};
	        	res.send(response);
				
			}
			else {    
				console.log("failed");
			}
		}  
	});
	
};