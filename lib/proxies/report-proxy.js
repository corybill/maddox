"use strict";

class ReportProxy {

  static addNewReport(title, result) {
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

    process.maddox.currentReport[title] = context;
  }

}

module.exports = ReportProxy;
