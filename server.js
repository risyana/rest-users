const http = require('http');
const app = require('./app');

const port = 2121;

const server = http.createServer(app);

server.listen(port);
