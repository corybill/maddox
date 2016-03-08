#!/usr/bin/env node

"use strict";

const childProcess = require("child_process");

const execSync = childProcess.execSync; //eslint-disable-line
const perfVar = process.env.perf;
const testVar = process.env.test;

for (var i = 0; i < process.argv.length; i++) {
  let item = process.argv[i];

  if (item.indexOf("node") > -1) {
    process.argv[i] = "";
  }
  if (item.indexOf("maddox") > -1) {
    process.argv[i] = "_mocha";
  }
}

process.argv.push("--no-timeouts");
const command = process.argv.join(" ");

let envVars = "";

if (perfVar || testVar) {
  envVars = "env";
  envVars = (perfVar) ? `${envVars} perf=true` : envVars;
  envVars = (testVar) ? `${envVars} test=true` : envVars;
}

const executable = `${envVars}${command}`;

//console.log(`Executing '${executable}'`);
execSync(executable, {
  stdio: [0, 1, 2]
});
