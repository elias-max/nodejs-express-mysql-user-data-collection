const mysql = require('mysql');
const { search } = require('../routes/user');

//connection pool
const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  yes: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// View users
exports.view = (req, res) => {
  // Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err; // Not connected!
    console.log('DB Connected as ID' + connection.threadId);

    // Use the connection
    connection.query('SELECT * FROM user WHERE status = "active"', (err, rows) => {
      // When done with the connection, release it
      connection.release();

      if (!err) {
        res.render('home', { rows });
      } else {
        console.log(err);
      }
      console.log('The data from user table: \n', rows);
    });
  });
};

// Find user by search
exports.find = (req, res) => {
  // Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err; // Not connected!
    console.log('DB Connected as ID' + connection.threadId);

    let searchTerm = req.body.search;

    // Use the connection
    connection.query('SELECT * FROM user WHERE first_name LIKE ?', ['%' + searchTerm + '%'], (err, rows) => {
      // When done with the connection, release it
      connection.release();

      if (!err) {
        res.render('home', { rows });
      } else {
        console.log(err);
      }
      console.log('The data from the user table: \n', rows);
    });
  });
};



exports.form = (req, res) => {
  res.render('add-user');
}

// Add new user
exports.create = (req, res) => {
  const { first_name, last_name, email, phone, comments } = req.body;
  let searchTerm = req.body.search;

  // Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err; // Not connected!
    console.log('DB Connected as ID' + connection.threadId);

    // Use the connection
    connection.query('INSERT INTO user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?', [first_name, last_name, email, phone, comments], (err, rows) => {
      if (!err) {
        res.render('add-user', { alert: 'User added successfully.' });
      } else {
        console.log(err);
      }
      console.log('The data from user table: \n', rows);

      // When done with the connection, release it
      connection.release();
    });
  });
}

// Edit user
exports.edit = (req, res) => {
  // Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err; // Not connected!
    console.log('DB Connected as ID' + connection.threadId);
    // User the connection
    connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
      //when done with the connection release it
      connection.release();
      if (!err) {
        res.render('edit-user', { rows });
      } else {
        console.log(err);
      }
      console.log('The data from user table: \n', rows);
    });
  });
}


// Update  user
exports.update = (req, res) => {
  const { first_name, last_name, email, phone, comments } = req.body;
  // Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err; // Not connected!
    console.log('DB Connected as ID' + connection.threadId);
    // User the connection
    connection.query('UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ? WHERE id = ?', [first_name, last_name, email, phone, comments, req.params.id],
      (err, rows) => {
        //when done with the connection release it
        connection.release();

        if (!err) {
          pool.getConnection((err, connection) => {
            if (err) throw err; // Not connected!
            console.log('DB Connected as ID' + connection.threadId);
            // User the connection
            connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, updatedUser) => {
              //when done with the connection release it
              connection.release();
              if (!err) {
                res.render('home', { rows: updatedUser, alert: `${first_name} has been updated.` });
                //res.render('home', { rows, alert: `${first_name} has been updated.` }); // you can also render this (edit-user)
              } else {
                console.log(err);
              }
              console.log('The data from user table: \n', rows);
            });
          });

        } else {
          console.log(err);
        }
        console.log('The data from user table: \n', rows);
      });
  });
}

// Delete User
exports.delete = (req, res) => {
  // Hide a record
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Database connection error');
    }

    connection.query('UPDATE user SET status = ? WHERE id = ?', ['removed', req.params.id], (err, rows) => {
      connection.release(); // Release the connection

      if (!err) {
        let removedUser = encodeURIComponent('User successfully removed.');
        res.redirect('/?removed=' + removedUser);
      } else {
        console.log(err);
        return res.status(500).send('Error deleting user');
      }
    });
  });
};

// View Users
exports.viewall = (req, res) => {
  // User the connection
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Database connection error');
    }

    connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
      connection.release(); // Release the connection

      if (!err) {
        res.render('view-user', { rows });
      } else {
        console.log(err);
        return res.status(500).send('Error viewing user');
      }
    });
  });
};