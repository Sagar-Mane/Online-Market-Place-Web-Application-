var app = angular.module('home', ['ngRoute']);
app.config(function($routeProvider) {
	console.log("in route provider");
	$routeProvider
	
	.when("/home", {
		templateUrl : "templates/home.html",
		controller : "homecontroller"
	})
	.when("/Sell",{
		templateUrl:"templates/sell.html",
		controller:"sellcontroller"
	})
	.when("/profile",{
		templateUrl:"templates/profile.html",
		controller:"profilecontroller"
	}).when("/logout",{
		controller:"logoutcontroller"
	}).when("/cart",{
		templateUrl:"templates/cart.html",
		controller:"cartcontroller"
	}).when("/checkout",{
		templateUrl:"templates/checkout.html",
		controller:"checkoutcontroller"
	}).when("/history",{
		templateUrl:"templates/bids.html",
		controller:"historycontroller"
	});
	
	
	
});
app.controller('homecontroller',function($scope,$http){
	console.log("inside home controller");
	$scope.products;
	$scope.biddableproducts;
	$scope.currentbid;
	$scope.allproducts=function(req,res){
		$http({
			method:'post',
			url:'/allproducts'
		}).success(function(data){
			//$scope.currentbid=data.biddableproducts[0].Bids[0].Max_bid;
		//	console.log($scope.currentbid);
			$scope.products=data.products;
			$scope.biddableproducts=data.biddableproducts;
			console.log("products loaded succesfully");
			console.log($scope.products);
			console.log($scope.biddableproducts);
		});
	};
	$scope.addtocart=function(productname){
		console.log("inside add to cart method",productname);
		//console.log($scope.quantity);
		$http({
			method:'post',
			url:'/addtocart',
			data:{
				"productname":productname,
				"quantity":$scope.quantity
			}	
		}).success(function(data){
			console.log("products added to the cart");
			window.alert("Product added to the cart");
		});
	};
	$scope.placebid=function(product){
		console.log(product.bidamount);
		$http({
			method:'post',
			url:'/placebids',
			data:{
				"product":product,
				"bidamount":product.bidamount
			}
		}).success(function(data){
			
			if(data.statusCode==200){
				console.log("bid placed successfully");
				window.alert("Bid placed successfully");
			}
			else{
				window.alert("Your Bid amount is less than the current highest Bid");
			}
				
		});
	};
	
	
});

app.controller('sellcontroller',function($scope,$http){
	$scope.success=true;
	$scope.failed=true;
	console.log("inside sell controller");
	$scope.sellproduct=function(req,res){
		console.log($scope.productname);
		console.log($scope.description);
		console.log($scope.price);
		console.log($scope.quantity);
		console.log($scope.biddableproduct);
		console.log($scope.condition);
		$http({
			method:'post',
			url:'/foduct',
			data:{
				productname:$scope.productname,
				description:$scope.description,
				price:$scope.price,
				quantity:$scope.quantity,
				biddableproduct:$scope.biddableproduct,
				condition:$scope.condition
			}
		}).success(function(data){
			console.log("product added successfully");
			if(data.statusCode==200){
				console.log("success");
				$scope.success=false;
				$scope.failed=true;
			}
			else{
				console.log("Wrong Input");
				$scope.failed=false;
				$scope.success=true;
			}
		});
	};
	
});
app.controller('profilecontroller',function($scope,$http){
	console.log("inside profile controller");
	$scope.myprofile;
	$scope.username;
	$scope.firstname;
	$scope.lastname;
	$scope.bought;
	$scope.sold;
	$scope.profile=function(req,res){
		$http({
			method:'post',
			url:'/profile',
			
			
		}).success(function(data){
			$scope.myprofile=JSON.parse(data.profile);
			$scope.bought=$scope.myprofile[0].Bought;
			//console.log($scope.myprofile[0].Bought);
			//console.log($scope.myprofile[0].Sold);
			$scope.sold=$scope.myprofile[0].Sold;
			console.log($scope.myprofile[0].lastlogin[0]);
			//console.log($scope.myprofile[0].Bought[1].productname)
			
		});
	}
	$scope.logout=function(req,res){
		console.log("inside logout method");
		$http({
			method:'post',
			url:'/logout',
		}).success(function(data){
			console.log("logged out succesfully");
			window.location.assign('login');
		});
	};
});
app.controller('logoutcontroller',function($scope,$http){
	console.log("inside logout controller");
});
app.controller('cartcontroller',function($scope,$http,$location){
	console.log("inside cart controller");
	$scope.cart;
	$scope.total;
	$scope.vat;
	$scope.finaltotal;
	$scope.getcart=function(){
		$http({
			method:'post',
			url:'/getcart'
		}).success(function(data){
			console.log("cart returned");
			$scope.cart=data.cart;
			$scope.total=data.total;
			console.log($scope.total);
			$scope.vat=parseFloat($scope.total*0.2);
			$scope.finaltotal=parseFloat($scope.total+$scope.vat);
		});
	};
	$scope.removefromcart=function(product){
		console.log("inside remove");
		$http({
			method:'post',
			url:'/removefromcart',
			data:{
				"product":product
			}
		}).success(function(data){
			console.log("product removed from cart");
			
		});
	};
	
	$scope.gotohome=function(){
		console.log("inside goto home");
		window.location.assign('home');
	};
	$scope.checkout=function(){
		console.log("inside checkout");
		$location.path('checkout');
	};
});
app.controller('checkoutcontroller',function($scope,$http){
	console.log("inside checkout controller");
	$scope.valid=true;
	$scope.invalid=true;
	$scope.checkout=function(){
		console.log("inside checkout");
		console.log($scope.cardno);
		$http({
			method:'post',
			url:'/checkout',
			data:{
				"cardno":$scope.cardno
			}
		}).success(function(data){
			console.log("successful checkout");
			if(data.statusCode==401){
				console.log("invalid");
				$scope.invalid=false;
				$scope.valid=true;
			}
			else if(data.statusCode==200){
			console.log("valid");
			$scope.valid=false;
			$scope.invalid=true;
			}
		})
	}
});
app.controller('historycontroller',function($scope,$http){
	console.log("inside history controller");
	$scope.myprofile;
	$scope.username;
	$scope.firstname;
	$scope.lastname;
	$scope.bought;
	$scope.sold;
	$scope.profile=function(req,res){
		$http({
			method:'post',
			url:'/profile',
			
			
		}).success(function(data){
			$scope.myprofile=JSON.parse(data.profile);
			$scope.bought=$scope.myprofile[0].Bought;
			console.log($scope.myprofile[0].Bought);
			console.log($scope.myprofile[0].Sold);
			$scope.sold=$scope.myprofile[0].Sold;
			//console.log($scope.myprofile[0].Bought[1].productname)
			
		});

};
});