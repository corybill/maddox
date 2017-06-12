"use strict";

class ReportProxy {

  static addNewReport(title, result) {
    process.maddox.currentReport[title] = result;
  }

}

module.exports = ReportProxy;
