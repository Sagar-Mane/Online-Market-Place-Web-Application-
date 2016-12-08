var app = angular.module('login', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$stateProvider.state('login', {	
		url : '/',
		views: {
            
            'content': {
                templateUrl : 'templates/login.html',
            },
		}
	})
	$urlRouterProvider.otherwise('/');
});

app.controller('logincontroller',function($scope,$http){
	console.log("inside login controller");
	$scope.invalidlogin=true;
	$scope.validregistration=true;
	$scope.invalidregistration=true;
	$scope.signin=function(req,res){
		console.log("inside signin");
		$http({
			method:'post',
			url:'/login',
			data:{
				"username":$scope.username,
				"password":$scope.password
			}
		}).success(function(data){
			console.log("login returned")
			if(data.statusCode==200){
				window.location.assign('home');
				$scope.invalidlogin=true;
			}
			else{
				$scope.invalidlogin=false;
			}
			
		});
	};
	$scope.register=function(req,res){
		console.log("inside register");
		$http({
			method:'post',
			url:'/register',
			data:{
				"firstname":$scope.firstname,
				"lastname":$scope.lastname,
				"username":$scope.emailid,
				"password":$scope.password,
				"birthday":$scope.birthday,
				"handle":$scope.handle,
				"contact":$scope.contact,
				"location":$scope.location
			}
		}).success(function(data){
			if(data.statusCode==200){
				$scope.validregistration=false;
				$scope.invalidregistration=true;
			}
			else{
				$scope.validregistration=true;
				$scope.invalidregistration=false;
			}
			
		});
	};
})
