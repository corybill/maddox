
const Promise = require('bluebird'),
  Preconditions = require('preconditions');

const testConstants = require('../../../test-constants'),
  StatefulFactoryProxy = require('../../proxies/stateful-factory-proxy'),
  StatefulSingletonProxy = require('../../proxies/stateful-singleton-proxy'),
  StatelessEs6Proxy = require('../../proxies/stateless-es6-proxy'),
  StatelessPreEs6SingletonProxy = require('../../proxies/stateless-pre-es6-singleton-proxy'),
  StatelessPreEs6StaticProxy = require('../../proxies/stateless-pre-es6-static-proxy');

const preconditions = Preconditions.singleton();

class Service {

  static executeWithNoProxies(urlParams, queryParams) {
    return new Promise(function (resolve) {
      preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

      var result = {
        personId: urlParams.personId,
        homeState: queryParams.homeState
      };

      resolve(result);
    });
  }

  static executeWithStatefulFactoryProxy(urlParams, queryParams) {
    // NOTE: Ordering matters when using a stateful proxy like a factory function.  You must call the mocked function
    // within the flow of code execution to allow Maddox the opportunity to generate mocks.

    return new Promise(function (resolve, reject) {
      preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

      var result = {
        personId: urlParams.personId,
        homeState: queryParams.homeState
      };

      let proxy = StatefulFactoryProxy.factory(); // e.g. Must call mocked function with the flow of code

      return proxy.getFirstName(urlParams.personId).then(function (firstName) {
        return proxy.getFirstName(urlParams.personId, firstName);

      }).then(function (firstName) {
        var middleName = proxy.getMiddleName(urlParams.personId, firstName);

        return proxy.getLastName(urlParams.personId, firstName, middleName, function (err, lastName) {
          if (err) {
            throw err;
          } else {
            result.lastName = lastName;
            resolve(result);
          }
        });
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  static executeWithStatefulSingletonProxy(urlParams, queryParams) {
    // NOTE: Ordering matters when using a stateful proxy like a factory function.  You must call the mocked function
    // within the flow of code execution to allow Maddox the opportunity to generate mocks.

    return new Promise(function (resolve, reject) {
      preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

      var result = {
        personId: urlParams.personId,
        homeState: queryParams.homeState
      };

      let proxy = StatefulSingletonProxy.getInstance(); // e.g. Must call mocked function within the flow of code

      return proxy.getFirstName(urlParams.personId).then(function (firstName) {
        return proxy.getFirstName(urlParams.personId, firstName);

      }).then(function (firstName) {
        var middleName = proxy.getMiddleName(urlParams.personId, firstName);

        return proxy.getLastName(urlParams.personId, firstName, middleName, function (err, lastName) {
          if (err) {
            throw err;
          } else {
            result.lastName = lastName;
            resolve(result);
          }
        });
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  static executeWithStatelessEs6Proxy(urlParams, queryParams) {
    return new Promise(function (resolve, reject) {
      preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

      var result = {
        personId: urlParams.personId,
        homeState: queryParams.homeState
      };

      let proxy = StatelessEs6Proxy;

      return proxy.getFirstName(urlParams.personId).then(function (firstName) {
        return proxy.getFirstName(urlParams.personId, firstName);

      }).then(function (firstName) {
        if (urlParams.personId === testConstants.ForceTestFailure) {
          throw new Error(testConstants.ForceTestFailure);
        }

        var middleName = proxy.getMiddleName(urlParams.personId, firstName);

        return proxy.getLastName(urlParams.personId, firstName, middleName, function (err, lastName) {
          if (err) {
            throw err;
          } else {
            result.lastName = lastName;
            resolve(result);
          }
        });
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  static executeWithStatelessPreEs6SingletonProxy(urlParams, queryParams) {
    return new Promise(function (resolve, reject) {
      preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

      var result = {
        personId: urlParams.personId,
        homeState: queryParams.homeState
      };

      let proxy = StatelessPreEs6SingletonProxy;

      return proxy.getFirstName(urlParams.personId).then(function (firstName) {
        return proxy.getFirstName(urlParams.personId, firstName);

      }).then(function (firstName) {
        var middleName = proxy.getMiddleName(urlParams.personId, firstName);

        return proxy.getLastName(urlParams.personId, firstName, middleName, function (err, lastName) {
          if (err) {
            throw err;
          } else {
            result.lastName = lastName;
            resolve(result);
          }
        });
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  static executeWithStatelessPreEs6StaticProxy(urlParams, queryParams) {
    return new Promise(function (resolve, reject) {
      preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

      var result = {
        personId: urlParams.personId,
        homeState: queryParams.homeState
      };

      let proxy = StatelessPreEs6StaticProxy;

      return proxy.getFirstName(urlParams.personId).then(function (firstName) {
        return proxy.getFirstName(urlParams.personId, firstName);

      }).then(function (firstName) {
        var middleName = proxy.getMiddleName(urlParams.personId, firstName);

        return proxy.getLastName(urlParams.personId, firstName, middleName, function (err, lastName) {
          if (err) {
            throw err;
          } else {
            result.lastName = lastName;
            resolve(result);
          }
        });
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  static executeShouldAlwaysDoesAlways(urlParams, queryParams) {
    return new Promise(function (resolve) {
      var result = {
        personId: urlParams.personId,
        homeState: queryParams.homeState
      };

      let proxy = StatelessEs6Proxy;

      let promise1 = proxy.getFirstName(urlParams.personId, queryParams.homeState),
        promise2 = proxy.getFirstName(urlParams.personId, queryParams.homeState),
        promise3 = proxy.getFirstName(urlParams.personId, queryParams.homeState);

      Promise.all([promise1, promise2, promise3]).then(function (firstNames) {

        let middleName1 = proxy.getMiddleName(urlParams.personId, firstNames[0]),
          middleName2 = proxy.getMiddleName(urlParams.personId, firstNames[1]),
          middleName3 = proxy.getMiddleName(urlParams.personId, firstNames[2]);

        function callback3(err, lastName) {
          if (err) {
            throw err;
          } else {
            result.lastName3 = lastName;
            resolve(result);
          }
        }

        function callback2(err, lastName) {
          if (err) {
            throw err;
          } else {
            result.lastName2 = lastName;
            proxy.getLastName(urlParams.personId, firstNames[2], middleName3, callback3);
          }
        }

        function callback1(err, lastName) {
          if (err) {
            throw err;
          } else {
            result.lastName1 = lastName;
            proxy.getLastName(urlParams.personId, firstNames[1], middleName2, callback2);
          }
        }

        proxy.getLastName(urlParams.personId, firstNames[0], middleName1, callback1);
      });
    });
  }

  static executeEmptyActual() {
    return new Promise(function (resolve) {
      let proxy = StatelessEs6Proxy;

      proxy.getFirstName().then(function () {
        proxy.getMiddleName();
        proxy.getLastName(undefined, undefined, undefined, function () {
          resolve();
        });
      });

    });
  }

  static executeModifiyingContext() {
    return new Promise(function (resolve) {
      let proxy = StatelessEs6Proxy,
        context = {
          someValue1: 'first'
        };

      proxy.getFirstName(context).then(function () {
        context.someValue2 = 'second';
        return proxy.getFirstName(context);
      }).then(function () {
        context.someValue3 = 'third';
        return proxy.getFirstName(context);
      }).then(function () {
        resolve(context);
      });

    });
  }
}

module.exports = Service;
