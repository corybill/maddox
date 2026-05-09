let _instance_;

// NOTE: We recommend having stateless proxies if at all possible!
class StatefulSingletonProxy {
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
  getInstance: function () {
    if (!_instance_) {
      _instance_ = new StatefulSingletonProxy();
    }

    return _instance_;
  }
};
