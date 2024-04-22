const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const mysql = require("mysql");

const PORT = 3000;

const fs = require("fs");

const hostname = fs.readFileSync("host.txt", "utf8").trim();
const mypassword = fs.readFileSync("password.txt", "utf8").trim();
const mydatabase = fs.readFileSync("database.txt", "utf8").trim();
const name = fs.readFileSync("user.txt", "utf8").trim();

const db = mysql.createConnection({
  host: hostname,
  user: name,
  password: mypassword,
  database: mydatabase,
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to database");
});

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome on registration");
});

app.get("/registration", (req, res) => {
  res.sendFile(__dirname + "/registration.html");
});

app.post("/registration", async (req, res) => {
  try {
    // First check if the user already exists in the database
    const { name, email, password } = req.body;

    // check if user already exists
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, result) => {
      if (err) {
        throw err;
      }

      if (result.length > 0) {
        return res.status(400).send("This email is not available");
      }

      // password encryption
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into database
      const insertQuery =
        "INSERT INTO users (name, email, password) VALUES (?,?,?)";
      db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
        if (err) {
          throw err;
        }
        res.send("Succesful registration");
      });
    });
  } catch {
    res.status(500).send("An error occurred during registration.");
  }
});

// display login form
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // user check in the database
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, result) => {
      if (err) {
        throw err;
      }

      // if user not exist
      if (result.length === 0) {
        return res.status(400).send("Invalid email or password");
      }

      const user = result[0];

      // password check
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).send("Invalid email or password");
      }

      // Send user data back to client
      res.send("Login succesful")
    });
  } catch {
    res.status(500).send("An error occured during login.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
