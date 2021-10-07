
const Service = require('./test-module-service');

class Controller {

  static noProxies(req, callback) {
    Service.executeWithNoProxies(req.params, req.query).then(function (result) {
      callback(undefined, result);

    }).catch(function (err) {
      callback(err);

    });
  }

  static statefulFactoryProxy(req, callback) {
    Service.executeWithStatefulFactoryProxy(req.params, req.query).then(function (result) {
      callback(undefined, result);

    }).catch(function (err) {
      callback(err);

    });
  }

  static statefulSingletonProxy(req, callback) {
    Service.executeWithStatefulSingletonProxy(req.params, req.query).then(function (result) {
      callback(undefined, result);

    }).catch(function (err) {
      callback(err);

    });
  }

  static statelessEs6Proxy(req, callback) {
    Service.executeWithStatelessEs6Proxy(req.params, req.query).then(function (result) {
      callback(undefined, result);

    }).catch(function (err) {
      callback(err);

    });
  }

  static statelessPreEs6SingletonProxy(req, callback) {
    Service.executeWithStatelessPreEs6SingletonProxy(req.params, req.query).then(function (result) {
      callback(undefined, result);

    }).catch(function (err) {
      callback(err);

    });
  }

  static statelessPreEs6StaticProxy(req, callback) {
    Service.executeWithStatelessPreEs6StaticProxy(req.params, req.query).then(function (result) {
      callback(undefined, result);

    }).catch(function (err) {
      callback(err);

    });
  }

  static initiateAsyncProcessing(req, callback) {
    setTimeout(() => {
      Service.executeWithStatelessEs6Proxy(req.params, req.query);
    }, 10);

    callback(undefined, { result: 'OK' });
  }
}

module.exports = Controller;
