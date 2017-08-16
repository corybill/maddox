"use strict";

const Service = require("./test-module-service");

class Controller {

  static noProxies(req, res) {
    Service.executeWithNoProxies(req.params, req.query).then(function (result) {
      res.status(200).send(result);

    }).catch(function (err) {
      res.status(404).send(err.message);

    });
  }

  static statefulFactoryProxy(req, res) {
    Service.executeWithStatefulFactoryProxy(req.params, req.query).then(function (result) {
      res.status(200).send(result);

    }).catch(function (err) {
      res.status(404).send(err.message);

    });
  }

  static statefulSingletonProxy(req, res) {
    Service.executeWithStatefulSingletonProxy(req.params, req.query).then(function (result) {
      res.status(200).send(result);

    }).catch(function (err) {
      res.status(404).send(err.message);

    });
  }

  static statelessEs6Proxy(req, res) {
    Service.executeWithStatelessEs6Proxy(req.params, req.query).then(function (result) {
      res.status(200).send(result);

    }).catch(function (err) {
      res.status(404).send(err.message);

    });
  }

  static statelessPreEs6SingletonProxy(req, res) {
    Service.executeWithStatelessPreEs6SingletonProxy(req.params, req.query).then(function (result) {
      res.status(200).send(result);

    }).catch(function (err) {
      res.status(404).send(err.message);

    });
  }

  static statelessPreEs6StaticProxy(req, res) {
    Service.executeWithStatelessPreEs6StaticProxy(req.params, req.query).then(function (result) {
      res.status(200).send(result);

    }).catch(function (err) {
      res.status(404).send(err.message);

    });
  }

  static initiateAsyncProcessing(req, res) {
    setTimeout(() => {
      Service.executeWithStatefulSingletonProxy(req.params, req.query);
    }, 10);

    res.status(200).send({result: "OK"});
  }

  static specialResponseFunctionality(req, res) {
    Service.executeWithStatefulSingletonProxy(req.params, req.query).then(function (result) {
      res.set("someHeader1", result.personId);
      res.set("someHeader2", result.homeState);
      res.fakeHeaderFunction("someHeader3", result.homeState);

      const someHeaderResponse1 = res.someResFunction(result.lastName);
      const someHeaderResponse2 = res.someResFunction(result.lastName);

      result.someHeaderResponse1 = someHeaderResponse1;
      result.someHeaderResponse2 = someHeaderResponse2;

      res.status(200).send(result);

    }).catch(function (err) {
      res.status(404).send(err.message);

    });
  }
}

module.exports = Controller;
