const inquirer = require("inquirer");
const sqlite3 = require("sqlite3").verbose(); // database

const db = new sqlite3.Database("database.db", (err) => {
  // we create a database connection with the SQLite database named mydatabase.db
  if (err) {
    // if an error occurs, it displays the error
    return console.error(
      "An error occurred while establishing the database connection:",
      err.message
    );
  }
  console.log("Successfully connected to the database.");

  db.run(
    `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL
  )
  `,
    (err) => {
      if (err) {
        return console.error(
          "An error occurred while creating the 'users' table:",
          err.message
        );
      }
      console.log(
        "The 'users' table has been successfully created (or already exists)."
      );
    }
  );
});

const addUser = () => {
  // We request the username and email address from the user using a prompt
  inquirer
    .prompt([
      {
        type: "input",
        name: "username",
        message: "Enter username:",
      },
      {
        type: "input",
        name: "email",
        message: "Enter email:",
      },
    ])
    .then((answers) => {
      const { username, email } = answers;
      /* 
  INSERT INTO command: insert data into the database
  users: the name of the data table into which we insert the data
  username, email: the names of the columns of the data table into which we insert the data
  VALUES (?, ?): placeholders, which will be replaced later with the actual data
  [username, email]: the values ​​of the placeholders to insert in their place
  function(err): a callback function that runs when the run is finished
  */
      db.run(
        `INSERT INTO users (username, email) VALUES (?, ?)`,
        [username, email],
        function (err) {
          if (err) {
            return console.error(
              "An error occurred while adding the user:",
              err.message
            );
          }
          console.log(`User added: ${username}, ${email}`);
        }
      );
    });
};

const listUsers = () => {
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    /* 
    SELECT * FROM users = returns all fields from the "users" table.

    Empty array: This is the place for the parameters,
    but since we don't need them, we pass an empty array.

    the third argument is an arrow function that expects two parameters: err and rows.
    This function is executed when the database request completes.
    */
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(row);
    });
    /* 
    If there is no error, the function executes a 
    forEach loop on the rows array,
    which applies a callback function to each row.
    This callback function prints the line to the console.
    */
  });
};

const updateUser = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "id",
        message: "Please provide the ID of the user to be updated:",
      },
      {
        type: "input",
        name: "username",
        message: "New username please:",
      },
      {
        type: "input",
        name: "email",
        message: "New email address please:",
      },
    ])
    .then((answers) => {
      const { id, username, email } = answers;

      db.run(
        `UPDATE users SET username = ?, email = ? WHERE id = ?`,
        [username, email, id],
        function (err) {
          /*
      The UPDATE command modifies the record 
      of the user with the specified id in the users table,
      with the new username and email values.
      */
          if (err) {
            return console.error("An error occurred while updating the user");
          }
          console.log(`User updated: ${id}, ${username}, ${email}`);
        }
      );
    });
};

const deleteUser = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "id",
        message: "Please provide the ID of the user to be deleted:",
      },
    ])
    .then((answers) => {
      const { id } = answers;

      db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
        /* 
    Deletes from the users table the user whose ID is the same
    as the value stored in the id variable 
    */
        if (err) {
          return console.error(
            "An error occurred while deleting the user: ",
            err.message
          );
        }
        console.log(`User deleted: ${id}`);
      });
    });
};

const main = () => {
  console.log("1. Add user");
  console.log("2. List users");
  console.log("3. Update user");
  console.log("4. Delete user");
  console.log("5. Exit");
  // These lines list the options for the user.
  
  inquirer
    .prompt([
      {
        type: "input",
        name: "choice",
        message: "Select an operation (1-5):",
        validate: function (value) {
          var valid = !isNaN(parseFloat(value));
          return valid || "Please enter a number";
        },
        filter: Number,
      },
    ])
    .then(answers => {
      const { choice } = answers;
      switch (choice) {
        /* 
    It is a choice structure that branches based
    on which option the user has chosen. 
    */
        case 1:
          addUser();
          break;
        case 2:
          listUsers();
          break;
        case 3:
          updateUser();
          break;
        case 4:
          deleteUser();
          break;
        case 5:
          /*
      case '1':, case '2': etc. lines handle each possible response
      and call the function corresponding to the chosen action.
      */
          db.close((err) => {
            if (err) {
              return console.error(
                "An error occurred while closing the database connection:",
                err.message
              );
            }
            console.log("Connection closed.");
          });
          process.exit(0);

        default:
          /*
      The default: branch handles cases 
      where the user has not selected anything.
      */
          console.log("Invalid choice");
          break;
      }
  });
};

// we call the function
main();
