const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { transpileWithSourceMap, KEYWORDS } = require('./transpile-ast');
const { getBanglaKeywords, validateBanglaScript, getCodeStats } = require('./translate-words');

/**
 * File extension check করে যে এটি .bjs ফাইল কিনা
 */
function isBanglaScriptFile(filename) {
  return path.extname(filename).toLowerCase() === '.bjs';
}

/**
 * Directory নিশ্চিত করে (না থাকলে তৈরি করে)
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

/**
 * File পড়ে এবং content return করে
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`ফাইল পড়তে ব্যর্থ: ${filePath}\n${error.message}`);
  }
}

/**
 * File লিখে
 */
function writeFile(filePath, content) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    ensureDir(dir);
   
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    throw new Error(`ফাইল লিখতে ব্যর্থ: ${filePath}\n${error.message}`);
  }
}

/**
 * বাংলা ফাইল নাম থেকে JavaScript ফাইল নাম তৈরি করে
 */
function getOutputFilename(inputFile, outputDir = 'build') {
  const basename = path.basename(inputFile, '.bjs');
  return path.join(outputDir, `${basename}.js`);
}

/**
 * Source map filename তৈরি করে
 */
function getSourceMapFilename(inputFile, outputDir = 'build') {
  const basename = path.basename(inputFile, '.bjs');
  return path.join(outputDir, `${basename}.js.map`);
}

/**
 * Error কে সুন্দরভাবে format করে
 */
function formatError(error, context = {}) {
  const colors = getColors();
  const lines = [];
 
  lines.push(`${colors.red}❌ Error:${colors.reset}`);
  lines.push(` ${error.message}`);
 
  if (context.file) {
    lines.push(` File: ${context.file}`);
  }
 
  if (context.line) {
    lines.push(` Line: ${context.line}`);
  }
 
  if (error.stack && context.verbose) {
    lines.push('\nStack trace:');
    lines.push(error.stack);
  }
 
  return lines.join('\n');
}

/**
 * Success message format করে
 */
function formatSuccess(message, details = {}) {
  const colors = getColors();
  const lines = [];
 
  lines.push(`${colors.green}✅ ${message}${colors.reset}`);
 
  if (details.input) {
    lines.push(` Input: ${details.input}`);
  }
 
  if (details.output) {
    lines.push(` Output: ${details.output}`);
  }
 
  if (details.time) {
    lines.push(` Time: ${details.time}ms`);
  }
 
  return lines.join('\n');
}

/**
 * কোড থেকে line number খুঁজে বের করে (error reporting এর জন্য)
 */
function getLineNumber(code, position) {
  const lines = code.substring(0, position).split('\n');
  return lines.length;
}

/**
 * Color console output (terminal এর জন্য)
 */
function getColors() {
  return {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
 
    // Foreground colors
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
 
    // Background colors
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m'
  };
}

/**
 * Build function (CLI থেকে call) - আপডেট: minify support, multiple files
 */
