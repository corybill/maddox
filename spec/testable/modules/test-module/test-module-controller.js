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

}

module.exports = Controller;
