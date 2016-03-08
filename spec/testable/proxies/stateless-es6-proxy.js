"use strict";

const Promise = require("bluebird");

// NOTE: We recommend having stateless proxies if at all possible!
class StatelessEs6Proxy {

  static getFirstName(personId) { // eslint-disable-line
    Promise.resolve("Cory");
  }

  static getMiddleName(personId, firstName) { // eslint-disable-line
    return "Bill";
  }

  static getLastName(personId, firstName, middleName, callback) { // eslint-disable-line
    callback("Parrish");
  }

  static dummyFunction() {}
}

module.exports = StatelessEs6Proxy;
