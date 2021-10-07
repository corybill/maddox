
var Promise = require('bluebird');

function StatelessPreEs6StaticProxy() {}

// Made up function name to demonstrate mocking.
// Returns a promise to demonstrate the use of mocking a function that returns a promise.

StatelessPreEs6StaticProxy.getFirstName = function (personId) {  // eslint-disable-line
  return Promise.resolve('Cory');
};

StatelessPreEs6StaticProxy.getMiddleName = function (personId, firstName) {  // eslint-disable-line
  return 'Bill';
};

StatelessPreEs6StaticProxy.getLastName = function (personId, firstName, middleName, callback) {  // eslint-disable-line
  callback('Parrish');
};

module.exports = StatelessPreEs6StaticProxy;