function doBuild(file, outDir = 'build', minify = false) {
  const inputFile = path.isAbsolute(file) 
    ? file 
    : path.join(process.cwd(), file);
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ ফাইল পাওয়া যায়নি: ${inputFile}`);
    return null;
  }

  if (!isBanglaScriptFile(inputFile)) {
    console.error(`❌ ফাইল .bjs extension হতে হবে: ${inputFile}`);
    return null;
  }

  ensureDir(outDir);

  const code_bjs = readFile(inputFile);
  
  // Basic validation
  const validation = validateBanglaScript(code_bjs);
  if (!validation.valid) {
    validation.errors.forEach(err => {
      console.error(formatError(new Error(err.message), { file: inputFile, line: err.line }));
    });
    return null;
  }

  const base = path.basename(inputFile).replace(/\.bjs$/i, '') || 'main';
  const outJS = path.join(outDir, base + '.js');
  const outMap = path.join(outDir, base + '.js.map');

  const timer = new Timer();
  try {
    console.log(`⚙️  Building: ${path.basename(inputFile)}...`);
    
    let { code, map } = transpileWithSourceMap(code_bjs, path.basename(inputFile));
    if (minify) {
      const babel = require('@babel/core');
      const minified = babel.transformSync(code, { presets: ['minify'], comments: false });
      code = minified.code;
    }
    
    writeFile(outJS, code);
    if (map) {
      writeFile(outMap, JSON.stringify(map, null, 2));
    }
    
    const time = timer.elapsed();
    console.log(formatSuccess('সফলভাবে তৈরি হয়েছে', { 
      input: path.basename(inputFile), 
      output: outJS, 
      time 
    }));
    if (map) {
      console.log(`📍 Source map: ${outMap}`);
    }
    
    // Stats
    const stats = getCodeStats(code_bjs);
    console.log(`📊 Stats: ${stats.totalLines} lines (${stats.codeLines} code, ${stats.commentLines} comments), ${stats.characters} chars`);
    
    return outJS;
  } catch (err) {
    console.error(formatError(err, { file: inputFile, verbose: true }));
    return null;
  }
}

/**
 * Watch function - আপডেট: multiple files, cache for faster rebuild
 */
function watchAndBuild(files, outDir, minify) {
  const inputFiles = files.map(file => path.isAbsolute(file) ? file : path.join(process.cwd(), file));

  inputFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.error(`❌ ফাইল পাওয়া যায়নি: ${file}`);
      process.exit(1);
    }
  });

  console.log(`👀 Watching: ${inputFiles.map(path.basename).join(', ')}`);
  console.log(`📁 Output: ${outDir}/`);
  if (minify) console.log(`🔍 Minify: Enabled`);
  console.log(`\nপরিবর্তনের জন্য অপেক্ষা করছি... (Ctrl+C দিয়ে বন্ধ করুন)\n`);

  // Initial build
  inputFiles.forEach(file => doBuild(file, outDir, minify));

  const watcher = chokidar.watch(inputFiles, { 
    ignoreInitial: true,
    persistent: true,
    usePolling: false, // Optimized for performance
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 } // Debounce writes
  });

  watcher.on('change', (filePath) => {
    console.log(`\n📝 পরিবর্তন সনাক্ত: ${path.basename(filePath)}`);
    doBuild(filePath, outDir, minify);
  });

  watcher.on('error', (error) => {
    console.error(`❌ Watcher error: ${error}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n\n👋 Watch mode বন্ধ হচ্ছে...');
    watcher.close();
    process.exit(0);
  });
}

/**
 * Init project - আপডেট: আরো advanced example যোগ (class, async)
 */
