#!/usr/bin/env node

"use strict";

/* eslint-disable */

const Mocha = require("mocha"),
  Promise = require("bluebird"),
  ArgParse = require("argparse"),
  fs = require("fs-extra"),
  path = require("path");

const SimpleStatistics = require("simple-statistics");

const ZScore2 = 2;
const MaddoxCliVersion = "1.0.0";

class State {

  setArguments(args) {this._arguments_ = args;}
  setPerfFile(perfFilePath) {this._perfFilePath_ = perfFilePath;}
  setPerfDirectory(perfDirectory) {this._perfDirectory_ = perfDirectory;}
  setMocha(mocha) {this._mocha_ = mocha;}
  setCurrentResults(currentResults) {this._currentResults_ = currentResults;}
  setExistingResults(existingResults) {this._existingResults_ = existingResults;}
  setCombinedResults(combinedResults) {this._combinedResults_ = combinedResults;}
  setError(error) {this._error_ = error;}

  getArguments() {return this._arguments_;}
  getPerfFilePath() {return this._perfFilePath_;}
  getPerfDirectoryPath() {return this._perfDirectory_;}
  getMocha() {return this._mocha_;}
  getCurrentResults() {return this._currentResults_;}
  getExistingResults() {return this._existingResults_;}
  getCombinedResults() {return this._combinedResults_;}
  getError() {return this._error_;}

  accept(step) {
    return Promise.try(() => {
      return step.next(this)
    });
  }
}

class PrepareArguments {
  static next(state) {
    const ArgumentParser = ArgParse.ArgumentParser;
    const parser = new ArgumentParser({
      version: MaddoxCliVersion,
      addHelp: true,
      formatterClass: ArgParse.ArgumentDefaultsHelpFormatter,
      description: "Maddox CLI runs performance tests on Maddox BDD tests that are marked with the .perf() function."
    });

    parser.addArgument([ "-t", "--TIMEOUT" ], {help: "How long a test has (ms) to finish before timing out.", defaultValue: 30000, type: "int"});
    parser.addArgument([ "-u", "--UI" ], {help: "Specify user-interface (bdd|tdd|qunit|exports).", defaultValue: "bdd"});
    parser.addArgument([ "-p", "--PRINT" ], {help: "Print all num requests per second.", nargs: "0"});
    parser.addArgument([ "-P", "--PRINT_ALL" ], {help: "Print all saved statistics.", nargs: "0"});
    parser.addArgument([ "-m", "--MAX_RESULTS" ], {help: "Only keep this many historical results. Will delete results of the number is less than current count.", defaultValue: 10, type: "int"});
    parser.addArgument([ "-n", "--DO_NOT_SAVE_RESULTS" ], {help: "Do NOT save results of this run.", nargs: "0"});
    parser.addArgument([ "-d", "--TEST_DIR" ], {help: "Save results of this run.", required: true, nargs: "*"});
    parser.addArgument([ "-r", "--REMOVE_EXISTING" ], {help: "Remove all existing results.", nargs: "0"});
    parser.addArgument([ "-s", "--NUM_SAMPLES" ], {help: "How many times to run the perf test.", defaultValue: 20, type: "int"});
    parser.addArgument([ "-l", "--SAMPLE_LENGTH" ], {help: "The length (in millis) to run each individual perf test.", defaultValue: 1000, type: "int"});
    parser.addArgument([ "-c", "--NUM_CONCURRENT" ], {help: "How many samples to run concurrently.", defaultValue: 20, type: "int"});
    parser.addArgument([ "-o", "--ONLY_95" ], {help: "Remove all existing results that are not with 95th percentile. WARNING: Don't use with small samples sizes or if you have changed your code.", nargs: "0"});

    const args = parser.parseArgs();

    // SET TIMEOUT TO BE 50% GREATER THAN EXPECTED TIME TO FINISH ONE TEST TO ENSURE WE DON'T TIMEOUT.
    args.TIMEOUT = args.NUM_SAMPLES * args.SAMPLE_LENGTH * 1.50;

    state.setArguments(args);
  }
}

