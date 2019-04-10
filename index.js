/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

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

  const method = req.method.toLowerCase(); // Get the HTTP Method

  const headers = req.headers; // Get the headers as an object

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => (buffer += decoder.write(data)));
  req.on('end', () => {
    buffer += decoder.end();

    // Send the response
    res.end('Hello World\n');

    // Log the request path
    console.log(`Request received with this payload: ${buffer}`);
  });
});

// Start the server, and have it listen on PORT 3000
server.listen(3000, () => {
  console.log('The server is listening on PORT 3000');
});
