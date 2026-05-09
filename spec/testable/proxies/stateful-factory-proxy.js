// NOTE: We recommend having stateless proxies if at all possible!
class StatefulFactoryProxy {
  // Made up function name to demonstrate mocking.
  // Returns a promise to demonstrate the use of mocking a function that returns a promise.

  getFirstName(personId) {
    Promise.resolve('Cory');
  }

  getMiddleName(personId, firstName) {
    return 'Bill';
  }

  getLastName(personId, firstName, middleName, callback) {
    callback('Parrish');
  }
}

export default {
  factory: function () {
    return new StatefulFactoryProxy();
  }
};