class SetProcessValues {
  static next(state) {
    const args = state.getArguments();

    process.maddox = {
      perf: true,
      numSamples: args.NUM_SAMPLES,
      sampleLength: args.SAMPLE_LENGTH,
      numConcurrent: args.NUM_CONCURRENT,
      currentReport: {}
    };
  }
}

class SetPerfFile {
  static next(state) {
    const perfDirectory = `${process.cwd()}/maddox`;
    const perfFilePath = `${perfDirectory}/perf-report.json`;

    state.setPerfDirectory(perfDirectory);
    state.setPerfFile(perfFilePath);
  }
}

class CreateMochaInstance {
  static next(state) {
    const args = state.getArguments();
    const mocha = new Mocha({timeout: args.TIMEOUT, ui: args.UI, slow: args.TIMEOUT});

    state.setMocha(mocha);
  }
}

class AddTestFilesToMocha {
  static next(state) {
    const mocha = state.getMocha();
    const args = state.getArguments();
    const providedTestDirs = args.TEST_DIR;


    for (const providedTestDir of providedTestDirs) {
      const actualTestDir = (providedTestDir.startsWith("/")) ? providedTestDir : `${process.cwd()}/${providedTestDir}`;

      fs.readdirSync(actualTestDir).forEach((file) => {
        if (file.endsWith(".js")) {
          mocha.addFile(path.join(actualTestDir, file));
        }
      });
    }
  }
}

class ExecuteTests {
  static next(state) {
    return new Promise((resolve, reject) => {
      const mocha = state.getMocha();

      mocha.run((failures) => {
        if (failures) {
          reject();
        } else {
          state.setCurrentResults(process.maddox.currentReport);
          resolve();
        }
      });
    });
  }
}

class PrepareExistingFile {
  static next(state) {
    const perfFilePath = state.getPerfFilePath();
    const perfDirectory = state.getPerfDirectoryPath();

    fs.ensureDirSync(perfDirectory);

    try {
      fs.accessSync(perfFilePath, fs.R_OK | fs.W_OK);
    } catch (err) {
      fs.writeJsonSync(perfFilePath, Factory.newResultBlock());
    }
  }
}

class GetExistingResults {
  static next(state) {
    const perfFilePath = state.getPerfFilePath();

    try {
      const existingResults = fs.readJsonSync(perfFilePath);

      state.setExistingResults(existingResults);
    } catch (err) {
      throw new Error(`Historical performance file is corrupted. Must be valid JSON. See ${perfFilePath}`);
    }
  }
}

class CombineResults {
  static next(state) {
    const currentResults = state.getCurrentResults();
    const existingResults = state.getExistingResults();
    const args = state.getArguments();

    let combinedResults = (args.REMOVE_EXISTING !== null) ?
      Factory.newResultBlock() : JSON.parse(JSON.stringify(existingResults, null, 2));

    function dropOld(array, maxResults) {
      // Drop old results if we have hit or gone over max results.
      for (let i = array.length; i > maxResults; i--) {
        array.pop();
      }

      return array;
    }

    function processNewStats() {
      for (const title in currentResults) {
        if (!combinedResults.allStats[title]) {
          combinedResults.allStats[title] = Factory.newStatsBlock();
        }

        // Add current results.
        combinedResults.allStats[title].statistics.unshift(currentResults[title]);

        combinedResults.allStats[title].statistics = dropOld(combinedResults.allStats[title].statistics, args.MAX_RESULTS);
      }

      return combinedResults;
    }

    function processMinStats() {
      for (const title in combinedResults.allStats) {
        if (!combinedResults.minStats[title]) {
          combinedResults.minStats[title] = Factory.newMinStatsBlock();
        }

        combinedResults.minStats[title].numPerSecond = combinedResults.allStats[title].statistics.map((stat) => {
          return stat.numPerSecond.median;
        });

        const cov = Math.round(combinedResults.minStats[title].totals.sd / combinedResults.minStats[title].totals.mean * 100 * 100) / 100;
        combinedResults.minStats[title].totals.mean = SimpleStatistics.mean(combinedResults.minStats[title].numPerSecond);
        combinedResults.minStats[title].totals.sd = SimpleStatistics.standardDeviation(combinedResults.minStats[title].numPerSecond);
        combinedResults.minStats[title].totals.cov = `${cov}%`;

        combinedResults.allStats[title].totals = combinedResults.minStats[title].totals;
      }

      return combinedResults;
    }

    combinedResults = processNewStats();
    combinedResults = processMinStats();

    state.setCombinedResults(combinedResults);
  }
}

