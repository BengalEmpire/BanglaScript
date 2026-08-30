const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const { transpileWithSourceMap, KEYWORDS } = require("./transpile-ast");
const {
  getBanglaKeywords,
  validateBanglaScript,
  getCodeStats,
} = require("./translate-words");
const { transformSync } = require("@babel/core");
const { basicExample, webExample, htmlTemplate, cssTemplate } = require("./exampleCodes");
const pkg = require("../package.json");

function isBanglaScriptFile(filename) {
  return path.extname(filename).toLowerCase() === ".bjs";
}

function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      return true;
    }
    return false;
  } catch (err) {
    throw new Error(`Failed to create directory: ${dirPath}\n${err.message}`);
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath}\n${error.message}`);
  }
}

function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    ensureDir(dir);
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  } catch (error) {
    throw new Error(`Failed to write file: ${filePath}\n${error.message}`);
  }
}

function getOutputFilename(inputFile, outputDir = "build") {
  const basename = path.basename(inputFile, ".bjs");
  return path.join(outputDir, `${basename}.js`);
}

function getSourceMapFilename(inputFile, outputDir = "build") {
  const basename = path.basename(inputFile, ".bjs");
  return path.join(outputDir, `${basename}.js.map`);
}

function getColors() {
  return {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
  };
}

function formatError(error, context = {}) {
  const colors = getColors();
  let message = `${colors.red}❌ Error:${colors.reset}\n ${error.message}`;
  if (context.file) message += `\n File: ${context.file}`;
  if (context.line) message += `\n Line: ${context.line}`;
  if (error.stack && context.verbose)
    message += `\n\nStack trace:\n${error.stack}`;
  return message;
}

function formatSuccess(message, details = {}) {
  const colors = getColors();
  let msg = `${colors.green}✅ ${message}${colors.reset}`;
  if (details.input) msg += `\n Input: ${details.input}`;
  if (details.output) msg += `\n Output: ${details.output}`;
  if (details.time) msg += `\n Time: ${details.time}ms`;
  return msg;
}

class Timer {
  constructor() {
    this.start = Date.now();
  }

  elapsed() {
    return Date.now() - this.start;
  }

  reset() {
    this.start = Date.now();
  }
}

function doBuild(file, outDir = "build", minify = false, noTranslit = false) {
  const inputFile = path.resolve(file);
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    return null;
  }
  if (!isBanglaScriptFile(inputFile)) {
    console.error(`❌ File must have .bjs extension: ${inputFile}`);
    return null;
  }

  ensureDir(outDir);

  let code_bjs;
  try {
    code_bjs = readFile(inputFile);
  } catch (err) {
    console.error(formatError(err, { file: inputFile }));
    return null;
  }

  const validation = validateBanglaScript(code_bjs);
  if (!validation.valid) {
    validation.errors.forEach((err) => {
      console.error(
        formatError(new Error(err.message), {
          file: inputFile,
          line: err.line,
        }),
      );
    });
    return null;
  }

  const outJS = getOutputFilename(inputFile, outDir);
  const outMap = getSourceMapFilename(inputFile, outDir);

  const timer = new Timer();
  try {
    console.log(`⚙️  Building: ${path.basename(inputFile)}...`);

    let { code, map } = transpileWithSourceMap(
      code_bjs,
      path.basename(inputFile),
      noTranslit,
    );
    if (minify) {
      const minified = transformSync(code, {
        presets: ["minify"],
        comments: false,
      });
      code = minified.code;
    }

    if (map) {
      code += `\n//# sourceMappingURL=${path.basename(outMap)}`;
    }

    writeFile(outJS, code);
    if (map) {
      writeFile(outMap, JSON.stringify(map, null, 2));
    }

    const time = timer.elapsed();
    console.log(
      formatSuccess("✓ Build successful", {
        input: path.basename(inputFile),
        output: outJS,
        time,
      }),
    );
    if (map) {
      console.log(`📍 Source map: ${outMap}`);
    }

    const stats = getCodeStats(code_bjs);
    console.log(
      `📊 Stats: ${stats.totalLines} lines (${stats.codeLines} code, ${stats.commentLines} comments, ${stats.blankLines} blank), ${stats.characters} chars`,
    );

    return outJS;
  } catch (err) {
    console.error(formatError(err, { file: inputFile, verbose: true }));
    return null;
  }
}

function watchAndBuild(files, outDir, minify, noTranslit) {
  const inputFiles = files.map((file) => path.resolve(file));
  inputFiles.forEach((file) => {
    if (!fs.existsSync(file)) {
      console.error(`❌ File not found: ${file}`);
      process.exit(1);
    }
  });

  console.log(
    `👀 Watching: ${inputFiles.map((file) => path.basename(file)).join(", ")}`,
  );
  console.log(`📁 Output: ${outDir}/`);
  if (minify) console.log(`🔍 Minify: Enabled`);
  if (noTranslit) console.log(`🔤 No translit: Enabled`);
  console.log(`\nWaiting for changes... (Press Ctrl+C to stop)\n`);

  // Initial build
  inputFiles.forEach((file) => doBuild(file, outDir, minify, noTranslit));

  const watcher = chokidar.watch(inputFiles, {
    ignoreInitial: true,
    persistent: true,
    usePolling: false,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 },
  });

  watcher.on("change", (filePath) => {
    console.log(`\n📝 Change detected: ${path.basename(filePath)}`);
    doBuild(filePath, outDir, minify, noTranslit);
  });

  watcher.on("error", (error) => {
    console.error(`❌ Watcher error: ${error}`);
  });

  process.on("SIGINT", () => {
    console.log("\n\n👋 Stopping watch mode...");
    watcher.close().then(() => process.exit(0));
  });
}

function showKeywords(filter = "", categoryFilter = "") {
  const colors = getColors();
  console.log(`\n${colors.cyan}📚 BanglaScript Keywords (v${pkg.version}):${colors.reset}\n`);
  console.log(`${colors.yellow}Bangla → JavaScript${colors.reset}\n`);
  console.log("─".repeat(55));

  const categories = getBanglaKeywords();

  for (const [category, words] of Object.entries(categories)) {
    if (categoryFilter && category.toLowerCase() !== categoryFilter.toLowerCase()) {
      continue;
    }

    const filteredWords = words.filter((w) => {
      if (!filter) return true;
      return (
        w.toLowerCase().includes(filter.toLowerCase()) ||
        (KEYWORDS[w] && KEYWORDS[w].toLowerCase().includes(filter.toLowerCase()))
      );
    });

    if (filteredWords.length > 0) {
      console.log(
        `\n${colors.blue}${colors.bright}${category.toUpperCase()}:${colors.reset}`,
      );
      filteredWords.forEach((word) => {
        if (KEYWORDS[word] !== undefined) {
          console.log(
            `  ${colors.green}${word.padEnd(20)}${colors.reset} → ${colors.cyan}${KEYWORDS[word]}${colors.reset}`,
          );
        }
      });
    }
  }

  console.log("\n" + "─".repeat(55));
  console.log(`\n💡 Tip: Use ${colors.yellow}bjs init <project-name>${colors.reset} to create a starter project.\n`);
}

module.exports = {
  ensureDir,
  doBuild,
  watchAndBuild,
  showKeywords,
  getColors,
  formatError,
  formatSuccess,
  Timer,
  validateBanglaScript,
  getCodeStats,
  isBanglaScriptFile,
  readFile,
  writeFile,
  getOutputFilename,
  getSourceMapFilename,
};