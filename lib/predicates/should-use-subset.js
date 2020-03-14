"use strict";

const CoreUtilIs = require("core-util-is");

class ShouldUseSubset {
  static assert(mockedFunction, actualResultIndex, actualParamResult, expectedResultsAlwaysWithSubset) {
    return (mockedFunction.shouldBeCalledWithSubsetUsedAtIndex[actualResultIndex] === true || expectedResultsAlwaysWithSubset === true) &&
      (CoreUtilIs.isArray(actualParamResult) || CoreUtilIs.isObject(actualParamResult) || CoreUtilIs.isString(actualParamResult));
  }
}

module.exports = ShouldUseSubset;
