"use strict";

const CoreUtilIs = require("core-util-is");

class ShouldUseSubset {
  static assert(mockedFunction, actualResultIndex, expectedParamResult) {
    return mockedFunction.shouldBeCalledWithSubsetUsedAtIndex[actualResultIndex] === true &&
      (CoreUtilIs.isArray(expectedParamResult) || CoreUtilIs.isObject(expectedParamResult));
  }
}

module.exports = ShouldUseSubset;
