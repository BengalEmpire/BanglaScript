const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { transpileWithSourceMap, KEYWORDS } = require('./transpile-ast');
const { getBanglaKeywords, validateBanglaScript, getCodeStats } = require('./translate-words');
const { transformSync } = require('@babel/core');

/**
 * Checks if the file has .bjs extension.
 * @param {string} filename 
 * @returns {boolean}
 */
function isBanglaScriptFile(filename) {
  return path.extname(filename).toLowerCase() === '.bjs';
}

/**
 * Ensures the directory exists, creates if not.
 * @param {string} dirPath 
 * @returns {boolean} True if created, false if existed.
 */
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

/**
 * Reads file content.
 * @param {string} filePath 
 * @returns {string}
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath}\n${error.message}`);
  }
}

/**
 * Writes content to file.
 * @param {string} filePath 
 * @param {string} content 
 * @returns {boolean}
 */
function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    ensureDir(dir);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    throw new Error(`Failed to write file: ${filePath}\n${error.message}`);
  }
}

/**
 * Gets output JS filename.
 * @param {string} inputFile 
 * @param {string} outputDir 
 * @returns {string}
 */
function getOutputFilename(inputFile, outputDir = 'build') {
  const basename = path.basename(inputFile, '.bjs');
  return path.join(outputDir, `${basename}.js`);
}

/**
 * Gets source map filename.
 * @param {string} inputFile 
 * @param {string} outputDir 
 * @returns {string}
 */
function getSourceMapFilename(inputFile, outputDir = 'build') {
  const basename = path.basename(inputFile, '.bjs');
  return path.join(outputDir, `${basename}.js.map`);
}

/**
 * Formats error message.
 * @param {Error} error 
 * @param {object} context 
 * @returns {string}
 */
function formatError(error, context = {}) {
  const colors = getColors();
  let message = `${colors.red}❌ Error:${colors.reset}\n ${error.message}`;
  if (context.file) message += `\n File: ${context.file}`;
  if (context.line) message += `\n Line: ${context.line}`;
  if (error.stack && context.verbose) message += `\n\nStack trace:\n${error.stack}`;
  return message;
}

/**
 * Formats success message.
 * @param {string} message 
 * @param {object} details 
 * @returns {string}
 */
function formatSuccess(message, details = {}) {
  const colors = getColors();
  let msg = `${colors.green}✅ ${message}${colors.reset}`;
  if (details.input) msg += `\n Input: ${details.input}`;
  if (details.output) msg += `\n Output: ${details.output}`;
  if (details.time) msg += `\n Time: ${details.time}ms`;
  return msg;
}

/**
 * Gets ANSI colors for console.
 * @returns {object}
 */
function getColors() {
  return {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m'
  };
}

/**
 * Builds .bjs to .js.
 * @param {string} file 
 * @param {string} outDir 
 * @param {boolean} minify 
 * @param {boolean} noTranslit 
 * @returns {string|null} Output file or null on failure.
 */
function doBuild(file, outDir = 'build', minify = false, noTranslit = false) {
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
    validation.errors.forEach(err => {
      console.error(formatError(new Error(err.message), { file: inputFile, line: err.line }));
    });
    return null;
  }

  const outJS = getOutputFilename(inputFile, outDir);
  const outMap = getSourceMapFilename(inputFile, outDir);

  const timer = new Timer();
  try {
    console.log(`⚙️  Building: ${path.basename(inputFile)}...`);

    let { code, map } = transpileWithSourceMap(code_bjs, path.basename(inputFile), noTranslit);
    if (minify) {
      const minified = transformSync(code, { presets: ['minify'], comments: false });
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
    console.log(formatSuccess('Build successful', {
      input: path.basename(inputFile),
      output: outJS,
      time
    }));
    if (map) {
      console.log(`📍 Source map: ${outMap}`);
    }

    const stats = getCodeStats(code_bjs);
    console.log(`📊 Stats: ${stats.totalLines} lines (${stats.codeLines} code, ${stats.commentLines} comments, ${stats.blankLines} blank), ${stats.characters} chars`);

    return outJS;
  } catch (err) {
    console.error(formatError(err, { file: inputFile, verbose: true }));
    return null;
  }
}

/**
 * Watches files and rebuilds on change.
 * @param {string[]} files 
 * @param {string} outDir 
 * @param {boolean} minify 
 * @param {boolean} noTranslit 
 */
function watchAndBuild(files, outDir, minify, noTranslit) {
  const inputFiles = files.map(file => path.resolve(file));
  inputFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.error(`❌ File not found: ${file}`);
      process.exit(1);
    }
  });

  console.log(`👀 Watching: ${inputFiles.map(path.basename).join(', ')}`);
  console.log(`📁 Output: ${outDir}/`);
  if (minify) console.log(`🔍 Minify: Enabled`);
  if (noTranslit) console.log(`🔤 No translit: Enabled`);
  console.log(`\nWaiting for changes... (Press Ctrl+C to stop)\n`);

  // Initial build
  inputFiles.forEach(file => doBuild(file, outDir, minify, noTranslit));

  const watcher = chokidar.watch(inputFiles, {
    ignoreInitial: true,
    persistent: true,
    usePolling: false,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 }
  });

  watcher.on('change', (filePath) => {
    console.log(`\n📝 Change detected: ${path.basename(filePath)}`);
    doBuild(filePath, outDir, minify, noTranslit);
  });

  watcher.on('error', (error) => {
    console.error(`❌ Watcher error: ${error}`);
  });

  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping watch mode...');
    watcher.close().then(() => process.exit(0));
  });
}

