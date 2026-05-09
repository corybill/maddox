function StatelessPreEs6StaticProxy() {}

// Made up function name to demonstrate mocking.
// Returns a promise to demonstrate the use of mocking a function that returns a promise.

StatelessPreEs6StaticProxy.getFirstName = function (personId) {
  return Promise.resolve('Cory');
};

StatelessPreEs6StaticProxy.getMiddleName = function (personId, firstName) {
  return 'Bill';
};

StatelessPreEs6StaticProxy.getLastName = function (personId, firstName, middleName, callback) {
  callback('Parrish');
};

export default StatelessPreEs6StaticProxy;
