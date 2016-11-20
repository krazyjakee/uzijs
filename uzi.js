module.exports = class Uzi {

	constructor(clip, parent) {

		this.loadClip(clip.slice(0))
		this.enabled = true

		if(parent){
			this.parent = parent
			this.enabled = false
			this.log(`Constructed child instance ${parent.uziQueue.length}`)
		}else{
			this.uziQueue = []
			this.log("Constructed a parent instance")
		}

		return this

	}

	// Before anything, perform this function.
	first(action){
		
		this._first = action
		return this

	}

	// On a resolved promise
	hit(action){
		
		this._hit = action
		return this

	}

	// On a rejected promise
	miss(action){
		
		this._miss = (err) => {
			action(err)
			this.doMiss(err)
		}
		return this

	}

	// After all promises are fulfilled
	then(action){
		
		this._then = action
		return this

	}

	// Initiates the promise queue
	fire() {

		this.fireMethod = 1

		if(this.enabled || !this.parent){

			this.log("Instance is good to fire!")

			this.active = true

			if(this._first){
				this._first()
			}

			let a = this.queue[0]()
			this.queue.reduce((a, b) => {

				return a.then(b, this._miss.bind(this))
				.then(this.postHit.bind(this), this._miss.bind(this))

			}, a)

			return this

		}else{

			this.log("Instance is NOT good to fire!")
			return this.parent

		}

	}

	// Initiates all promised at the same time
	spray() {
		
		this.fireMethod = 2

		if(this.enabled || !this.parent){

			this.log("Instance is good to spray!")

			this.active = true

			if(this._first){
				this._first()
			}

			while(this.queue.length){
				this.queue.shift()().then(this.postHit.bind(this), this._miss.bind(this))
			}

			return this

		}else{

			this.log("Instance is NOT good to spray!")
			return this.parent

		}

	}

	// Loads a new array of promises or prepares the existing array to be run again
	reload(clip) {

		if(this.active && !this.parent){

			// The current one is active so better start a queue. Dual wielding ;)

			let queueItem = new Uzi(clip ? clip.slice(0) : this.clip.slice(0), this)
			this.uziQueue.push(queueItem)
			return queueItem

		}else{

			// If we're not waiting for anything, may as well reuse the current Uzi instance

			if(clip){
				this.loadClip(clip.slice(0))
			}else{
				this.queue = this.clip
				this.roundsLeft = this.clip.length
			}

			return this

		}


	}

	// After the hit function is called
	postHit(param) {

		this.roundsLeft--

		if(this._hit){
			this._hit(param)
		}

		return new Promise((accept, reject) => {
			
			this.checkCompleted()
			accept(param)

		})
	}

	checkCompleted() {
		if(!this.roundsLeft){
			if(this._then){
				this._then()
			}
			this.active = false
			this.nextQueueItem()
		}
	}

	enable() {
		this.enabled = true
		if(this.fireMethod){
			this.fireMethod == 1 ? this.fire() : this.spray()
		}
	}

	nextQueueItem() {
		if(!this.parent){
			if(this.uziQueue.length){
				this.log("Found a queue item, enabling it")
				this.uziQueue[0].enable()
			}else{
				this.log("Found no queue items")
			}
		}else{
			this.log("Completed a child item, removing it from the queue")
			this.parent.uziQueue.shift()
			this.parent.nextQueueItem()
		}
	}

	// Placeholder function if one is not provided
	_miss(err) {
		this.doMiss()
		this.log(err)
	}

	doMiss() {
		this.roundsLeft--
		this.checkCompleted()
	}

	// Prepares the class for the provided array of promises
	loadClip(clip) {

		if(!clip){
			this.log("Clip does not exist")
			return
		}

		if(!(clip.constructor === Array)) {
			this.log("Clip is not an array")
			return
		}

		if(!clip.length) {
			this.log("Clip is empty")
			return
		}

		this.roundsLeft = clip.length
		this.clip = clip
		this.queue = clip

	}

	log(msg) {

		if(global.debug){
			console.log("Uzijs: " + msg)
		}

	}

}