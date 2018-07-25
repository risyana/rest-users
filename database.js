const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(`${__dirname}/db`, 'myapi.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log('connected to DB');
  }
});

// execute serial sql statements

db.serialize(() => {
  // create table
  let statement = 'CREATE TABLE USERS(id,email,name,password,phone)';
  db.run(statement, (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('table USERS is created');
    }
  });

  // insert
  statement = 'INSERT INTO USERS VALUES (?, ?, ?, ?, ?)';
  db.run(statement, ['1', 'eka@test.com', 'eka', 'pass', '03434'], (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('data inserted');
    }
  });
  // select ALL DATA
  statement = 'SELECT * FROM USERS';
  db.each(statement, (err, row) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(row);
    }
  });

  // update
  statement = 'UPDATE USERS SET name = ? WHERE email = ?';
  db.run(statement, 'joko', 'eka@test.com', (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('updated');
    }
  });

  // select ALL DATA
  statement = 'SELECT * FROM USERS';
  db.each(statement, (err, row) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(row);
    }
  });

  // delete
/*   statement = 'DELETE FROM USERS WHERE email = (?)';
  db.run(statement, 'eka@test.com', (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('delete');
    }
  }); */
});

db.close((err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log('DB closed');
  }
});
