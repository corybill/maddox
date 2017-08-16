"use strict";

const Service = require("./test-module-service");

class Controller {

  static noProxies(req) {
    return Service.executeWithNoProxies(req.params, req.query);
  }

  static statefulFactoryProxy(req) {
    return Service.executeWithStatefulFactoryProxy(req.params, req.query);
  }

  static statefulSingletonProxy(req) {
    return Service.executeWithStatefulSingletonProxy(req.params, req.query);
  }

  static statelessEs6Proxy(req) {
    return Service.executeWithStatelessEs6Proxy(req.params, req.query);
  }

  static statelessPreEs6SingletonProxy(req) {
    return Service.executeWithStatelessPreEs6SingletonProxy(req.params, req.query);
  }

  static statelessPreEs6StaticProxy(req) {
    return Service.executeWithStatelessPreEs6StaticProxy(req.params, req.query);
  }

  static initiateAsyncProcessing(req) {
    setTimeout(() => {
      Service.executeWithStatelessEs6Proxy(req.params, req.query);
    }, 10);

    return Promise.resolve({result: "OK"});
  }
}

module.exports = Controller;
