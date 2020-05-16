const fs = require("fs");
const path = require("path");
const process = require("process");
const graphviz = require("graphviz");

function run(directory, config) {
  const dependencies = readDependencies(directory);
  filter(dependencies, config);
  createGraph(dependencies, config);
}

function createGraph(dependencies, config) {
  const g = graphviz.digraph("G");
  const highlight = config.highlight ? RegExp(config.highlight) : undefined;
  Object.keys(dependencies).forEach(function (key) {
    const options = {};
    if (highlight) options.style = highlight.test(key) ? "bold" : "dashed";
    const node = g.addNode(key, options);
    if (dependencies[key])
      dependencies[key].forEach(function (dependency) {
        g.addEdge(node, dependency);
      });
  });
  if (config.dot) console.log(g.to_dot());
  if (config.graphviz) g.setGraphVizPath(config.graphviz);
  g.output("png", config.output, (code, stdout, stderr) => {
    console.error(`Error: ${code} ${stdout} ${stderr}`);
  });
}

function filter(dependencies, config) {
  const keys = Object.keys(dependencies);
  const include = config.include ? RegExp(config.include) : undefined;
  const exclude = config.exclude ? RegExp(config.exclude) : undefined;
  function wanted(key) {
    if (!keys.includes(key)) return false;
    if (include && !include.test(key)) return false;
    if (exclude && exclude.test(key)) return false;
    return true;
  }
  keys.forEach(function (key) {
    if (!wanted(key)) {
      delete dependencies[key];
    } else if (dependencies[key]) {
      dependencies[key] = dependencies[key].filter(wanted);
    }
  });
}

function readDependencies(directory) {
  const workspaces = readWorkspaces(directory);
  const result = {};
  workspaces.forEach(function (workspace) {
    const wildcard = path.resolve(directory, workspace);
    if (!wildcard.endsWith("/*") && !wildcard.endsWith("\\*")) {
      error(`Expected workspace to end with '/*'`);
    }
    const subdirectory = wildcard.substring(0, wildcard.length - 2);
    const packages = fs
      .readdirSync(subdirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    packages.forEach(function (package) {
      const packageJson = readPackage(path.join(subdirectory, package));
      result[package] = packageJson.dependencies ? Object.keys(packageJson.dependencies) : undefined;
    });
  });
  return result;
}

function readWorkspaces(directory) {
  // read `workspaces` from package.json
  const package = readPackage(directory);
  if (package.workspaces) {
    return package.workspaces;
  }
  // else read `packages` from lerna.json
  const lerna = readPackage(directory);
  if ((lerna.packages, "lerna.json")) {
    return lerna.packages;
  }
  error(`Expected the package.json file in the root directory to contain a 'workspaces' property,
  or the lerna.json file in the root directory to contain a 'packages' property`);
}

function readPackage(directory, file = "package.json") {
  const filename = path.resolve(directory, "package.json");
  const json = fs.readFileSync(filename, { encoding: "utf8" });
  return JSON.parse(json);
}

function error(msg) {
  console.error(msg);
  process.exit(1);
}

module.exports = (directory, config) => run(directory, config);
