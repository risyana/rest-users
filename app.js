const express = require('express');
const userRoute = require('./api/routes/users');

const app = express();

app.use('/users', userRoute);

module.exports = app;
