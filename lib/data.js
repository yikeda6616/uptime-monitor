/*
 * Library for storing and editing data
 *
 */

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for the module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname + '/../.data/');

// Write data to a file
lib.create = function(dir, file, data, callback) {
  // Open the file for writing
  fs.open(
    lib.baseDir + dir + '/' + file + '.json',
    'wx',
    (err, fileDescripter) => {
      if (!err && fileDescripter) {
        const stringData = JSON.stringify(data);

        // Write to file and close it
        fs.writeFile(fileDescripter, stringData, err =>
          !err
            ? fs.close(fileDescripter, err =>
                !err ? callback(false) : callback('Error closing new file')
              )
            : callback('Error writing to newfile')
        );
      } else {
        callback('Could not create new file, it may already exist');
      }
    }
  );
};

// Read data from a file
lib.read = function(dir, file, callback) {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// Update data inside a file
lib.update = function(dir, file, data, callback) {
  // Open the file for writing
  fs.open(
    lib.baseDir + dir + '/' + file + '.json',
    'r+',
    (err, fileDescripter) => {
      if (!err && fileDescripter) {
        const stringData = JSON.stringify(data);

        // Truncate the file
        fs.ftruncate(fileDescripter, err =>
          !err // Write to the file and close it
            ? fs.writeFile(fileDescripter, stringData, err =>
                !err
                  ? fs.close(fileDescripter, err =>
                      !err
                        ? callback(false)
                        : callback('Error closing existing file')
                    )
                  : callback('Error writing to existing file')
              )
            : callback('Error truncating file')
        );
      } else {
        callback('Could not open the file for updating, it may not exist yet');
      }
    }
  );
};

// Delete a file
lib.delete = function(dir, file, callback) {
  // Unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', err =>
    !err ? callback(false) : callback('Error deleting file')
  );
};

// List all the items in a directory
lib.list = function(dir, callback) {
  fs.readdir(lib.baseDir + dir + '/', (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = [];
      data.forEach(fileName => {
        trimmedFileNames.push(fileName.replace('.json', '')); // remove .json extention from name
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

// Export the module
module.exports = lib;
