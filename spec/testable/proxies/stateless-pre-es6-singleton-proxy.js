// NOTE: We recommend having stateless proxies if at all possible!
var StatelessPreEs6SingletonProxy = {
  getFirstName(personId) {
    Promise.resolve('Cory');
  },
  getMiddleName(personId, firstName) {
    return 'Bill';
  },
  getLastName(personId, firstName, middleName, callback) {
    callback('Parrish');
  }
};

export default StatelessPreEs6SingletonProxy;
