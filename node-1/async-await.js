const fs = require('fs');

async function readFileAsync() {
  try {
    const data = await fs.promises.readFile('example.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('An err occured:', err);
  }
}

readFileAsync();