/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http');
const url = require('url');

// The server should respond to all requests with a string
const server = http.createServer((req, res, next) => {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, ''); // trim final slash

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;
  console.log(queryStringObject);

  // Get the HTTP Method
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  // Send the response
  res.end('Hello World\n');

  // Log the request path
  console.log(`Request received with these headers:${headers}`);
});

// Start the server, and have it listen on PORT 3000
server.listen(3000, () => {
  console.log('The server is listening on PORT 3000');
});
