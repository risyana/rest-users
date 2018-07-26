const express = require('express');
const db = require('../../database');

const router = express.Router();
let stmt = '';

// GET ALL USERS
router.get('/', (req, res) => {
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
  const newUser = { ...req.body };
  stmt = 'INSERT INTO USERS VALUES (?, ?, ?, ?, ?)';

  const newUserArray = [null, newUser.email, newUser.name, newUser.password, newUser.phone];
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
});

// GET ONE SPECIFIC USER
router.get('/:id', (req, res) => {
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
router.patch('/:id', (req, res) => {
  const updatedUser = { ...req.body };
  const { id } = req.params;
  const updatedUserArray = [updatedUser.email, updatedUser.name,
    updatedUser.password, updatedUser.phone, id];
  stmt = 'UPDATE USERS SET email = ?, name = ?, password = ?, phone = ? WHERE id = ?';

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
});

// DELETE SPECIFIC USER
router.delete('/:id', (req, res) => {
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

module.exports = router;
