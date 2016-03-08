"use strict";

const Promise = require("bluebird");

// NOTE: We recommend having stateless proxies if at all possible!
class StatefulFactoryProxy {

  // Made up function name to demonstrate mocking.
  // Returns a promise to demonstrate the use of mocking a function that returns a promise.

  getFirstName(personId) { // eslint-disable-line
    Promise.resolve("Cory");
  }

  getMiddleName(personId, firstName) { // eslint-disable-line
    return "Bill";
  }

  getLastName(personId, firstName, middleName, callback) { // eslint-disable-line
    callback("Parrish");
  }
}

module.exports = {
  factory: function () {
    return new StatefulFactoryProxy();
  }
};
