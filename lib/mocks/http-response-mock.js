"use strict";

var sinon = require("sinon");

class HttpResponse {
  header() {}
  charSet() {}
  cache() {}
  status() {}
  send() {}
  redirect() {}
  json() {}

  // Express specific res
  app() {}
  headersSent() {}
  locals() {}
  append() {}
  attachement() {}
  cookie() {}
  clearCookie() {}
  download() {}
  end() {}
  format() {}
  get() {}
  jsonp() {}
  links() {}
  location() {}
  render() {}
  sendFile() {}
  sendStatus() {}
  set() {}
  type() {}
  vary() {}
}

module.exports = HttpResponse;