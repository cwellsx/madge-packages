#!/usr/bin/env node
"use strict";

const program = require("commander");
const process = require("process");

program
  .version("0.1.0")
  .usage("[options] <directory>")
  .option("-d, --dot", "print the dot file to stdout", false)
  .option("-x, --exclude <regexp>", "exclude packages using RegExp")
  .option("-i, --include <regexp>", "include packages using RegExp")
  .option("-h, --highlight <regexp>", "highlight packages using RegExp")
  .option("-o, --output <filename>", "output filename (PNG format)", "madge-packages.png")
  .option("-g, --graphviz <directory>", "GraphViz path (if not in your path)")
  .parse(process.argv);

if (!program.args.length) {
  console.log(program.helpInformation());
  process.exit(1);
}

if (program.args.length !== 1) {
  console.error("You can only specify one directory as a command-line argument");
  process.exit(1);
}

const run = require("./index");
run(program.args[0], program);
