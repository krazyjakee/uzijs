var assert = require('assert');
var Uzi = require('./uzi');

// global.debug = true

var p1 = (param) => {
	return new Promise((resolve, reject) => {
		resolve("Apple")
	})
}

var p2 = (param) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve("Banana"), 5)
	})
}

var p3 = (param) => {
	return new Promise((resolve, reject) => {
		resolve([1,2,3])
	})
}

var p4 = (param) => {
	return new Promise((resolve, reject) => {
		reject("Error")
	})
}

var resolvedPromiseChain = [p1,p2,p3]
var rejectedPromiseChain = [p1,p2,p4,p3,p4]

describe('constructor', () => {

	var uzi = new Uzi(resolvedPromiseChain)

	it('should load the promise array', () => {
		var uzi = new Uzi(resolvedPromiseChain)
		assert.equal(uzi.clip.length, 3);
	});

});

describe('then', () => {

	it('should fire the then function after promises are complete', (done) => {
		var uzi = new Uzi(resolvedPromiseChain).then(() => {
			done()
		}).fire()
	});

});

describe('first', () => {

	it('should fire the first function', (done) => {
		var x = 0
		var uzi = new Uzi(resolvedPromiseChain).first(() => {
			x = 1
		}).then(() => {
			assert.equal(x, 1)
			done()
		}).fire()
	});

});

describe('hit', () => {

	it('should fire the hit function for each resolved promise', (done) => {
		var x = []
		var uzi = new Uzi(resolvedPromiseChain).hit((a) => {
			x.push(a)
		}).then(() => {
			assert.equal(x[1], 'Banana')
			done()
		}).fire()
	});

});

describe('miss', () => {

	it('should fire the miss function for any broken promise', (done) => {
		var x = []
		var uzi = new Uzi(rejectedPromiseChain).hit(() => {
			x.push('hit')
		}).miss(() => {
			x.push('miss')
		}).then(() => {
			assert.equal(x.join(""), "hithitmisshitmiss")
			done()
		}).fire()
	});

});


describe('spray', () => {

	it('should fire all promises at once', (done) => {
		var x = []
		var uzi = new Uzi(resolvedPromiseChain).hit((a) => {
			x.push(a)
		}).then(() => {
			assert.equal(x[2], 'Banana') // now position 3 of the array is banana because of the timeout
			done()
		}).spray()
	});

});

describe('reload new', () => {

	it('should load a new array of promises', (done) => {
		var uzi = new Uzi(resolvedPromiseChain).reload(rejectedPromiseChain)
		assert.equal(uzi.clip.length, 5)
		done()
	});

});

describe('reload same', () => {

	it('should reload the same array of promises', (done) => {
		var uzi = new Uzi(resolvedPromiseChain)
		uzi.fire()
		.reload()
		.first(() => {
			assert.equal(uzi.uziQueue[0].roundsLeft, 3)
			done()
		}).spray()
	});

});

describe('chain', () => {

	it('should run all items in the chain in order', (done) => {
		var messages = []
		var gun = new Uzi([p2, p1, p4])
		.first(() => messages.push('first'))
		.hit(() => messages.push('hit'))
		.miss(() => messages.push('miss'))
		.then(() => {
			assert.equal(messages.join(""), "firsthithitmiss")
			messages = []
		})
		.fire()
		.reload()
		.first(() => messages.push("RELOADED"))
		.hit(() => messages.push('hit'))
		.then(() => {
			assert.equal(messages.join(""), "RELOADEDhithit")
		})
		.fire()
		.reload(rejectedPromiseChain)
		.first(() => messages.push("RELOADED"))
		.hit(() => messages.push('hit'))
		.miss(() => {
			messages.push('miss')
		})
		.then(() => {
			assert.equal(messages.join(""), "RELOADEDhithitRELOADEDhithitmisshitmiss")
			done()
		})
		.fire()
	});

});

describe('example', () => {
	it('should run the example from the readme', (done) => {

		var p1 = (param) => {
			return new Promise((resolve, reject) => {
				resolve("Apple")
			})
		}

		var p2 = (param) => {
			return new Promise((resolve, reject) => {
				setTimeout(() => resolve("Banana"), 3)
			})
		}

		var p3 = (param) => {
			return new Promise((resolve, reject) => {
				setTimeout(() => reject("Error"), 10)
			})
		}

		var messages = []

		new Uzi([p2, p1])
		.first(() => messages.push('first'))
		.hit(() => messages.push('hit'))
		.then(() => messages.push('then'))
		.fire()
		.reload([p2, p1, p3])
		.first(() => messages.push('reload'))
		.miss(() => messages.push('miss'))
		.hit(() => messages.push('hit'))
		.then(() => {
			done()
		})
		.spray()
	});
})