var jsdom = require('mocha-jsdom')
var expect = require('chai').expect;
var fs = require("fs");

describe('routes navigation', function() {

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


	it('Call router.navigate to change hash', function(done) {
		//same as router('nav-test');
		router.navigate('nav-test');
		setTimeout(function() {
			expect(window.location.hash).to.equal('#nav-test');
			done();
		}, 20);
	});

	it('Pass in {silent: true} to not trigger route', function(done) {

		var called = 0;

		router('silent-test', function() {
			called++;
		});

		router.navigate('silent-test', { silent: true });

		setTimeout(function() {
			expect(called).to.equal(0);
			expect(window.location.hash).to.equal('#silent-test');
			done();
		}, 20);
	});
});
