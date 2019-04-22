/*
 * Request handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define the handlers
const handlers = {
  // Users
  users: function(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    acceptableMethods.indexOf(data.method) > -1
      ? handlers._users[data.method](data, callback)
      : callback(405);
  },

  // Container for the users submethods
  _users: {
    // Users - post
    // Required data: firstName, lastName, phone, password, tosAgreement
    // Optional data: none
    post: function(data, callback) {
      // Check that all required fields are filled out
      const firstName =
        typeof data.payload.firstName == 'string' &&
        data.payload.firstName.trim().length > 0
          ? data.payload.firstName.trim()
          : false;

      const lastName =
        typeof data.payload.lastName == 'string' &&
        data.payload.lastName.trim().length > 0
          ? data.payload.lastName.trim()
          : false;

      const phone =
        typeof data.payload.phone == 'string' &&
        data.payload.phone.trim().length == 10
          ? data.payload.phone.trim()
          : false;

      const password =
        typeof data.payload.password == 'string' &&
        data.payload.password.trim().length > 0
          ? data.payload.password.trim()
          : false;

      const tosAgreement =
        typeof data.payload.tosAgreement == 'boolean' &&
        data.payload.tosAgreement == true
          ? true
          : false;

      if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exist
        _data.read('users', phone, function(err, data) {
          if (err) {
            // Hash the password
            const hashedPassword = helpers.hash(password);

            if (hashedPassword) {
              // Create the user object
              const userObject = {
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                hashedPassword: hashedPassword,
                tosAgreement: true
              };

              // Store the user
              _data.create('users', phone, userObject, function(err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: 'Could not create the new user' });
                }
              });
            } else {
              callback(500, { Error: "Could not hash the user's password" });
            }
          } else {
            // User already exists
            callback(400, {
              Error: 'A user with that phone number already exists'
            });
          }
        });
      } else {
        callback(400, { Error: 'Missing required fields' });
      }
    },

    // Users - get
    // Required data: phone
    // Optional data: none
    // TODO: Only let an authenticated user access their object. Don't let them access anyone else's.
    get: function(data, callback) {
      // Check that the phone number is valid
      const phone =
        typeof data.queryStringObject.phone == 'string' &&
        data.queryStringObject.phone.trim().length == 10
          ? data.queryStringObject.phone.trim()
          : false;

      if (phone) {
        _data.read('users', phone, function(err, data) {
          if (!err && data) {
            // Remove the hashed password from the user object before returning it to the requester
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(400, { Error: 'Missing required field' });
      }
    },

    // Users - put
    // Required data: phone
    // Optional data: firstName, lastName, password (at least one must be specified)
    // TODO: Only let an authenticated user update their own object. Don't let them update anyone else's.
    put: function(data, callback) {
      // Check for the required field
      const phone =
        typeof data.payload.phone == 'string' &&
        data.payload.phone.trim().length == 10
          ? data.payload.phone.trim()
          : false;

      // Check for optinaol field
      const firstName =
        typeof data.payload.firstName == 'string' &&
        data.payload.firstName.trim().length > 0
          ? data.payload.firstName.trim()
          : false;

      const lastName =
        typeof data.payload.lastName == 'string' &&
        data.payload.lastName.trim().length > 0
          ? data.payload.lastName.trim()
          : false;

      const password =
        typeof data.payload.password == 'string' &&
        data.payload.password.trim().length > 0
          ? data.payload.password.trim()
          : false;

      // Error if the phone is invalid
      if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
          // Lookup the user
          _data.read('users', phone, function(err, userData) {
            if (!err && userData) {
              // Update the fields necessary
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }

              // Store the new updates
              _data.update('users', phone, userData, function(err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: 'Could not update the user' });
                }
              });
            } else {
              callback(400, { Error: 'The specified user does not exist' });
            }
          });
        } else {
          callback(400, { Error: 'Missing fields to update' });
        }
      } else {
        callback(400, { Error: 'Missing required field' });
      }
    },

    // Users - delete
    // Required field: phone
    // TODO: Only let an authenticated user delete their object. Don't let them delete anyone else's.
    // TODO: Cleanup(delete) any other data files associated with this user
    delete: function(data, callback) {
      // Check that the phone number is valid
      const phone =
        typeof data.queryStringObject.phone == 'string' &&
        data.queryStringObject.phone.trim().length == 10
          ? data.queryStringObject.phone.trim()
          : false;

      if (phone) {
        _data.read('users', phone, function(err, data) {
          if (!err && data) {
            _data.delete('users', phone, function(err) {
              if (!err) {
                callback(200);
              } else {
                callback(500, { Error: 'Could not delete the specified user' });
              }
            });
          } else {
            callback(400, { Error: 'Could not find the specified user' });
          }
        });
      } else {
        callback(400, { Error: 'Missing required field' });
      }
    }
  },

  // Tokens
  tokens: function(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    acceptableMethods.indexOf(data.method) > -1
      ? handlers._tokens[data.method](data, callback)
      : callback(405);
  },

  // Container for all the tokens sub methods
  _tokens: {
    // Tokens - post
    // Required data: phone, password
    // Optional data: none
    post: function(data, callback) {
      const phone =
        typeof data.payload.phone == 'string' &&
        data.payload.phone.trim().length == 10
          ? data.payload.phone.trim()
          : false;

      const password =
        typeof data.payload.password == 'string' &&
        data.payload.password.trim().length > 0
          ? data.payload.password.trim()
          : false;

      if (phone && password) {
        // Look up the user who matches that phone number
        _data.read('users', phone, function(err, userData) {
          if (!err && userData) {
            // Hash the sent password, and compare it to the password stored in the user object
            const hashedPassword = helpers.hash(password);
            if (hashedPassword == userData.hashedPassword) {
              // If valid, create a new token with a random name, Set expiration date 1 hour in the future.
              const tokenId = helpers.createRandomString(20);
              const expires = Date.now() + 1000 * 60 * 60;
              const tokenObject = {
                phone: phone,
                id: tokenId,
                expires: expires
              };

              // Store the token
              _data.create('tokens', tokenId, tokenObject, function(err) {
                if (!err) {
                  callback(200, tokenObject);
                } else {
                  callback(500, { Error: 'Could not create the new token' });
                }
              });
            } else {
              callback(400, {
                Error:
                  "Password didn't match the specified user's stored password"
              });
            }
          } else {
            callback(400, { Error: 'Could not find the specified user' });
          }
        });
      } else {
        callback(400, { Error: 'Missing required field(s)' });
      }
    },

    // Tokens - get
    // Required data: id
    // Optional data: none
    get: function(data, callback) {
      // Check that the id is valid
      const id =
        typeof data.queryStringObject.id == 'string' &&
        data.queryStringObject.id.trim().length == 20
          ? data.queryStringObject.id.trim()
          : false;

      if (id) {
        // Lookup the token
        _data.read('tokens', id, function(err, tokenData) {
          if (!err && tokenData) {
            callback(200, tokenData);
          } else {
            callback(404);
          }
        });
      } else {
        callback(400, { Error: 'Missing required field' });
      }
    },

    // Tokens - put
    // Required data: id, extend
    // Optional data: none
    put: function(data, callback) {
      const id =
        typeof data.payload.id == 'string' &&
        data.payload.id.trim().length == 20
          ? data.payload.id.trim()
          : false;
      const extend =
        typeof data.payload.extend == 'boolean' && data.payload.extend == true
          ? true
          : false;

      if (id && extend) {
        // Lookup the token
        _data.read('tokens', id, function(err, tokenData) {
          if ((!err, tokenData)) {
            // Check to the make sure the token isn't already expired
            if (tokenData.expires > Date.now()) {
              // Set the expiration an hour from now
              tokenData.expires = Date.now() + 1000 * 60 * 60;

              // Store the new updates
              _data.update('tokens', id, tokenData, function(err) {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, {
                    Error: "Could not update the token's expiration"
                  });
                }
              });
            } else {
              callback(400, {
                Error: 'The token has already expired, and cannot be extended'
              });
            }
          } else {
            callback(400, { Error: 'Specified token does not exist' });
          }
        });
      } else {
        callback(400, {
          Error: 'Missing required field(s) or field(s) are invalid'
        });
      }
    },

    // Tokens - delete
    // Required data: id
    // Optional data: none
    delete: function(data, callback) {
      // Check that the id is valid
      const id =
        typeof data.queryStringObject.id == 'string' &&
        data.queryStringObject.id.trim().length == 20
          ? data.queryStringObject.id.trim()
          : false;

      if (id) {
        _data.read('tokens', id, function(err, data) {
          if (!err && data) {
            _data.delete('tokens', id, function(err) {
              if (!err) {
                callback(200);
              } else {
                callback(500, {
                  Error: 'Could not delete the specified token'
                });
              }
            });
          } else {
            callback(400, { Error: 'Could not find the specified token' });
          }
        });
      } else {
        callback(400, { Error: 'Missing required field' });
      }
    }
  },

  // Ping handler
  ping: function(data, callback) {
    callback(200);
  },

  // Hello handler
  hello: function(data, callback) {
    callback(200, { message: 'Hello World!' });
  },

  // Not found handler
  notFound: function(data, callback) {
    callback(404);
  }
};

module.exports = handlers;
