const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    const error = new Error('Auth failed : no auth header');
    next(error);
  } else {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY || 'rahasia');
      req.users = decoded;
      next();
    } catch (err) {
      res.status(401).json({
        message: `Auth failed ${err}`,
      });
    }
  }
};
