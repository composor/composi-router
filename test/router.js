var jsdom = require('mocha-jsdom')
var expect = require('chai').expect;
var fs = require("fs");

describe('router basics', function(){
 
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


	it('Can be initialized in non-conflict mode', function(){
		var r = router.noConflict();
		expect(typeof window.router).to.equal('undefined');
		window.router = r;
	})

	it('Trigger empty router when url has no hash', function(done){
		window.location.hash = '';
		//should be called right away since there is no hash
		router('', function() {
			done();
		});
	})

	it('Trigger route by its name', function(done){
		router('test', function() {
			done();
		});
		window.location.hash = '#test';
	})

	it('Accepts an object', function(done) {
		router({
			'test2': function(){ done(); }
		});
		window.location.hash = '#test2';
	});

	it('Calls the same route more than once', function(done) {
		var runCount = 0;
		router('test8', function() {
			runCount++;
		});
		router('test8', function() {
			expect(runCount).to.equal(1);
			done();
		});
		window.location.hash = '#test8';
	});

	it('Navigate to hash', function(done) {
		router('#test3')
		setTimeout(function(){
			expect(window.location.hash).to.equal('#test3');
			done();
		}, 20);
	});

	it('Removes route', function(done) {
		var check = false;
		var test9 = function() {
			check = true;
		};

		router('test9', test9);
		router.remove('test9', test9);

		window.location.hash = '#test9';

		setTimeout(function(){
			expect(check).to.equal(false);
			done();
		}, 20);
	});

	it('Removes all routes', function(done) {
		var check = false;
		var test9 = function() {
			check = true;
		};
		var test20 = function() {
			check = true;
		};

		router('test9', test9);
		router('test20', test20);
		router.removeAll();

		window.location.hash = '#test9';

		setTimeout(function() {
			window.location.hash = 'test20';
		}, 20);
		setTimeout(function() {
			expect(check).to.equal(false);
			done();
		}, 40);
	});

	it('Regex support', function(done) {

		router('test4/:name', function(name) {
			expect(name).to.equal('bob');
			expect(this.params.name).to.equal('bob');
			done();
		});

		router('test4/bob');
	});

	it('Optional param support', function(done) {
		router('test5/:name?', function(name) {
			expect(name).to.equal(undefined);
			expect(this.params.name).to.equal(undefined);
			done();
		});

		router('test5/');
	});

	it('Wildcard', function(done) {
		router('test7/*', function() {
			done();
		});
		router('test7/123/123asd');
	});

	it('Catch all', function(done) {
		router('*', function() {
			done();
		});
		router('test6');
	});

	it('Access route object from route callback', function(done) {
		router('test', function() {
			expect(this.path).to.equal('test');
			done();
		});
		router('test');
	});

	it('Double fire bug', function(done) {
		var called = 0;
		router({
			'splash1': function() {
				router('splash2');
			},
			'splash2': function() {
				called++;
			}
		});

		router('splash1');

		setTimeout(function() {
			expect(called).to.equal(1);
			done();
		}, 100);
	});

	it('Only first route is run', function(done) {
		var count = 0;
		router({
			'test*': function() {
				count++;
			},
			'test10': function() {
				count++;
			}
		});

		router('test10');

		setTimeout(function() {
			expect(count).to.equal(1);
			done();
		}, 100);
	});

	it('Fallback not called if something else matches', function(done) {
		var count = 0;
		router({
			'': function() {
				//root
			},
			'test11': function() {
				count++;
			},
			'*': function() {
				count++;
			}
		});

		router('test11');

		setTimeout(function() {
			expect(count).to.equal(1);
			done();
		}, 100);
	});

	it('Fallback called if nothing else matches', function(done) {
		var count = 0;
		router({
			'': function() {
				//root
			},
			'test11': function() {
				count++;
			},
			'*': function() {
				count++;
			}
		});

		router('test12');

		setTimeout(function() {
			expect(count).to.equal(1);
			done();
		}, 100);
	});
})
