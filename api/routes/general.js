const express = require('express');
const checkToken = require('../middleware/check-token');

const router = express.Router();

// check connection
router.get('/connection', (req, res) => {
  res.status(200).json({ message: 'Resource Available..' });
});

// check token validity
router.post('/token', checkToken, (req, res) => {
  res.status(200).json({
    message: 'Token is valid',
    user: {
      id: req.users.id,
      email: req.users.email,
      name: req.users.name,
      phone: req.users.phone,
    },
  });
});

module.exports = router;
