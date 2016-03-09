"use strict";

const fs = require("fs-extra"), // eslint-disable-line
  path = require("path");

const constants = require("../constants");

class BenchWriterProxy {
  static getReport(filePath) {
    let report;

    filePath = path.resolve(__dirname, filePath || constants.defaults.DefaultReportPath);

    if (!BenchWriterProxy._existsSync_(filePath)) { // eslint-disable-line
      fs.outputJsonSync(filePath, {}); // eslint-disable-line
      report = {};
    } else {
      report = fs.readJsonSync(filePath); // eslint-disable-line
    }

    return report;
  }

  static saveReport(report, filePath) {
    filePath = path.resolve(__dirname, filePath || constants.defaults.DefaultReportPath);
    fs.writeJsonSync(filePath, report); // eslint-disable-line
  }

  static _existsSync_(filePath) {
    try {
      fs.accessSync(filePath, fs.R_OK | fs.W_OK); // eslint-disable-line
      return true;
    } catch (err) {
      return false;
    }
  }
}

module.exports = BenchWriterProxy;
