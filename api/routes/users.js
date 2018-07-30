const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../database');
const checkToken = require('../middleware/check-token');

const router = express.Router();
let stmt = '';
const saltRound = 10;

// GET ALL USERS
router.get('/', checkToken, (req, res) => {
  const rows = [];
  stmt = 'SELECT * FROM USERS';

  db.each(stmt, (err, row) => {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      rows.push(row);
    }
  }, () => {
    res.status(200).json({
      message: 'GET all users',
      user: rows,
    });
  });
});

// INSERT NEW USER
router.post('/', checkToken, (req, res) => {
  const newUser = { ...req.body }; // email, name, password, phone
  const newUserArray = [null, newUser.email, newUser.name, newUser.password, newUser.phone];
  stmt = 'INSERT INTO USERS VALUES (?, ?, ?, ?, ?)';

  bcrypt.hash(newUser.password, saltRound, (error, hash) => {
    if (error) {
      res.status(404).json({ message: error.message });
    } else {
      newUserArray[3] = hash;
      db.run(stmt, newUserArray, (err) => {
        if (err) {
          res.status(404).json({ message: err.message });
        } else {
          res.status(201).json({
            message: 'POST new user',
            newUser,
          });
        }
      });
    }
  });
});

// GET ONE SPECIFIC USER
router.get('/:id', checkToken, (req, res) => {
  const { id } = req.params;
  const rows = [];
  stmt = 'SELECT * FROM USERS WHERE id = ?';

  db.each(stmt, id, (err, row) => {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      rows.push(row);
    }
  }, () => {
    if (rows.length < 1) {
      res.status(200).json({
        message: `GET user ${id}`,
        user: null,
      });
    } else {
      res.status(200).json({
        message: `GET user ${id}`,
        user: rows[0],
      });
    }
  });
});

// UPDATE SPECIFIC USER
router.patch('/:id', checkToken, (req, res) => {
  const updatedUser = { ...req.body }; // email, name, password, phone
  const { id } = req.params;
  const updatedUserArray = [updatedUser.email, updatedUser.name,
    updatedUser.password, updatedUser.phone, id];
  stmt = 'UPDATE USERS SET email = ?, name = ?, password = ?, phone = ? WHERE id = ?';

  bcrypt.hash(updatedUser.password, saltRound, (error, hash) => {
    if (error) {
      res.status(404).json({ message: error.message });
    } else {
      updatedUserArray[2] = hash;
      db.run(stmt, updatedUserArray, (err) => {
        if (err) {
          res.status(404).json({ message: err.message });
        } else {
          res.status(201).json({
            message: `PATCH specific user ${id}`,
            updatedUser,
          });
        }
      });
    }
  });
});

// DELETE SPECIFIC USER
router.delete('/:id', checkToken, (req, res) => {
  const { id } = req.params;
  stmt = 'DELETE FROM USERS WHERE id = (?)';

  db.run(stmt, id, (err) => {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      res.status(200).json({ message: `DELETE specific user ${id}` });
    }
  });
});

// USER SIGN IN
router.post('/signin', (req, res) => {
  const loginCredential = { ...req.body }; // email, password
  const rows = [];

  stmt = 'SELECT * FROM USERS WHERE email = ?';

  db.each(stmt, loginCredential.email, (error, row) => {
    if (error) {
      res.status(404).json({ message: error.message });
    } else {
      rows.push(row);
    }
  }, () => {
    if (rows.length < 1) {
      res.status(404).json({ message: 'Auth failed (No email auth)' });
    } else {
      bcrypt.compare(loginCredential.password, rows[0].password, (err, result) => {
        if (err) {
          res.status(404).json({ message: `Auth failed : ${err.message}` });
        } else if (!result) {
          res.status(404).json({ message: 'Auth failed (Incorrect password)' });
        } else {
          const token = jwt.sign(
            {
              id: rows[0].id,
              email: rows[0].email,
              name: rows[0].name,
              phone: rows[0].phone,
            }, process.env.JWT_KEY || 'rahasia',
            {
              expiresIn: '1h',
            },
          );
          res.status(200).json({
            message: 'Authenticated',
            user: {
              id: rows[0].id,
              email: rows[0].email,
              name: rows[0].name,
              phone: rows[0].phone,
            },
            token,
          });
        }
      });
    }
  });
});

module.exports = router;
