"use strict";

const HttpReqScenario = require("./scenarios/functional/http-req-scenario"),
  FromSynchronousScenario = require("./scenarios/functional/from-synchronous-scenario");

module.exports = {
  functional: {
    HttpReqScenario: HttpReqScenario,
    FromSynchronousScenario: FromSynchronousScenario
  },
  performance: {},
  constants: {
    EmptyParameters: [],
    EmptyResult: {}
  }
};
