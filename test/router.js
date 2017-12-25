const jsdom = require('mocha-jsdom')
const expect = require('chai').expect
const fs = require("fs")

describe('router basics', () => {
 
 	if (typeof module != "undefined"){
		jsdom({
			src: fs.readFileSync('./index.js', 'utf-8')
		})
	}
  

	beforeEach(done => {
		router.removeAll()
		window.location.hash = ''
		setTimeout(done, 20)
	})


	it('Can be initialized in non-conflict mode', () => {
		const r = router.noConflict()
		expect(typeof window.router).to.equal('undefined')
		window.router = r
	})

	it('Trigger empty router when url has no hash', done => {
		window.location.hash = ''
		//should be called right away since there is no hash
		router('', () => done())
	})

	it('Trigger route by its name', done => {
		router('test', () => done())
		window.location.hash = '#test'
	})

	it('Accepts an object', done => {
		router({
			'test2': () => done()
		})
		window.location.hash = '#test2'
	})

	it('Calls the same route more than once', done => {
		let runCount = 0
		router('test8', () => runCount++)
		router('test8', () => {
			expect(runCount).to.equal(1)
			done()
		})
		window.location.hash = '#test8'
	})

	it('Navigate to hash', done => {
		router('#test3')
		setTimeout(() => {
			expect(window.location.hash).to.equal('#test3')
			done()
		}, 20)
	})

	it('Removes route', done => {
		let check = false
		const test9 = () => check = true

		router('test9', test9)
		router.remove('test9', test9)

		window.location.hash = '#test9'

		setTimeout(() => {
			expect(check).to.equal(false)
			done()
		}, 20)
	})

	it('Removes all routes', done => {
		let check = false
		const test9 = () => check = true
		const test20 = () => check = true

		router('test9', test9)
		router('test20', test20)
		router.removeAll()

		window.location.hash = '#test9'

		setTimeout(() => window.location.hash = 'test20', 20)
		setTimeout(() => {
			expect(check).to.equal(false)
			done()
		}, 40)
	})

	it('Regex support', done => {

		router('test4/:name', function(name) {
			expect(name).to.equal('bob')
			expect(this.params.name).to.equal('bob')
			done()
		})

		router('test4/bob')
	})

	it('Optional param support', done => {
		router('test5/:name?', function(name) {
			expect(name).to.equal(undefined)
			expect(this.params.name).to.equal(undefined)
			done()
		})

		router('test5/')
	})

	it('Wildcard', done => {
		router('test7/*', () => done())
		router('test7/123/123asd')
	})

	it('Catch all', done => {
		router('*', () => done())
		router('test6')
	})

	it('Access route object from route callback', done => {
		router('test', function() {
			expect(this.path).to.equal('test')
			done()
		})
		router('test')
	})

	it('Double fire bug', done => {
		let called = 0
		router({
			'splash1': () => router('splash2'),
			'splash2': () => called++
		})

		router('splash1')

		setTimeout(() => {
			expect(called).to.equal(1)
			done()
		}, 100)
	})

	it('Only first route is run', done => {
		let count = 0
		router({
			'test*': () => count++,
			'test10': () => count++
    })

		router('test10')

		setTimeout(() => {
			expect(count).to.equal(1)
			done()
		}, 100)
	})

	it('Fallback not called if something else matches', done => {
		let count = 0
		router({
			'': () => {/*root*/},
			'test11': () => count++,
			'*': () => count++
		})

		router('test11')

		setTimeout(() => {
			expect(count).to.equal(1)
			done()
		}, 100)
	})

	it('Fallback called if nothing else matches', done => {
		let count = 0
		router({
			'': () => { /*root*/},
			'test11': () => count++,
			'*': () => count++
		})

		router('test12')

		setTimeout(() => {
			expect(count).to.equal(1)
			done()
		}, 100)
	})

  it('Should load page without changing hash', done => {
    let count = 0
    router({
			'load': () => ++count
		})
    router.load('load')
    setTimeout(() => { 
      expect(count).to.equal(1)
      done()
      router.load('load')
    }, 100)
    setTimeout(() => { 
      expect(count).to.equal(2)
      done()
    }, 300)
  })
})
