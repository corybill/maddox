import HttpReqScenario from './scenarios/http-req-scenario.js';
import FromPromiseScenario from './scenarios/from-promise-scenario.js';
import FromCallbackScenario from './scenarios/from-callback-scenario.js';
import FromSynchronousScenario from './scenarios/from-synchronous-scenario.js';
import constants from './constants.js';
import Mocha from './proxies/mocha-proxy.js';

export default {
  functional: {
    HttpReqScenario: HttpReqScenario,
    FromPromiseScenario: FromPromiseScenario,
    FromCallbackScenario: FromCallbackScenario,
    FromSynchronousScenario: FromSynchronousScenario
  },
  scenarios: {
    HttpReqScenario: HttpReqScenario,
    FromPromiseScenario: FromPromiseScenario,
    FromCallbackScenario: FromCallbackScenario,
    FromSynchronousScenario: FromSynchronousScenario
  },
  constants: {
    EmptyParameters: [],
    EmptyResult: {},
    IgnoreParam: constants.IgnoreParam
  },
  compare: Mocha
};
