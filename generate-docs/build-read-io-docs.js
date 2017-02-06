"use strict";

/**
 * To execute this script, run 'npm run build-docs'.
 *
 * This script, when executed will generate a documentation structure used for 'maddox.readme.io'. It will adapt the jsdoc
 * structure into a markdown structure that can be copied and pasted into the 'maddox.readme.io' editor. Output from
 * this script will be in ./documentation.txt.
 */

const fs = require("fs");

class Text {
  static identify(line) {return line.startsWith("* ");}
  static parse(line) {return {type: "Text", value: line.substring(2)};}
  static condense(lines) {
    let comment = "";

    const newLines = [];

    lines.forEach((line) => {
      if (line.type === "Text") {
        if (comment === "") {
          comment = line.value;
        } else if (comment.endsWith("\n\n")) {
          comment = `${comment}${line.value}`;
        } else {
          comment = `${comment} ${line.value}`;
        }
      } else {
        newLines.push(line);
      }
    });

    newLines.push({type: "Text", value: comment});

    return newLines;
  }
}

class NewLineText {
  static identify(line) {return line.startsWith("*");}
  static parse() {return {type: "Text", value: "\n\n"};}
}

class Param {
  static identify(line) {return line.indexOf("@param") >= 0;}
  static parse(line) {
    const type = Param.getType(line);
    const name = Param.getName(line);
    const description = Param.getDescription(line);

    return {type: "Param", value: `* **${name}** *{${type}}* - ${description}`};
  }
  static getType(line) {return line.split("{")[1].split("}")[0];}
  static getName(line) {return line.split("} ")[1].split(" ")[0];}
  static getDescription(line) {return line.split("- ")[1];}
  static condense(lines) {
    lines = Param.condenseParamText(lines);
    lines = Param.condenseParams(lines);
    return lines;
  }
  static condenseParamText(lines) {
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].type === "Param") {

        for (let j = i + 1; j < lines.length; j++) {
          if (!lines[j] || lines[j].type === "Param" || lines[j].type === "Return") {
            break;
          } else if (lines[j].type !== "Param") {
            lines[i].value = `${lines[i].value} ${lines[j].value}`;
            lines[j].type = "Ignore";
          }
        }
        newLines.push(lines[i]);
      } else if (lines[i].type !== "Ignore") {
        newLines.push(lines[i]);
      }
    }

    return newLines;
  }
  static condenseParams(lines) {
    let params = "";

    const newLines = [];

    lines.forEach((line) => {
      if (line.type === "Param") {
        params = (params === "") ? line.value : `${params}\n${line.value}`;
      } else {
        newLines.push(line);
      }
    });

    newLines.push({type: "Param", value: params});
    return newLines;
  }
}

class Return {
  static identify(line) {return line.indexOf("@returns") >= 0;}
  static parse(line) {
    const split = line.split("returns")[1].trim();

    return {type: "Return", value: `* **returns** *${split}*`};
  }
}

class Factory {
  static getString(str) {
    if (Param.identify(str)) {
      return Param.parse(str);
    } else if (Return.identify(str)) {
      return Return.parse(str);
    } else if (Text.identify(str)) {
      return Text.parse(str);
    } else if (NewLineText.identify(str)) {
      return NewLineText.parse(str);
    } else {
      return str;
    }
  }
  static condense(lines) {
    lines = Param.condense(lines);
    lines = Text.condense(lines);
    return lines;
  }
}

const files = [
  "../lib/scenarios/scenario.js",
  "../lib/scenarios/functional/http-req-scenario.js",
  "../lib/proxies/mocha-proxy.js"
];

fs.writeFileSync(`${__dirname}/documentation.txt`, ""); // eslint.disable-line

files.forEach((filePath) => {
  const file = fs.readFileSync(`${__dirname}/${filePath}`, "utf8"); // eslint-disable-line

  let mapped = {};

  const arrayOfAllLines = file.split("/**")
    .map((frontComment) => frontComment.split("*/"));

  arrayOfAllLines.shift();

  arrayOfAllLines.forEach((item) => {
    let description = item[0]
      .split("\n")
      .map((line) => line.trim())
      .map((line) => Factory.getString(line));

    description.shift();
    description.pop();

    description = Factory.condense(description);

    const functionHeader = `##${item[1].split("\n  ")[1].split(" {")[0]}`;

    mapped[functionHeader] = {functionHeader, description};
  });

  let data = "";

  for (let header in mapped) {
    if (mapped.hasOwnProperty(header)) {
      data += `${mapped[header].functionHeader}\n${mapped[header].description[2].value}${mapped[header].description[1].value}\n${mapped[header].description[0].value}\n\n******************************************************\n\n`;
    }
  }

  fs.appendFileSync(`${__dirname}/documentation.txt`, data); // eslint.disable-line

});