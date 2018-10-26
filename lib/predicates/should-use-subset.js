"use strict";

const CoreUtilIs = require("core-util-is");

class ShouldUseSubset {
  static assert(mockedFunction, actualResultIndex, actualParamResult) {
    return mockedFunction.shouldBeCalledWithSubsetUsedAtIndex[actualResultIndex] === true &&
      (CoreUtilIs.isArray(actualParamResult) || CoreUtilIs.isObject(actualParamResult) || CoreUtilIs.isString(actualParamResult));
  }
}

module.exports = ShouldUseSubset;