class Only95 {
  static next(state) {
    const args = state.getArguments();
    const combinedResults = state.getCombinedResults();

    if (args.ONLY_95 !== null) {
      for (const title in combinedResults.minStats) {
        const filteredMin = [];
        const filteredAll = [];

        const newMean = combinedResults.minStats[title].newMean;
        const newSd = combinedResults.minStats[title].newSd;

        const allowableZScore = newSd * ZScore2;

        const minAllowed = newMean - allowableZScore;
        const maxAllowed = newMean + allowableZScore;

        for (let i = 0; i < combinedResults.minStats[title].numPerSecond.length; i++) {
          const currentValue = combinedResults.minStats[title].numPerSecond[i];

          if (currentValue >= minAllowed && currentValue <= maxAllowed) {
            filteredMin.push(combinedResults.minStats[title].numPerSecond[i]);
            filteredAll.push(combinedResults.allStats[title].statistics[i]);
          }
        }

        combinedResults.minStats[title].numPerSecond = filteredMin;
        combinedResults.allStats[title].statistics = filteredAll;
      }

      state.setCombinedResults(combinedResults);
    }

  }
}

class SaveResults {
  static next(state) {
    const combinedResults = state.getCombinedResults();
    const args = state.getArguments();
    const perfFilePath = state.getPerfFilePath();

    if (args.DO_NOT_SAVE_RESULTS === null) {
      fs.writeJsonSync(perfFilePath, combinedResults);

      console.log(`Successfully saved combined results to ${perfFilePath}`);
    }
  }
}

class PrintTestResults {
  static next(state) {
    const args = state.getArguments();
    const combinedResults = state.getCombinedResults();

    const printedResults = {};

    if (args.PRINT !== null) {printedResults.minStats = combinedResults.minStats;}

    if (args.PRINT_ALL !== null) {printedResults.allStats = combinedResults.allStats;}

    if (args.PRINT !== null || args.PRINT_ALL !== null) {
      console.log("********** Start Printed Results **********");
      console.log(JSON.stringify(printedResults, null, 2));
      console.log("********** End Printed Results **********");
      console.log();
    }
  }
}

class SuccessResponse {
  static next() {
    console.log("Finished Successfully");
  }
}

class FailureResponse {
  static next(state) {
    const error = state.getError();

    console.error(error.stack);

    process.exit(1);
  }
}

class Factory {
  static newResultBlock() {
    return {
      minStats: {},
      allStats: {}
    };
  }

  static newStatsBlock() {
    return {
      statistics: []
    }
  }

  static newMinStatsBlock() {
    return {
      numPerSecond: [],
      totals: {}
    }
  }
}

class Runner {
  static run() {
    const state = new State();

    state.accept(PrepareArguments)
      .then(() => state.accept(SetProcessValues))
      .then(() => state.accept(SetPerfFile))
      .then(() => state.accept(CreateMochaInstance))
      .then(() => state.accept(AddTestFilesToMocha))
      .then(() => state.accept(ExecuteTests))
      .then(() => state.accept(PrepareExistingFile))
      .then(() => state.accept(GetExistingResults))
      .then(() => state.accept(CombineResults))
      .then(() => state.accept(Only95))
      .then(() => state.accept(SaveResults))
      .then(() => state.accept(PrintTestResults))
      .then(() => state.accept(SuccessResponse))
      .catch((err) => {
        err = err || new Error("Unknown Error. Was there a timeout?");
        state.setError(err);
        state.accept(FailureResponse)
      });
  }
}

Runner.run();