"use strict";

let _instance_;

// NOTE: We recommend having stateless proxies if at all possible!
class StatefulSingletonProxy {

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
  getInstance: function () {
    if (!_instance_) {
      _instance_ = new StatefulSingletonProxy();
    }

    return _instance_;
  }
};
