const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const fs = require('fs');

const username = fs.readFileSync('username.txt', 'utf8').trim();
const password = fs.readFileSync('password.txt', 'utf8').trim();
const database = fs.readFileSync('database.txt', 'utf8').trim();
const host = fs.readFileSync('host.txt', 'utf8').trim();
const port = parseInt(fs.readFileSync('port.txt', 'utf8').trim(), 10);

const app = express();
const PORT = 3000;

// PostgreSQL database connection configuration
const pool = new Pool({
  user: username, // your PostgreSQL username
  host: host, // if you use local machine use localhost
  database: database, // your PostgreSQL database name
  password: password, // your PostgreSQL password
  port: port, // default PostgreSQL port is 5432
});

// express middlewares setting
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// root path
app.get("/", (req, res) => {
  res.send("Welcome on my blog app!");
});

// Get path for the registration - display form
app.get("/register", (req, res) => {
  // send register.html file
  res.sendFile(__dirname + "/register.html");
});

// receiving the data
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // we check if such a username exists
  const userExistsQuery = "SELECT * FROM users WHERE username = $1";
  const userExists = await pool.query(userExistsQuery, [username]);

  if (userExists.rows.length > 0) {
    return res.status(400).json({ error: "This username is taken." });
  }

  // let's hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // add user to the database
  const insertUserQuery =
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *";
  const newUser = await pool.query(insertUserQuery, [username, hashedPassword]);

  // returning the new user's data to the client
  res.status(201).json(newUser.rows[0]);
});

// Get path for the login - display form
app.get("/login", (req, res) => {
  // send login.html file
  res.sendFile(__dirname + "/login.html");
});

// receiving the data
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // search for a user by username
  const findUserQuery = "SELECT * FROM users WHERE username = $1";
  const user = await pool.query(findUserQuery, [username]);

  if (user.rows.length === 0) {
    return res.status(401).json({ error: "Wrong username or password." });
  }

  // password check
  const hashedPassword = user.rows[0].password;
  const passwordMatch = await bcrypt.compare(password, hashedPassword);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Wrong username or password" });
  }

  res.status(200).json({ error: "Successful login!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
