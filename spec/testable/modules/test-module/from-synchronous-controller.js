"use strict";

const Preconditions = require("preconditions"),
  BluebirdPromise = require("bluebird"),
  uuid = require("node-uuid");

const testConstants = require("../../../test-constants"),
  StatefulFactoryProxy = require("../../proxies/stateful-factory-proxy"),
  StatefulSingletonProxy = require("../../proxies/stateful-singleton-proxy"),
  StatelessEs6Proxy = require("../../proxies/stateless-es6-proxy"),
  StatelessPreEs6SingletonProxy = require("../../proxies/stateless-pre-es6-singleton-proxy"),
  StatelessPreEs6StaticProxy = require("../../proxies/stateless-pre-es6-static-proxy");

const preconditions = Preconditions.singleton();

class Controller {

  static noProxies(urlParams, queryParams) {
    preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

    var result = {
      personId: urlParams.personId,
      homeState: queryParams.homeState
    };

    return result;
  }

  static statefulFactoryProxy(urlParams, queryParams) {
    // NOTE: Ordering matters when using a stateful proxy like a factory function.  You must call the mocked function
    // within the flow of code execution to allow Maddox the opportunity to generate mocks.

    preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

    let proxy = StatefulFactoryProxy.factory(),
      firstName = uuid.v4(),
      middleNameA = proxy.getMiddleName(urlParams.personId, firstName),
      middleNameB = proxy.getMiddleName(urlParams.personId, middleNameA);

    var result = {
      personId: `${urlParams.personId}_${middleNameB}`,
      homeState: queryParams.homeState
    };

    return result;
  }

  static statefulSingletonProxy(urlParams, queryParams) {
    // NOTE: Ordering matters when using a stateful proxy like a factory function.  You must call the mocked function
    // within the flow of code execution to allow Maddox the opportunity to generate mocks.

    preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

    let proxy = StatefulSingletonProxy.getInstance(), // e.g. Must call mocked function with the flow of code
      firstName = uuid.v4(),
      middleNameA = proxy.getMiddleName(urlParams.personId, firstName),
      middleNameB = proxy.getMiddleName(urlParams.personId, middleNameA);

    var result = {
      personId: `${urlParams.personId}_${middleNameB}`,
      homeState: queryParams.homeState
    };

    return result;
  }

  static statelessEs6Proxy(urlParams, queryParams) {
    preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

    let proxy = StatelessEs6Proxy,
      firstName = uuid.v4(),
      middleNameA = proxy.getMiddleName(urlParams.personId, firstName),
      middleNameB = proxy.getMiddleName(urlParams.personId, middleNameA);

    var result = {
      personId: `${urlParams.personId}_${middleNameB}`,
      homeState: queryParams.homeState
    };

    return result;
  }

  static statelessPreEs6SingletonProxy(urlParams, queryParams) {
    preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

    let proxy = StatelessPreEs6SingletonProxy,
      firstName = uuid.v4(),
      middleNameA = proxy.getMiddleName(urlParams.personId, firstName),
      middleNameB = proxy.getMiddleName(urlParams.personId, middleNameA);

    var result = {
      personId: `${urlParams.personId}_${middleNameB}`,
      homeState: queryParams.homeState
    };

    return result;
  }

  static statelessPreEs6StaticProxy(urlParams, queryParams) {
    preconditions.shouldBeDefined(urlParams.personId, testConstants.MissingPersonIdParam);

    let proxy = StatelessPreEs6StaticProxy,
      firstName = uuid.v4(),
      middleNameA = proxy.getMiddleName(urlParams.personId, firstName),
      middleNameB = proxy.getMiddleName(urlParams.personId, middleNameA);

    var result = {
      personId: `${urlParams.personId}_${middleNameB}`,
      homeState: queryParams.homeState
    };

    return result;
  }

  static returnBluebirdPromise() {
    return BluebirdPromise.resolve();
  }

  static returnNativePromise() {
    return Promise.resolve();
  }
}

module.exports = Controller;
