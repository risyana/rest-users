const express = require('express');
const bodyParser = require('body-parser');
const userRoute = require('./api/routes/users');
const generalRoute = require('./api/routes/general');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Avoid CORS error
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  next();
});

// routes
app.use('/users', userRoute);
app.use('/general', generalRoute);

// error handling 'Resource not found'
app.use((req, res, next) => {
  const error = new Error('Resource not found');
  error.status = 404;
  next(error);
});

// error handling for other error
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({ message: error.message });
  next();
});

module.exports = app;
