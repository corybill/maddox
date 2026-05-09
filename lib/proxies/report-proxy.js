class ReportProxy {
  static addNewReport(title, result) {
    process.maddox.currentReport[title] = result;
  }
}

export default ReportProxy;
