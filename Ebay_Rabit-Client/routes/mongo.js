var mongodb = require('mongodb');
var connected=false;
var db;
var MongoClient = mongodb.MongoClient;

exports.connect=function(url,callback)
{
		MongoClient.connect(url, function (err, _db) {
		if (err) {
					console.log('Unable to connect to the mongoDB server. Error:', err);
				 }
		else {
				db=_db;
				console.log('Connection established to', url);
				connected=true;
				callback(db);
			
			 }
		});
};
exports.collection=function(name){
	 if (!connected) {
	      throw new Error('Must connect to Mongo before calling "collection"');
	    } 
	 console.log("collection returned");
	  return db.collection(name);
	  
};