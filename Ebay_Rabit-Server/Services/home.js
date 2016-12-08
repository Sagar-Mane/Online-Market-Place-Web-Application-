var mongo=require('./mongo');
var mongopool=require('./MongoConnectionPool');
var url = 'mongodb://localhost:27017/Ebay';

exports.logout=function(msg, callback){
	console.log("inside logout services");
	var res={};
	console.log("current session=",msg.session);
	console.log("last login=",msg.lastlogin);
	var lastlogin=msg.lastlogin;
	mongo.connect(url,function(){
		var collection=mongo.collection('users');
	collection.update(
            { username: msg.session },
            { $push: { lastlogin: { $each: [lastlogin] } } }
        );
	})
	res.code="200";
	res.value="logout successfull";
	callback(null,res);
};
exports.allproducts=function(msg,callback){
	console.log("inside all products services");
	var res={};
	var biddableproducts;
	var products;
	mongo.connect(url,function(){
		var collection=mongo.collection('products');
			collection.find({biddableproduct:"no",seller:{$ne:msg.username}}).toArray(function (err, result) {
			      if (err) {
			        console.log(err);
			      } else if (result.length>0) {
			        res.code="200";
			        products=result; 
			        res.value1=products;
			        collection.find({biddableproduct:"yes"}).toArray(function(err,result){
			        	if(err){
			        		console.log(err);
			        	}
			        	else if(result.length>0){
			        		console.log("found2 biddable product");
			        	//	console.log(result[0].Bids[0].Max_bid);
			        		biddableproducts=result;
			        		res.value2=biddableproducts;
			        	}
			        	var response={"products":products,"biddableproducts":biddableproducts};
			        //	res.send(response);
			        	callback(null,res);
			        });
			      
			      } 
			      
			      else {
			        console.log('Nothing found');
			      }
			      
			    });
			
		});
};
exports.addproduct=function(msg,callback){
	var res={};
	
	console.log("inside add product services");
	console.log(msg.seller);
	console.log(msg.productname);
	mongo.connect(url,function(){
		var collection=mongo.collection('products');
		var product = {seller:msg.seller,productname: msg.productname, description: msg.description, price:msg.price,quantity:msg.quantity,biddableproduct:msg.biddableproduct,condition:msg.condition};
		collection.insert(product,function(err,result){
			if(err){
				console.log(err);
			}
			else{
				console.log("data inserted into the db");
				res.code="200";
				console.log(msg.biddableproduct);
				if(msg.biddableproduct=="yes"){
					
					console.log("product added");
					console.log(msg.biddableproduct);
					var enddate=new Date();
					enddate.setDate(enddate.getDate() + 4);
					console.log(enddate);
					var bidamount={"Max_bid":msg.price,"enddate":enddate};
					if(res.code=200){
					collection.update(
			                { productname: msg.productname },
			                { $push: { Bids: { $each: [bidamount] } } }
			            );
					res.code2="100";
					}
				}
			}
			
			callback(null,res);		
		});
		
			
		
	});
};
exports.addtocart=function(msg,callback){
	var res={};
	console.log("inside services add to cart");
	console.log(msg.user);
	var insertproduct={productname:msg.productname, description:msg.description, price:msg.price, seller:msg.seller};
	
	mongo.connect(url,function(){
		var collection=mongo.collection('users');
		collection.update(
                { username: msg.user },
                { $push: { Cart: { $each: [insertproduct] } } }
            );
		res.code="200";
		callback(null,res);
	});
};
exports.getcart=function(msg,callback){
	var res={};
	var cart=[];
	var total=0;
	console.log("inside getcart services");
	mongo.connect(url,function(){
		var collection=mongo.collection('users');
		
	
			collection.find({username:msg.user},{Cart:1,_id:0}).toArray(function (err, result) {
			      if (err) {
			        console.log(err);
			      } else if (result) {
			    	//console.log(result.length);
			        console.log('Found:',result);
			        usercart=result;
			  
			        for(var i=0;i<usercart[0].Cart.length;i++){
			        	cart.push({"productname":usercart[0].Cart[i].productname,"description":usercart[0].Cart[i].description,"price":usercart[0].Cart[i].price});
			        	total=parseFloat(total)+parseFloat(usercart[0].Cart[i].price);
			        }
			        res.value1=cart;
			        res.value2=total;
			        res.code="200";
			      } 
			      
			      else {
			        console.log('Nothing found');
			      }
			      callback(null,res);
			    });	
		});
};
exports.removefromcart=function(msg,callback){
	console.log("inside removefromcart services");
	var res={};
	mongo.connect(url,function(){
		var collection=mongo.collection('users');
		collection.update( { username:msg.user }, { $pull: { Cart: { productname:msg.productname } } } );
		res.code="200";
		callback(null,res);
	});
};
exports.placebids=function(msg,callback){
	var res={};
	var max_bid;
	console.log("inside placebids services");
    var insertbid={productname:msg.productname, description:msg.description, bidamount:msg.bidamount,bidplacedby:msg.user};
	
	mongo.connect(url,function(){
		var collection=mongo.collection('products');
		
		
		collection.findOne({productname:msg.productname},function(err,product){
  		  if(product){
  			  console.log(product.Bids[0].Max_bid);
  			  max_bid=product.Bids[0].Max_bid;
  			  var startdate=product.Bids[0].enddate;
  			  console.log(startdate);
  			  var insertdata={enddate:startdate,Max_bid:msg.bidamount,Bidder:msg.bidplacedby};
  			  if(max_bid<msg.bidamount)
  			  {
  				
  				collection.update(
  	  	                { productname: msg.productname },
  	  	                {$pull:{Bids:{Max_bid:max_bid}}}
  	  	      );	  
  				  
  			    collection.update(
  	                { productname: msg.productname },
  	                { $push: { Bids: { $each: [insertdata] } } }
  	            );
  			    res.code="200";
  		      }
  			  if(max_bid>msg.bidamount){
  				  res.code="401";
  			  }
  		  }
  			else{
  				console.log("not found");
  			}  
  		callback(null,res);  
  	  })
		
		
	});
};
exports.checkout=function(msg,callback){
	var res={};
	var usercart;
	var bought=[];
	var sold=[];
	mongo.connect(url,function(){
		var collection=mongo.collection('users');
		
    
	collection.findOne({username: msg.username},{Cart:1,_id:0}, function(err, user){
		if (user) {
			console.log("success");
			
			console.log('Found:');
	        usercart=user;
	        console.log(usercart.Cart[0]);
	        var insertbought;
	        for(var i=0;i<usercart.Cart.length;i++){
	        	var productname=usercart.Cart[i].productname;
	        	var description=usercart.Cart[i].description;
	        	var price=usercart.Cart[i].price;
	        	insertbought={productname,description,price};
	        	bought.push({"productname":usercart.Cart[i].productname,"description":usercart.Cart[i].description,"price":usercart.Cart[i].price});
	        	sold.push({"productname":usercart.Cart[i].productname,"seller":usercart.Cart[i].seller});
	        	collection.update(
		                { username: msg.username },
		                { $push: { Bought: { $each: [insertbought] } } }
		            );
		        
	        
	        }
	        
	        for(var i=0;i<bought.length;i++){
	        	p=bought[i].productname;
	        collection.update(
	        		{username:msg.username},
	        		{$pull:{Cart:{productname:p}}}
	        );
	        }
	       
	        
	      for(var i=0;i<sold.length;i++){
	    	  var seller=sold[i].seller;
	    	  var name=sold[i].productname;
	    	  collection.findOne({username:seller},function(err,user){
	    		  if(user){
	    			  collection.update(
	    				{username:seller},
	    				{$push:{Sold:{$each:[name]}}}
	    			  )}
	    			else{
	    				console.log("not found");
	    			}  
	    		  
	    	  });
	      }
	     res.code="200";   
			
		} else {
			console.log("returned false");
		}
		callback(null,res);
	});
		
});
	
};
/*
exports.allproductswithconnectionpool=function(msg,callback){
	console.log("inside all products services");
	var res={};
	var biddableproducts;
	var products;
	mongopool.connect(url,function(){
		var collection=mongopool.collection('products');
		
			collection.find({biddableproduct:"no",seller:{$ne:msg.username}}).toArray(function (err, result) {
			      if (err) {
			        console.log(err);
			      } else if (result.length>0) {
			        res.code="200";
			        products=result; 
			        res.value1=products;
			        collection.find({biddableproduct:"yes"}).toArray(function(err,result){
			        	if(err){
			        		console.log(err);
			        	}
			        	else if(result.length>0){
			        		console.log("found2 biddable product");
			        	//	console.log(result[0].Bids[0].Max_bid);
			        		biddableproducts=result;
			        		res.value2=biddableproducts;
			        	}
			        	var response={"products":products,"biddableproducts":biddableproducts};
			        //	res.send(response);
			        	callback(null,res);
			        });
			      
			      } 
			      
			      else {
			        console.log('Nothing found');
			      }
			      
			    });
			
		});
};*/