/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http');

// The server should respond to all requests with a string
const server = http.createServer((req, res, next) => {
  res.end('Hello World\n');
});

// Start the server, and have it listen on PORT 3000
server.listen(3000, () => {
  console.log('The server is listening on PORT 3000');
});
