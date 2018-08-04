const http = require('http');
const app = require('./app');

const port = process.env.PORT || 2121;

const server = http.createServer(app);

if (!module.parent) server.listen(port);

module.exports = server;
