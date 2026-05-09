import Preconditions from 'preconditions';
import uuid from 'uuid';
import testConstants from '../../../test-constants.js';
import StatefulFactoryProxy from '../../proxies/stateful-factory-proxy.js';
import StatefulSingletonProxy from '../../proxies/stateful-singleton-proxy.js';
import StatelessEs6Proxy from '../../proxies/stateless-es6-proxy.js';
import StatelessPreEs6SingletonProxy from '../../proxies/stateless-pre-es6-singleton-proxy.js';
import StatelessPreEs6StaticProxy from '../../proxies/stateless-pre-es6-static-proxy.js';

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

    if (urlParams.personId === testConstants.ForceTestFailure) {
      throw new Error(testConstants.ForceTestFailure);
    }

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
    return Promise.resolve();
  }

  static returnNativePromise() {
    return Promise.resolve();
  }
}

export default Controller;
