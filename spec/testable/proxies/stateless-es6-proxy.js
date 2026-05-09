// NOTE: We recommend having stateless proxies if at all possible!
class StatelessEs6Proxy {
  static getFirstName(personId) {
    Promise.resolve('Cory');
  }

  static getMiddleName(personId, firstName) {
    return 'Bill';
  }

  static getLastName(personId, firstName, middleName, callback) {
    callback('Parrish');
  }

  static dummyFunction() {}
}

export default StatelessEs6Proxy;
