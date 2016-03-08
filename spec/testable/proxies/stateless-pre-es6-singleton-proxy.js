"use strict";

var Promise = require("bluebird");

// NOTE: We recommend having stateless proxies if at all possible!
var StatelessPreEs6SingletonProxy = {
  getFirstName(personId) { // eslint-disable-line
    Promise.resolve("Cory");
  },
  getMiddleName(personId, firstName) { // eslint-disable-line
    return "Bill";
  },
  getLastName(personId, firstName, middleName, callback) { // eslint-disable-line
    callback("Parrish");
  }
};

module.exports = StatelessPreEs6SingletonProxy;
