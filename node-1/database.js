const sqlite = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mydatabase.db');

const db = new sqlite.Database(dbPath, err => {
  if (err) {
    return console.error('An error occurred while creating the database connection:', err.message);
  }
  console.log('Successfully connected to the database.')
});

db.run(`CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL
)`, err => {
  if (err) {
    return console.error('An error occurred while creating the table:', err.message);
  }
  console.log('The "users" table is created.');
});

db.close(err => {
  if (err) {
    return console.error('An error occurred while closing the database connection:', err.message);
  }
  console.log('Connection closed.')
})