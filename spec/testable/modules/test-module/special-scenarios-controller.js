"use strict";

const Service = require("./test-module-service");

class Controller {

  static shouldAlwaysDoesAlways(req, res) {
    Service.executeShouldAlwaysDoesAlways(req.params, req.query).then(function (result) {
      res.status(200).send(result);

    }).catch(function (err) {
      res.status(404).send(err.message);

    });
  }

  static emptyActual(req, res) {
    Service.executeEmptyActual().then(function () {
      res.status(200).send();

    }).catch(function (err) {
      res.status(404).send(err.message);

    });
  }

  static modifyingContext(req, res) {
    Service.executeModifiyingContext().then(function (context) {
      res.status(200).send(context);

    }).catch(function (err) {
      res.status(404).send(err.message);

    });
  }
}

module.exports = Controller;
