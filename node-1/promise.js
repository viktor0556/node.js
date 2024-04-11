const fs = require('fs')

// file read with promise
const fileReadPromise = new Promise((resolve, reject) => { 
  fs.readFile('example.txt', 'utf8', (err, data) => {
    if (err) {
      reject(err); // throw error if something not okay
    } else {
      resolve(data);
    }
  });
});

fileReadPromise.then(data => {
  console.log(data);
}).catch(err => {
  console.error('An err occurred:', err)
})