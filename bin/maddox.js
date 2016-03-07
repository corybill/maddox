"use strict";

const childProcess = require("child_process");

const execSync = childProcess.execSync;
const runPerf = process.env.perf || "";

process.argv[0] = "";
process.argv[1] = "_mocha";
const command = process.argv.join(" ");

const executable = `${runPerf}${command}`;

console.log(`Executing '${executable}'`);
execSync(executable, {
  stdio: [0, 1, 2]
});
