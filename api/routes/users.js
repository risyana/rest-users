const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../database');
const checkToken = require('../middleware/check-token');

const router = express.Router();
let stmt = '';
const saltRound = 10;

// COMMON
const checkExistence = (field, value, res) => {
  stmt = `SELECT COUNT(1) COUNT FROM USERS WHERE ${field} = ? `;
  db.each(stmt, value, (err, row) => {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      res.status(200).json({ message: `Get number of ${field}`, row });
    }
  });
};

// Check existence
router.post('/emails', (req, res) => {
  const { email } = req.body;
  checkExistence('email', email, res);
});

router.post('/phones', (req, res) => {
  const { phone } = req.body;
  checkExistence('phone', phone, res);
});

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
router.post('/', (req, res) => {
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
  const updatedUserArray = [updatedUser.email, updatedUser.name, updatedUser.phone, id];
  const rows = [];

  db.serialize(() => {
    // check id
    stmt = 'SELECT id, email, name, phone from USERS WHERE id = ?';
    db.each(stmt, id, (err, row) => {
      if (err) {
        res.status(404).json({ message: err.message });
      } else {
        rows.push(row);
      }
    });

    // update
    stmt = 'UPDATE USERS SET email = ?, name = ?, phone = ? WHERE id = ?';
    db.run(stmt, updatedUserArray, (err) => {
      if (err) {
        res.status(404).json({ message: err.message });
      } else if (rows.length <= 0) {
        res.status(202).json({ message: 'nothing to update' });
      } else {
        res.status(201).json({
          message: `PATCH specific user ${id}`,
          updatedUser: { ...updatedUser },
        });
      }
    });
  });
});

// UPDATE PASSWORD FOR SPECIFIC USER
router.patch('/password/:id', checkToken, (req, res) => {
  const updatedUser = { ...req.body }; // password
  const { id } = req.params;
  const updatedUserArray = [updatedUser.password, id];
  const rows = [];

  bcrypt.hash(updatedUser.password, saltRound, (error, hash) => {
    if (error) {
      res.status(404).json({ message: error.message });
    } else {
      updatedUserArray[0] = hash;
      db.serialize(() => {
        // check id
        stmt = 'SELECT id, email, name, phone from USERS WHERE id = ?';
        db.each(stmt, id, (err, row) => {
          if (err) {
            res.status(404).json({ message: err.message });
          } else {
            rows.push(row);
          }
        });

        // update
        stmt = 'UPDATE USERS SET password = ? WHERE id = ?';
        db.run(stmt, updatedUserArray, (err) => {
          if (err) {
            res.status(404).json({ message: err.message });
          } else if (rows.length <= 0) {
            res.status(202).json({ message: 'nothing to update' });
          } else {
            res.status(201).json({
              message: `PATCH password for user ${id}`,
              updatedUser: { ...rows[0] },
            });
          }
        });
      });
    }
  });
});

// DELETE SPECIFIC USER
router.delete('/:id', checkToken, (req, res) => {
  const { id } = req.params;

  stmt = 'SELECT COUNT(1) COUNT FROM USERS WHERE id = ?';
  db.get(stmt, id, (err, row) => {
    if (err) {
      res.status(404).json({ message: err.message });
    } else if (row.COUNT === 0) {
      res.status(202).json({ message: 'nothing to delete' });
    } else {
      stmt = 'DELETE FROM USERS WHERE id = ?';
      db.run(stmt, id, (error) => {
        if (error) {
          res.status(404).json({ message: error.message });
        } else {
          res.status(200).json({ message: `DELETE specific user ${id}` });
        }
      });
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
              expiresIn: '48h',
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
