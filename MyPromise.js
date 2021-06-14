function nothing() {}

class MyPromise {
    constructor(executor) {
        this.queue = []
        this.errorHendler = nothing
        this.finallyHendler = nothing

    try {
     executor.call(null, this.onResolve.bind(this), this.onReject.bind(this))
    } catch (e) {
      this.errorHendler(e)
      } finally {
      this.finallyHendler()
      }
    }

    onResolve(data) {
        this.queue.forEach(callback => {
           data = callback(data)
        } )

        this.finallyHendler()
    }

    onReject(error) {
        this.errorHendler(error)

        this.finallyHendler()
    }

   then(fn) { 
       this.queue.push(fn)
       return this
   }
    
   catch(fn) {
       this.errorHendler = fn
       return this
   }

   finally(fn) {
       this.finallyHendler = fn
       return this
   }

  static all(promisesArray) {
        let results = [];
        return new MyPromise((resolve, reject) => {
            for(let promise of promisesArray) {
                promise.then((resolveChild) => {
                    results.push(resolveChild);
                    if(results.length === promisesArray.length) {
                        resolve(results);
                    }
                });
            }
        })
        
    }

}

const requestURL  = 'https://jsonplaceholder.typicode.com/users'

function ajax (url, {type = 'GET', data = null, heders = {}}) {
    return new MyPromise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open([type], url)
    xhr.responseType = 'json'

    //to be used in case of "POST" requests
    for (let prop in heders) {
        xhr.setRequestHeader(prop, heders[prop])
    }

    xhr.onload = () => {
        if(xhr.status >= 400) {
            resolve(xhr.response)
        } else {
            reject(xhr.response)
        }
    }

    xhr.onerror = () => {
        reject(xhr.response)
    }
    // in case of "GET" request we can use xhr.send() without any params.
    xhr.send(JSON.stringify(data))
    })
}

//Some objects for testing 'setRequestHeder' and data sending in case of "POST" request

const body = {
    name: 'Max',
    age: 5
}

const myheder = {
    
    ['content-type']: 'application/json'
}


const configs = {
    type: 'POST',
    data: body,
    heders: myheder
}


 ajax(requestURL, configs)
.then(data => console.log(data))
.catch(err => console.log(err))

// ajax(requestURL, 'GET' )
// .then(data => console.log(data))
// .catch(err => console.log(err))