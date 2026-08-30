/**
 * BanglaScript Node.js Register Hook
 * Enables direct require() of .bjs files in Node.js
 * 
 * Usage:
 * require('banglascript/register');
 * const myModule = require('./myModule.bjs');
 */

const fs = require("fs");
const path = require("path");
const { transpileWithSourceMap } = require("./transpile-ast");

function registerExtension() {
  if (require.extensions) {
    require.extensions[".bjs"] = function (module, filename) {
      const content = fs.readFileSync(filename, "utf8");
      const { code } = transpileWithSourceMap(content, filename);
      module._compile(code, filename);
    };
  }
}

// Auto-register on require
registerExtension();

module.exports = { register: registerExtension };
