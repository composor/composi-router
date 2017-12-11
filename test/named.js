var jsdom = require('mocha-jsdom')
var expect = require('chai').expect;
var fs = require("fs");


describe('named routes', function() {

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

	it('Allow for named routes', function() {
		router('namedRoute name/', function() {});
		expect(router.lookup('namedRoute')).to.equal('name/');
	});

	it('Routes should still work the same', function(done) {
		router('namedRoute url/name2/', done);
		router('url/name2/');

	});

	it('Allow for named routes with params', function() {
		router({
			'namedRoute name2/:param': function() { }
		});

		expect(router.lookup('namedRoute', { param: 'test' })).to.equal('name2/test');
	});

	it('Allow for named routes with optional params', function() {
		router({
			'namedRoute name2/:param?': function() { }
		});

		expect(router.lookup('namedRoute')).to.equal('name2/');
	});

	it('Allow for named routes with optional params', function() {
		router({
			'namedRoute name2/:param?': function() { }
		});

		expect(router.lookup('namedRoute', { param: 'test' })).to.equal('name2/test');
	});

	it('Error if param not passed in', function() {
		router({
			'namedRoute name2/:param': function() { }
		});

		expect(function() {
			router.lookup('namedRoute');
		}).to.throw();
	});

	it('This contains named route', function(done) {
		router('namedRoute test/:param', function() {
			expect(this.name).to.equal('namedRoute');
			expect(this.params.param).to.equal('bob');
			done();
		});
		router('test/bob');
	});
});
