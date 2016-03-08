"use strict";

const HttpReqScenario = require("./scenarios/functional/http-req-scenario"),
  FromPromiseScenario = require("./scenarios/functional/from-promise-scenario"),
  FromCallbackScenario = require("./scenarios/functional/from-callback-scenario"),
  FromSynchronousScenario = require("./scenarios/functional/from-synchronous-scenario");

module.exports = {
  functional: {
    HttpReqScenario: HttpReqScenario,
    FromPromiseScenario: FromPromiseScenario,
    FromCallbackScenario: FromCallbackScenario,
    FromSynchronousScenario: FromSynchronousScenario
  },
  performance: {},
  constants: {
    EmptyParameters: [],
    EmptyResult: {}
  }
};
