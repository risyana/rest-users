const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'GET all users' });
});

router.post('/', (req, res) => {
  res.status(200).json({ message: 'POST new user' });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({ message: `GET specific user ${id}` });
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({ message: `PATCH specific user ${id}` });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({ message: `DELETE specific user ${id}` });
});

module.exports = router;
