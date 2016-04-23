"use strict";

const Preconditions = require("preconditions"),
  _ = require("lodash"),
  Benchmark = require("benchmark"),
  Promise = require("bluebird");

const Scenario = require("./../scenario"),
  BenchWriterProxy = require("../../proxies/bench-writer-proxy"),
  Mock = require("../../mocks/mock"),
  ErrorFactory = require("../../plugins/error-factory"),
  constants = require("../../constants");

const preconditions = Preconditions.errr();

class HttpReqScenario extends Scenario {
  constructor(done) {
    super(done);

    this.HttpResponseMock = {};
    this._finishedHasBeenSet_ = false;
  }

  // TODO: resDoesError / resDoesReturn

  resShouldBeCalledWith(funcName, params) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithFunctionString))
      .debug({funcName: funcName}).test();
    preconditions.shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithParamsArray))
      .debug({params: params}).test();

    this.HttpResponseMock[funcName] = this.HttpResponseMock[funcName] || function () {};
    this._mock_.mockThisFunctionAtMostOnce(constants.ResponseMockName, funcName, this.HttpResponseMock);
    this._mock_.shouldBeCalledWith(constants.ResponseMockName, funcName, params);

    if (constants.ResponseEndFunctions[funcName]) {
      preconditions.checkArgument(!this._finishedHasBeenSet_, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher))
        .debug({finishedHasBeenSet: this._finishedHasBeenSet_, responseFinishers: _.keys(constants.ResponseEndFunctions)}).test();

      this._finishedHasBeenSet_ = true;
      this._mock_.setResponseEndFunction(constants.ResponseMockName, funcName);
      this._mock_.doesReturn(constants.ResponseMockName, funcName, this.HttpResponseMock, Mock.SynchronousType, false);
    }

    return this;
  }

  resDoesReturnSelf(funcName) {
    this._mock_.mockThisFunctionAtMostOnce(constants.ResponseMockName, funcName, this.HttpResponseMock);
    this._mock_.doesReturn(constants.ResponseMockName, funcName, this.HttpResponseMock, Mock.SynchronousType, false);
    return this;
  }

  test(done) {
    this.validate(done);

    preconditions.shouldBeDefined(this._inputParams_, ErrorFactory.build(constants.errorMessages.HttpReqUndefined))
      .debug({inputParams: this._inputParams_}).test();
    preconditions.checkArgument(this._finishedHasBeenSet_, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher))
      .debug({responseFinishers: _.keys(constants.ResponseEndFunctions)}).test();

    this._executeFunctionalTest_().then(function () {
      this._resetScenario_();
      return this._executePerfTest_();

    }.bind(this)).then(function () {
      this._restoreMocks_();
      done();

    }.bind(this)).catch(function (err) {
      this._restoreMocks_();
      done(err);

    }.bind(this));
  }

  _executeFunctionalTest_() {
    return new Promise(function (resolve, reject) {
      if (this._shouldExecuteFunctionalTest_()) {
        this._executeTest_().then(function () {
          this._mock_.test();
          resolve();
        }.bind(this)).catch(function (err) {

          reject(err);
        });

      } else {
        resolve();
      }
    }.bind(this));
  }

  _executePerfTest_() {
    return new Promise(function (resolve) {
      if (this._shouldExecutePerformanceTest_()) {
        let suite = new Benchmark.Suite();

        suite.add(this._perfTitle_, {
          defer: true,
          fn: function (deferred) {

            this._mock_.setCallbackForResponseEnd(function () {
              this._resetScenario_();
              deferred.resolve();
            }.bind(this));

            this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
          }.bind(this)

        }).on("complete", function (result) {
          let report = BenchWriterProxy.getReport();

          HttpReqScenario._addBenchResult_(this._perfTitle_, report, result);
          BenchWriterProxy.saveReport(report);

          resolve();
        }.bind(this)).run();
      } else {
        resolve();
      }
    }.bind(this));
  }

  _executeTest_() {
    return new Promise((resolve) => {
      this._mock_.setCallbackForResponseEnd(resolve);

      this._inputParams_.push(this.HttpResponseMock);

      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
    });
  }

  static _addBenchResult_(title, report, result) {
    let context = {
      date: new Date(),
      marginOfError: result.currentTarget["0"].stats.moe,
      relativeMarginOfError: result.currentTarget["0"].stats.rme,
      standardErrorOfTheMean: result.currentTarget["0"].stats.sem,
      standardDeviation: result.currentTarget["0"].stats.deviation,
      mean: result.currentTarget["0"].stats.mean,
      variance: result.currentTarget["0"].stats.variance,
      executionsPerSecond: result.currentTarget["0"].hz
    };

    if (!report[title]) {
      report[title] = {
        results: []
      };
    }

    // Only allow MaxResults.
    let overMaxResults = report[title].results.length - constants.defaults.MaxPerfResults + 1;

    for (let i = overMaxResults; i > 0; i--) {
      report[title].results.shift();
    }

    // Add new context.
    report[title].results.push(context);
  }
}

module.exports = HttpReqScenario;
