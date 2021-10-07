
const HttpReqScenario = require('./scenarios/http-req-scenario'),
  FromPromiseScenario = require('./scenarios/from-promise-scenario'),
  FromCallbackScenario = require('./scenarios/from-callback-scenario'),
  FromSynchronousScenario = require('./scenarios/from-synchronous-scenario');

const constants = require('./constants');
const Mocha = require('./proxies/mocha-proxy');

module.exports = {
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
