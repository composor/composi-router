var jsdom = require('mocha-jsdom')
var expect = require('chai').expect;
var fs = require("fs");

describe('blocking route', function(){
 
 	if (typeof module != "undefined"){
		jsdom({
			src: fs.readFileSync('./index.js', 'utf-8')
		})
	}

	beforeEach(function(done) {
		router.removeAll();
		window.location.hash = '';
		setTimeout(done, 20);
	});


	it('route can be blocked', function(done){
		router('name1', function() {
			return false;
		});

		window.location.hash = '#name1';

		setTimeout(function(){
			expect(window.location.hash).to.equal("");
			done();
		}, 20);
	});

	it('hash reverts to last one on blocking', function(done){
		router('name1', function(){ });
		router('name2', function(){
			return false;
		});

		router('name1');

		setTimeout(function(){
			router('name2');
			setTimeout(function(){
				expect(window.location.hash).to.equal("#name1");
				done();
			}, 50)
		}, 50);
	});

	it('hash reverting doesnt trigger route second time', function(done){
		var count = 0;
		router('name1', function() {
			count+=10;
		});
		router('name2', function() {
			count+=1;
			return false;
		});

		router('name1');
		setTimeout(function(){
			router('name2');
			setTimeout(function(){
				expect(count).to.equal(11);
				done();
			}, 20)
		}, 20);
	});

})
