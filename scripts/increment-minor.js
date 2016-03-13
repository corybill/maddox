"use strict";

const semver = require("semver"),
  fs = require("fs-extra"); // eslint-disable-line

const packageJsonDir = __dirname + "/../package.json";
const packageJson = fs.readJsonSync(packageJsonDir); // eslint-disable-line

const newVersion = semver.inc(packageJson.version, "minor");

packageJson.version = newVersion;
fs.writeJsonSync(packageJsonDir, packageJson); // eslint-disable-line