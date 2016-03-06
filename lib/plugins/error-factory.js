"use strict";

var util = require("util");

class ErrorFactory {
  static build(errorContext, params) {
    let prefix = `${errorContext.type.prefix} (${errorContext.code}): `;

    let formatParams = (params) ? [prefix + errorContext.message].concat(params) : [prefix + errorContext.message];

    return util.format.apply(this, formatParams);
  }
}

module.exports = ErrorFactory;