/**
 * Initializes a new project.
 * @param {string} projectName 
 */
function initProject(projectName) {
  const projectDir = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectDir)) {
    console.error(`❌ Folder '${projectName}' already exists`);
    process.exit(1);
  }

  console.log(`📦 Creating new project: ${projectName}`);

  ensureDir(projectDir);
  ensureDir(path.join(projectDir, 'src'));
  ensureDir(path.join(projectDir, 'build'));

  // Example code with advanced features
  const exampleCode = `// BanglaScript example program
// Write JavaScript in Bangla!

অনুষ্ঠান শুভেচ্ছা(নাম) {
  লিখো("হ্যালো, " + নাম + "!");
  লিখো("BanglaScript-এ স্বাগতম!");
}

ধ্রুবক বয়স = ২০;
বাক্য নাম = "মাহমুদ";

শুভেচ্ছা(নাম);

যদি (বয়স >= ১৮) {
  লিখো("আপনি প্রাপ্তবয়স্ক");
} নাহলে {
  লিখো("আপনি নাবালক");
}

// Loop example
জন্য (চলক i = ১; i <= ৫; i++) {
  লিখো("সংখ্যা: " + i);
}

// Function example
অনুষ্ঠান যোগফল(a, b) {
  ফেরত a + b;
}

চলক ফলাফল = যোগফল(১০, ২০);
লিখো("যোগফল: " + ফলাফল);

// Class example
শ্রেণী মানুষ {
  গঠন(নাম, বয়স) {
    এটি.নাম = নাম;
    এটি.বয়স = বয়স;
  }
  
  শুভেচ্ছা() {
    লিখো("হ্যালো, আমার নাম " + এটি.নাম);
  }
}

চলক ব্যক্তি = নতুন মানুষ("আলী", ৩০);
ব্যক্তি.শুভেচ্ছা();

// Async example
অ্যাসিঙ্ক অনুষ্ঠান লোড_ডাটা() {
  অপেক্ষা নতুন প্রতিজ্ঞা((সফল) => setTimeout(সফল, 1000));
  লিখো("ডাটা লোড হয়েছে!");
}

লোড_ডাটা();

// Try-catch example
চেষ্টা {
  ফেলা নতুন Error("একটি সমস্যা!");
} ধরো (সমস্যা) {
  লিখো(সমস্যা.message);
} অবশেষে {
  লিখো("সমাপ্ত!");
}
`;

  // package.json
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "BanglaScript project",
    scripts: {
      build: "bjs build src/main.bjs",
      watch: "bjs watch src/main.bjs",
      run: "bjs run src/main.bjs"
    },
    keywords: ["banglascript"],
    author: "",
    license: "MIT"
  };

  // README.md
  const readme = `# ${projectName}

BanglaScript project - Write JavaScript in Bangla!

## Usage

### Build
\`\`\`bash
npm run build
\`\`\`

### Watch
\`\`\`bash
npm run watch
\`\`\`

### Run
\`\`\`bash
npm run run
\`\`\`

## Keywords
See \`bjs keywords\` for full list.

## Features
- Supports classes, async/await, try-catch, etc.
- Optional identifier transliteration (\`--no-translit\`).
- Source map generation for debugging.

For more, check documentation.
`;

  writeFile(path.join(projectDir, 'src', 'main.bjs'), exampleCode);
  writeFile(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  writeFile(path.join(projectDir, 'README.md'), readme);

  console.log(`✅ Project created successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${projectName}`);
  console.log(`  npm run build`);
  console.log(`  node build/main.js`);
  console.log(`\nOr run directly:`);
  console.log(`  bjs run src/main.bjs\n`);
}

/**
 * Shows all keywords.
 */
function showKeywords() {
  const colors = getColors();
  console.log('\n📚 BanglaScript Keywords:\n');
  console.log(`${colors.yellow}Bangla → JavaScript${colors.reset}\n`);
  console.log('─'.repeat(50));
  
  const categories = getBanglaKeywords();

  for (const [category, words] of Object.entries(categories)) {
    console.log(`\n${colors.blue}${category.charAt(0).toUpperCase() + category.slice(1)}:${colors.reset}`);
    words.forEach(word => {
      if (KEYWORDS[word]) {
        console.log(`  ${colors.green}${word}${colors.reset} → ${colors.cyan}${KEYWORDS[word]}${colors.reset}`);
      }
    });
  }

  console.log('\n' + '─'.repeat(50));
  console.log('\nUse `bjs init my-project` to create an example project.\n');
}

/**
 * Timer class for performance.
 */
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

module.exports = { 
  ensureDir, 
  doBuild, 
  watchAndBuild, 
  initProject, 
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
  getSourceMapFilename
};