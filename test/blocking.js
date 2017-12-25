const jsdom = require('mocha-jsdom')
const expect = require('chai').expect
const fs = require("fs")

describe('blocking route', () => {
 
 	if (typeof module != "undefined") {
		jsdom({
			src: fs.readFileSync('./index.js', 'utf-8')
		})
	}

	beforeEach(done => {
		router.removeAll()
		window.location.hash = ''
		setTimeout(done, 20)
	})


	it('route can be blocked', function(done) {
		router('name1', () => false)

		window.location.hash = '#name1'

		setTimeout(() => {
			expect(window.location.hash).to.equal("")
			done()
		}, 20)
	})

	it('hash reverts to last one on blocking', done => {
		router('name1', () => {})
		router('name2', () => false)

		router('name1')

		setTimeout(() => {
			router('name2')
			setTimeout(() => {
				expect(window.location.hash).to.equal("#name1")
				done()
			}, 50)
		}, 50)
	})

	it('hash reverting doesnt trigger route second time', function(done){
		let count = 0
		router('name1', () => count += 10)
		router('name2', () => {
			count+=1
			return false
		})

		router('name1')
		setTimeout(() => {
			router('name2')
			setTimeout(()  => {
				expect(count).to.equal(11)
				done()
			}, 20)
		}, 20)
	})

})
