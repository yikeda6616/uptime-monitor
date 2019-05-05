/*
 * Server-related tasks
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');

// Instantiate the server module object
const server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, './../https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, './../https/cert.pem'))
};

server.httpsServer = https.createServer(
  server.httpsServerOptions,
  (req, res) => {
    server.unifiedServer(req, res);
  }
);

// All the server logic for both the http and https server
server.unifiedServer = function(req, res) {
  const parsedUrl = url.parse(req.url, true); // Get the URL and parse it

  const path = parsedUrl.pathname; // Get the path

  const trimmedPath = path.replace(/^\/+|\/+$/g, ''); // trim final slash

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;
  debug(queryStringObject);

  const method = req.method.toLowerCase(); // Get the HTTP Method

  const headers = req.headers; // Get the headers as an object

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => (buffer += decoder.write(data)));
  req.on('end', () => {
    buffer += decoder.end();

    // Choose the handler this request should go to.
    // If one is not found, use the not found handler
    let chosenHandler =
      typeof server.router[trimmedPath] !== 'undefined'
        ? server.router[trimmedPath]
        : handlers.notFound;

    // If the request is within the public directory, use the public handler instead
    chosenHandler = trimmedPath.includes('public/')
      ? handlers.public
      : chosenHandler;

    // Construct the data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload, contentType) => {
      // Determine the type of response (fallback to JSON)
      contentType = typeof contentType == 'string' ? contentType : 'json';

      // Use the status code called back by the handler, or default to 200
      statusCode = typeof statusCode == 'number' ? statusCode : 200;

      // Return the response-parts that are content-specific
      let payloadString = '';
      switch (contentType) {
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          payload = typeof payload == 'object' ? payload : {};
          payloadString = JSON.stringify(payload); // Convert the payload to a string
          break;
        case 'html':
          res.setHeader('Content-Type', 'text/html');
          payloadString = typeof payload == 'string' ? payload : '';
          break;
        case 'favicon':
          res.setHeader('Content-Type', 'image/x-icon');
          payloadString = typeof payload !== 'undefined' ? payload : '';
          break;
        case 'css':
          res.setHeader('Content-Type', 'text/css');
          payloadString = typeof payload !== 'undefined' ? payload : '';
          break;
        case 'png':
          res.setHeader('Content-Type', 'image/png');
          payloadString = typeof payload !== 'undefined' ? payload : '';
          break;
        case 'jpg':
          res.setHeader('Content-Type', 'image/jpeg');
          payloadString = typeof payload !== 'undefined' ? payload : '';
          break;
        case 'plain':
          res.setHeader('Content-Type', 'text/plain');
          payloadString = typeof payload !== 'undefined' ? payload : '';
          break;
        default:
          payloadString = '';
      }

      // Return the response-parts that are content-specific
      res.writeHead(statusCode);
      res.end(payloadString);

      // If the response is 200, print green, otherwise print red
      if (statusCode == 200) {
        debug(
          '\x1b[32m%s\x1b[0m',
          method.toUpperCase() + ' /' + trimmedPath + statusCode
        );
      } else {
        debug(
          '\x1b[31m%s\x1b[0m',
          method.toUpperCase() + ' /' + trimmedPath + statusCode
        );
      }
    });
  });
};

// Define a request router object
server.router = {
  '': handlers.index,
  'account/create': handlers.accountCreate,
  'account/edit': handlers.accountEdit,
  'account/deleted': handlers.accountDeleted,
  'session/create': handlers.sessionCreate,
  'session/deleted': handlers.sessionDeleted,
  'checks/all': handlers.checkList,
  'checks/create': handlers.checksCreate,
  'checks/edit': handlers.checksEdit,
  ping: handlers.ping,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/checks': handlers.checks,
  'favicon.ico': handlers.favicon,
  public: handlers.public
};

// Init script
server.init = function() {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, () => {
    console.log(
      '\x1b[36m%s\x1b[0m',
      `The server is listening on PORT ${config.httpPort}`
    );
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, () => {
    console.log(
      '\x1b[35m%s\x1b[0m',
      `The server is listening on PORT ${config.httpsPort}`
    );
  });
};

// Export the module
module.exports = server;
