const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { transpileWithSourceMap } = require('../lib/transpile-ast');
const pkg = require('../package.json');
const { spawn } = require('child_process');
const { ensureDir, doBuild, watchAndBuild, initProject, showKeywords } = require('../lib/utils');

// Commander CLI setup
program
  .name('bjs')
  .version(pkg.version)
  .description('BanglaScript - বাংলা ভাষায় JavaScript প্রোগ্রামিং। সহজে বাংলায় কোড লিখুন এবং JavaScript-এ রূপান্তর করুন।');

// Build command - .bjs থেকে .js তৈরি করো
program
  .command('build [files...]')
  .option('-o, --out <dir>', 'Output directory', 'build')
  .option('-w, --watch', 'Watch mode')
  .option('-m, --minify', 'Minify the output JS')
  .description('.bjs ফাইল(স) থেকে .js ফাইল তৈরি করো। একাধিক ফাইল দেওয়া যাবে।')
  .action((files, opts) => {
    if (files.length === 0) {
      console.error('❌ কমপক্ষে একটি .bjs ফাইল দিন।');
      process.exit(1);
    }
    if (opts.watch) {
      watchAndBuild(files, opts.out, opts.minify);
    } else {
      files.forEach(file => doBuild(file, opts.out, opts.minify));
    }
  });

// Run command - Build করে সাথে সাথে চালাও
program
  .command('run <file>')
  .option('-o, --out <dir>', 'Output directory', 'build')
  .option('-m, --minify', 'Minify the output JS')
  .option('-a, --args <args...>', 'Arguments to pass to the Node.js process')
  .description('.bjs ফাইল build করে Node.js দিয়ে চালাও')
  .action((file, opts) => {
    const outFile = doBuild(file, opts.out, opts.minify);
    if (!outFile) {
      console.error('❌ Build ব্যর্থ হয়েছে');
      process.exit(1);
    }
    
    console.log(`\n🚀 চলছে: ${path.basename(outFile)}\n`);
    const nodeArgs = opts.args || [];
    const nodeProc = spawn(process.execPath, [outFile, ...nodeArgs], { stdio: 'inherit' });
    nodeProc.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n❌ প্রোগ্রাম exit code ${code} দিয়ে শেষ হয়েছে`);
      }
      process.exit(code);
    });
  });

// Watch command - ফাইল পরিবর্তন হলে auto-build
program
  .command('watch [files...]')
  .option('-o, --out <dir>', 'Output directory', 'build')
  .option('-m, --minify', 'Minify the output JS')
  .description('.bjs ফাইল(স) watch করো এবং পরিবর্তন হলে auto-build করো')
  .action((files, opts) => {
    if (files.length === 0) {
      console.error('❌ কমপক্ষে একটি .bjs ফাইল দিন।');
      process.exit(1);
    }
    watchAndBuild(files, opts.out, opts.minify);
  });

// Init command - Example প্রজেক্ট তৈরি করো
program
  .command('init [name]')
  .description('নতুন BanglaScript প্রজেক্ট তৈরি করো')
  .action((name) => {
    initProject(name || 'my-project');
  });

// Info command - Keyword তথ্য দেখাও
program
  .command('keywords')
  .description('সব BanglaScript keywords দেখাও')
  .action(() => {
    showKeywords();
  });

// New command: Transpile direct code from stdin
program
  .command('transpile')
  .option('-m, --minify', 'Minify the output JS')
  .description('সরাসরি BanglaScript কোড ইনপুট দিয়ে JavaScript-এ রূপান্তর করো (stdin থেকে)')
  .action((opts) => {
    let input = '';
    process.stdin.on('data', chunk => { input += chunk; });
    process.stdin.on('end', () => {
      try {
        const { code } = transpileWithSourceMap(input.trim(), 'stdin.bjs');
        const output = opts.minify ? minifyCode(code) : code;
        console.log(output);
      } catch (error) {
        console.error('❌ Transpile ব্যর্থ: ' + error.message);
        process.exit(1);
      }
    });
  });

program.parse(process.argv);

// যদি কোন command না দেওয়া হয়, help দেখাও
if (process.argv.length === 2) {
  program.help();
}

// Helper for minification 
function minifyCode(code) {
  const babel = require('@babel/core');
  const result = babel.transformSync(code, {
    presets: ['minify'],
    comments: false
  });
  return result.code;
}