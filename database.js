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

module.exports = db;
