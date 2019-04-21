/*
 * Request handlers
 *
 */

// Dependencies

// Define the handlers
const handlers = {
  // Users
  users: function(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
      handlers._users[data.method](data, callback);
    } else {
      callback(405);
    }
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
          ? data.payload.lastName.trim()
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
    },
    get: function(data, callback) {},
    put: function(data, callback) {},
    delete: function(data, callback) {}
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
