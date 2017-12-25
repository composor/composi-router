const jsdom = require('mocha-jsdom')
const expect = require('chai').expect
const fs = require("fs")

describe('routes navigation', () => {

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


	it('Call router.navigate to change hash', done => {
		//same as router('nav-test')
		router.navigate('nav-test')
		setTimeout(() => {
			expect(window.location.hash).to.equal('#nav-test')
			done()
		}, 20)
	})

	it('Pass in {silent: true} to not trigger route', done => {

		let called = 0

		router('silent-test', () => called++)

		router.navigate('silent-test', { silent: true })

		setTimeout(() => {
			expect(called).to.equal(0)
			expect(window.location.hash).to.equal('#silent-test')
			done()
		}, 20)
	})
})