function initProject(projectName) {
  const projectDir = path.join(process.cwd(), projectName);
  
  if (fs.existsSync(projectDir)) {
    console.error(`❌ ফোল্ডার '${projectName}' ইতিমধ্যে বিদ্যমান`);
    process.exit(1);
  }

  console.log(`📦 নতুন প্রজেক্ট তৈরি হচ্ছে: ${projectName}`);
  
  ensureDir(projectDir);
  ensureDir(path.join(projectDir, 'src'));
  ensureDir(path.join(projectDir, 'build'));

  // Example .bjs file তৈরি করো (আপডেট: class এবং async example যোগ)
  const exampleCode = `// BanglaScript উদাহরণ প্রোগ্রাম
// বাংলা ভাষায় JavaScript লিখুন!

অনুষ্ঠান শুভেচ্ছা(নাম) {
  লিখো("হ্যালো, " + নাম + "!");
  লিখো("BanglaScript এ স্বাগতম!");
}

সংখ্যা বয়স = ২০;
বাক্য নাম = "মাহমুদ";

শুভেচ্ছা(নাম);

যদি (বয়স >= ১৮) {
  লিখো("আপনি প্রাপ্তবয়স্ক");
} নাহলে {
  লিখো("আপনি নাবালক");
}

// লুপ উদাহরণ
জন্য (বাক্য i = ১; i <= ৫; i++) {
  লিখো("সংখ্যা: " + i);
}

// ফাংশন উদাহরণ
অনুষ্ঠান যোগফল(a, b) {
  প্রেরণ a + b;
}

বাক্য ফলাফল = যোগফল(১০, ২০);
লিখো("যোগফল: " + ফলাফল);

// Class উদাহরণ
শ্রেণী মানুষ {
  গঠন(নাম, বয়স) {
    এটি.নাম = নাম;
    এটি.বয়স = বয়স;
  }
  
  শুভেচ্ছা() {
    লিখো("হ্যালো, আমার নাম " + এটি.নাম);
  }
}

বাক্য ব্যক্তি = নতুন মানুষ("আলী", ৩০);
ব্যক্তি.শুভেচ্ছা();

// Async উদাহরণ
অ্যাসিঙ্ক অনুষ্ঠান লোড_ডাটা() {
  অপেক্ষা নতুন প্রতিজ্ঞা((সফল) => setTimeout(সফল, 1000));
  লিখো("ডাটা লোড হয়েছে!");
}

লোড_ডাটা();
`;

  writeFile(
    path.join(projectDir, 'src', 'main.bjs'),
    exampleCode
  );

  // package.json তৈরি করো
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "BanglaScript প্রজেক্ট",
    scripts: {
      build: "bjs build src/main.bjs",
      run: "bjs run src/main.bjs",
      watch: "bjs watch src/main.bjs"
    },
    keywords: ["banglascript", "bangla"],
    author: "Your Name",
    license: "MIT"
  };

  writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // README.md তৈরি করো (আপডেট: আরো details)
  const readme = `# ${projectName}

বাংলা ভাষায় JavaScript প্রোগ্রামিং!

## ব্যবহার

### Build করুন
\`\`\`bash
npm run build
\`\`\`

### চালান
\`\`\`bash
npm run run
\`\`\`

### Watch mode
\`\`\`bash
npm run watch
\`\`\`

## BanglaScript সম্পর্কে

BanglaScript এর মাধ্যমে আপনি বাংলা ভাষায় JavaScript কোড লিখতে পারবেন।

### Keywords:
- \`বাক্য\` = \`let\`
- \`ধ্রুবক\` = \`const\`
- \`অনুষ্ঠান\` = \`function\`
- \`যদি\` = \`if\`
- \`নাহলে\` = \`else\`
- \`জন্য\` = \`for\`
- \`যখন\` = \`while\`
- \`লিখো\` = \`console.log\`
- \`সত্য\` = \`true\`
- \`মিথ্যা\` = \`false\`

### নতুন ফিচার:
- Class: \`শ্রেণী\`
- Async: \`অ্যাসিঙ্ক\`, \`অপেক্ষা\`

আরও জানতে: \`bjs keywords\`
`;

  writeFile(
    path.join(projectDir, 'README.md'),
    readme
  );

  console.log(`✅ প্রজেক্ট সফলভাবে তৈরি হয়েছে!`);
  console.log(`\nপরবর্তী পদক্ষেপ:`);
  console.log(`  cd ${projectName}`);
  console.log(`  bjs run src/main.bjs`);
  console.log(`\nবা watch mode এ চালান:`);
  console.log(`  bjs watch src/main.bjs\n`);
}

/**
 * Show keywords
 */
function showKeywords() {
  console.log('\n📚 BanglaScript Keywords:\n');
  console.log('বাংলা → JavaScript\n');
  console.log('─'.repeat(50));
  
  const categories = getBanglaKeywords();

  for (const [category, words] of Object.entries(categories)) {
    console.log(`\n${category}:`);
    words.forEach(word => {
      if (KEYWORDS[word]) {
        console.log(`  ${word.padEnd(20)} → ${KEYWORDS[word]}`);
      }
    });
  }

  console.log('\n' + '─'.repeat(50));
  console.log('\nসম্পূর্ণ তালিকা দেখতে documentation দেখুন।');
  console.log('উদাহরণ প্রজেক্ট তৈরি করতে: bjs init my-project\n');
}

/**
 * Performance timing helper
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