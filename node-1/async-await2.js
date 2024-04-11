const fs = require('fs');

async function readFileAndPrint() {
  try {
    const data = await fs.promises.readFile('data.txt', 'utf8');
    console.log(data)
  } catch (err) {
    console.error('Error:', err)
  }
}

readFileAndPrint()