var request = require('request')
    , express = require('express')
    ,assert = require('chai').assert
    ,http = require("http");


describe('http tests  LAB2 : MongoDB and RabbitMQ', function(){


    it('login with credentials', function(done) {
        request.post(
            'http://localhost:3000/login',
            { form: { email: 'aditya@gmail.com',password:'123' } },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });
    
    it('Check Register', function(done) {
        request.post(
            'http://localhost:3000/register',
            { form: {firstname:"sagar",
				lastname:"mane",
				username:"sagar.mane@gmail.com",
				password:"123",
				birthday:"10-10-1992",
				handle:"Furious",
				contact:"6692259371",
				location:"Pune" } },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
        
    });
    it('display all products', function(done) {
        request.post(
            'http://localhost:3000/home',
            { form: {} },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });
    it('get user cart', function(done) {
        request.post(
            'http://localhost:3000/cart',
            { form: {username:"sagar.mane@sjsu.edu"} },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });
    it('get payments page', function(done) {
        request.post(
            'http://localhost:3000/checkout',
            { form: {username:"aditya@gmail.com"} },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });
});