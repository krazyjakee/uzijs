# Uzijs
Eazy handling of complex promise chains

## Installation

`npm install uzijs`

## Setup

### From the console
`npm install`

### In your javascript
`var Uzi = require('./uzi')`

### Testing

`npm test`

## Usage

A promise function passed into Uzi must return a promise with a resolve/reject callback.

```javascript
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
```

Here is a minimal example where each promise will be fired on after the other
```javascript
new Uzi([p2, p1]).fire()
```

You can extend this to have a callback after all the promises are complete.
```javascript
new Uzi([p2, p1])
.then(() => console.log("cool!"))
.fire()
```


Here is a feature complete example of what Uzijs can do with this...
```javascript
var messages = []

new Uzi([p2, p1])
.first(() => messages.push('first')) // perform a function before anything else
.hit(() => messages.push('hit')) // on a resolved promise
.then(() => messages.push('then')) // after all promises have been completed
.fire() // start the promise chain so they are all completed in order
.reload([p2, p1, p3]) // start a new promise chain, pass no arguments to reload the existing promise chain
.first(() => messages.push('reloaded'))
.miss(() => messages.push('miss')) // on a failed promise
.hit(() => messages.push('hit'))
.then(() => {
	console.log(messages) // ['first', 'hit', 'hit', 'then', 'reload', 'hit', 'hit', 'miss']
})
.spray() // fire all promises at the same time
```