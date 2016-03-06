"use strict";

const Chance = require("chance"),
  _ = require("lodash");

var contexts = require("./test-constants").contexts;
var chance = new Chance();

module.exports = {
  uniqueId: function () {
    return chance.hash({length: 24});
  },
  zip: function () {
    return chance.zip();
  },
  firstName: function () {
    return chance.first();
  },
  lastName: function () {
    return chance.last();
  },
  word: function (len) {
    return chance.word({length: len || 5});
  },
  sentence: function (len) {
    return chance.sentence({words: len || 5});
  },
  context: function () {
    var contextKeys = _.keys(contexts);
    var index = chance.integer({min: 0, max: (contextKeys.length - 1)});

    return contexts[contextKeys[index]];
  },
  date: function () {
    return chance.date();
  }
};
