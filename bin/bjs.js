#!/usr/bin/env node
/**
 * BanglaScript CLI v4.2.0
 * Modern, powerful command-line interface for BanglaScript
 */

if (process.platform === "win32") {
  try {
    require("child_process").execSync("chcp 65001 > nul");
  } catch {
    // Ignore error
  }
}

const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const readline = require("readline");
const { transpileWithSourceMap, transpile } = require("../lib/transpile-ast");
const { KEYWORDS } = require("../lib/keywords");
const pkg = require("../package.json");
const {
  doBuild,
  watchAndBuild,
  showKeywords,
  getColors,
  getCodeStats,
  validateBanglaScript,
  ensureDir,
  writeFile,
} = require("../lib/utils");
const { transformSync } = require("@babel/core");
const glob = require("glob");
const {
  templates,
  getTemplate,
  getTemplateList,
} = require("../lib/templates");
const { cacheInstance } = require("../lib/cache");
const { performanceMonitor } = require("../lib/performance");

// Register hook
require("../lib/register");

// ==================== HELPERS ====================

const colors = getColors();

function expandFiles(files) {
  return files.flatMap((f) => glob.sync(f));
}

function printBanner() {
  console.log(`
${colors.green}${colors.bright}
██████╗      ██╗███████╗
██╔══██╗     ██║██╔════╝
██████╔╝     ██║███████╗
██╔══██╗██   ██║╚════██║
██████╔╝╚█████╔╝███████║
╚═════╝  ╚════╝ ╚══════╝
${colors.reset}${colors.cyan}BanglaScript v${pkg.version}${colors.reset}
${colors.yellow}বাংলায় কোড লিখুন! 🇧🇩${colors.reset}
`);
}

function printSuccess(msg) {
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function printError(msg) {
  console.error(`${colors.red}❌ ${msg}${colors.reset}`);
}

function printInfo(msg) {
  console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`);
}

function printWarning(msg) {
  console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

// ==================== DEPENDENCY CHECK ====================

function checkDependencies() {
  const required = [
    "@babel/core",
    "@babel/parser",
    "@babel/generator",
    "chokidar",
    "glob",
  ];
  const missing = [];

  required.forEach((dep) => {
    try {
      require.resolve(dep);
    } catch {
      missing.push(dep);
    }
  });

  if (missing.length > 0) {
    printError(`Missing dependencies: ${missing.join(", ")}`);
    console.error(`\nInstall with: npm install ${missing.join(" ")}`);
    process.exit(1);
  }
}

checkDependencies();

// ==================== CLI SETUP ====================

program
  .name("bjs")
  .version(pkg.version, "-v, --version", "Output the current version")
  .description("BanglaScript CLI - Write JavaScript in Bangla 🇧🇩")
  .addHelpText(
    "after",
    `
${colors.yellow}Examples:${colors.reset}
  $ bjs build main.bjs              Build single file
  $ bjs build src/**/*.bjs -o dist  Build all .bjs files
  $ bjs run main.bjs                Build and run
  $ bjs watch src/**/*.bjs          Watch mode
  $ bjs init my-project             Create new project
  $ bjs init --template web myapp   Create web project
  $ bjs repl                        Start interactive REPL (with Tab completion!)
  $ bjs check main.bjs              Syntax check without building
  $ bjs bench src/main.bjs          Benchmark transpilation performance
  $ bjs keywords --search লুপ       Search keywords
  $ bjs eval "লিখো('হ্যালো');"      Evaluate code directly
  $ bjs cache --stats               Show cache statistics

${colors.cyan}Project Templates:${colors.reset}
  basic      - Basic console application
  web        - Web application with HTML/CSS
  api        - REST API server
  fullstack  - Full-stack application
  cli        - Command-line tool
  `,
  );

// ==================== BUILD COMMAND ====================

program
  .command("build [files...]")
  .description("Build .bjs file(s) to .js. Supports glob patterns.")
  .option("-o, --out <dir>", "Output directory", "build")
  .option("-m, --minify", "Minify output JS")
  .option("--no-translit", "Do not transliterate Bangla identifiers")
  .option("-w, --watch", "Watch mode for auto-build")
  .option("--no-cache", "Disable caching")
  .option("--profile", "Enable performance profiling")
  .action((files, opts) => {
    if (!files || files.length === 0) {
      printError("Provide at least one .bjs file or glob pattern");
      process.exit(1);
    }

    if (opts.profile) {
      performanceMonitor.setEnabled(true);
    }

    if (opts.cache === false) {
      cacheInstance.setEnabled(false);
    }

    const expanded = expandFiles(files);
    if (expanded.length === 0) {
      printError("No files matched");
      process.exit(1);
    }

    if (opts.watch) {
      watchAndBuild(expanded, opts.out, opts.minify, opts.noTranslit);
    } else {
      expanded.forEach((file) =>
        doBuild(file, opts.out, opts.minify, opts.noTranslit),
      );

      if (opts.profile) {
        performanceMonitor.printReport();
      }
    }
  });

// ==================== RUN COMMAND ====================

program
  .command("run <file>")
  .description("Build and run .bjs file with Node.js")
  .option("-o, --out <dir>", "Output directory", "build")
  .option("-m, --minify", "Minify output JS")
  .option("--no-translit", "Do not transliterate Bangla identifiers")
  .option("-a, --args <args...>", "Arguments for Node.js process")
  .option("--node-opts <opts>", 'Node.js options (e.g., "--inspect")')
  .action((file, opts) => {
    const expanded = expandFiles([file]);
    if (expanded.length === 0) {
      printError("File not found");
      process.exit(1);
    }

    const outFile = doBuild(
      expanded[0],
      opts.out,
      opts.minify,
      opts.noTranslit,
    );

    if (!outFile) {
      printError("Build failed");
      process.exit(1);
    }

    console.log(`\n🚀 Running: ${outFile}\n`);

    const nodeArgs = [];
    if (opts.nodeOpts) {
      nodeArgs.push(...opts.nodeOpts.split(" "));
    }
    nodeArgs.push(outFile);
    if (opts.args) {
      nodeArgs.push(...opts.args);
    }

    const nodeProc = spawn(process.execPath, nodeArgs, {
      stdio: "inherit",
      env: { ...process.env, BANGLASCRIPT: "1" },
    });

    nodeProc.on("error", (err) => {
      printError(`Failed to start Node.js: ${err.message}`);
      process.exit(1);
    });

    nodeProc.on("close", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`\n❌ Program exited with code ${code}`);
      }
      process.exit(code || 0);
    });

    process.on("SIGINT", () => {
      nodeProc.kill("SIGINT");
    });
  });

// ==================== CHECK / VALIDATE COMMAND ====================

program
  .command("check [files...]")
  .description("Check syntax and validity of .bjs file(s) without building")
  .action((files) => {
    if (!files || files.length === 0) {
      printError("Provide at least one .bjs file to check");
      process.exit(1);
    }

    const expanded = expandFiles(files);
    if (expanded.length === 0) {
      printError("No files found");
      process.exit(1);
    }

    let hasErrors = false;

    expanded.forEach((filePath) => {
      const code = fs.readFileSync(filePath, "utf8");
      const validation = validateBanglaScript(code);

      console.log(`\n🔍 Checking: ${colors.cyan}${filePath}${colors.reset}`);

      if (!validation.valid) {
        hasErrors = true;
        validation.errors.forEach((err) => {
          console.error(
            `  ${colors.red}✗ Line ${err.line}:${colors.reset} ${err.message}`,
          );
        });
      } else {
        try {
          transpile(code, false, { filename: path.basename(filePath) });
          printSuccess(`Syntax is valid!`);
        } catch (err) {
          hasErrors = true;
          console.error(`  ${colors.red}✗ ${err.message}${colors.reset}`);
        }
      }
    });

    if (hasErrors) {
      console.log();
      process.exit(1);
    } else {
      console.log(`\n${colors.green}All files passed validation!${colors.reset}\n`);
    }
  });

// ==================== BENCHMARK COMMAND ====================

program
  .command("bench [files...]")
  .description("Benchmark BanglaScript transpilation throughput")
  .option("-i, --iterations <n>", "Number of iterations", "50")
  .action((files, opts) => {
    const iterations = parseInt(opts.iterations, 10) || 50;
    const testFiles = files && files.length > 0 ? expandFiles(files) : [];

    let sampleCode = "";
    if (testFiles.length > 0) {
      sampleCode = fs.readFileSync(testFiles[0], "utf8");
      console.log(`\n⚡ Benchmarking file: ${colors.cyan}${testFiles[0]}${colors.reset}`);
    } else {
      sampleCode = `
ধ্রুবক নাম = "মাহমুদ";
সংখ্যা বয়স = ২৫;
অনুষ্ঠান গণনা(ক, খ) {
  ফেরত ক + খ;
}
জন্য (সংখ্যা i = ০; i < ১০০; i++) {
  যদি (i % ২ === ০) {
    লিখো("জোড়: " + i);
  }
}
`;
      console.log(`\n⚡ Benchmarking sample BanglaScript snippet`);
    }

    const lines = sampleCode.split("\n").length;
    console.log(`   Lines: ${lines} | Iterations: ${iterations}\n`);

    // 1. Cold run (without cache)
    cacheInstance.clear();
    cacheInstance.setEnabled(false);

    const startCold = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      transpile(sampleCode, false, { cache: false });
    }
    const endCold = process.hrtime.bigint();
    const coldDurationMs = Number(endCold - startCold) / 1_000_000;
    const coldThroughput = Math.round((lines * iterations) / (coldDurationMs / 1000));

    console.log(`Cold Transpilation (No Cache):`);
    console.log(`  Total time: ${coldDurationMs.toFixed(2)} ms`);
    console.log(`  Avg per run: ${(coldDurationMs / iterations).toFixed(2)} ms`);
    console.log(`  Throughput: ${colors.green}${coldThroughput.toLocaleString()} lines/sec${colors.reset}\n`);

    // 2. Cached run
    cacheInstance.setEnabled(true);
    transpile(sampleCode, false, { cache: true }); // warmup

    const startWarm = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      transpile(sampleCode, false, { cache: true });
    }
    const endWarm = process.hrtime.bigint();
    const warmDurationMs = Number(endWarm - startWarm) / 1_000_000;
    const warmThroughput = Math.round((lines * iterations) / (warmDurationMs / 1000));

    console.log(`Cached Transpilation (Memory LRU Cache):`);
    console.log(`  Total time: ${warmDurationMs.toFixed(2)} ms`);
    console.log(`  Avg per run: ${(warmDurationMs / iterations).toFixed(3)} ms`);
    console.log(`  Throughput: ${colors.green}${warmThroughput.toLocaleString()} lines/sec${colors.reset}`);
    console.log(`  Speedup: ${colors.yellow}${(coldDurationMs / warmDurationMs).toFixed(1)}x faster${colors.reset}\n`);
  });

// ==================== WATCH COMMAND ====================

program
  .command("watch [files...]")
  .description("Watch .bjs file(s) and auto-build on change.")
  .option("-o, --out <dir>", "Output directory", "build")
  .option("-m, --minify", "Minify output JS")
  .option("--no-translit", "Do not transliterate Bangla identifiers")
  .action((files, opts) => {
    if (!files || files.length === 0) {
      printError("Provide at least one .bjs file or glob pattern.");
      process.exit(1);
    }
    const expanded = expandFiles(files);
    if (expanded.length === 0) {
      printError("No files matched");
      process.exit(1);
    }
    watchAndBuild(expanded, opts.out, opts.minify, opts.noTranslit);
  });

// ==================== INIT COMMAND ====================

program
  .command("init [name]")
  .description("Initialize a new BanglaScript project")
  .option("-t, --template <type>", "Project template (basic, web, api, fullstack, cli)", "basic")
  .option("--web", "Shortcut for --template web")
  .option("--api", "Shortcut for --template api")
  .option("--fullstack", "Shortcut for --template fullstack")
  .option("--cli", "Shortcut for --template cli")
  .option("-l, --list", "List available templates")
  .action((name, opts) => {
    if (opts.list) {
      console.log(`\n${colors.cyan}📦 Available Templates:${colors.reset}\n`);
      getTemplateList().forEach((t, i) => {
        console.log(`  ${colors.green}${i + 1}. ${t.name}${colors.reset}`);
        console.log(`     ${t.displayName}`);
        console.log(`     ${colors.dim}${t.description}${colors.reset}\n`);
      });
      console.log(`Use: ${colors.yellow}bjs init --template <name> <project-name>${colors.reset}\n`);
      return;
    }

    let templateName = opts.template;
    if (opts.web) templateName = "web";
    if (opts.api) templateName = "api";
    if (opts.fullstack) templateName = "fullstack";
    if (opts.cli) templateName = "cli";

    const template = getTemplate(templateName);
    if (!template) {
      printError(`Unknown template: ${templateName}`);
      console.log(`\nAvailable templates: basic, web, api, fullstack, cli`);
      console.log(`Use: bjs init --list to see all templates`);
      process.exit(1);
    }

    const projectName = name || "my-bangla-project";
    const projectDir = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectDir)) {
      printError(`Folder '${projectName}' already exists`);
      process.exit(1);
    }

    console.log(`\n📦 Creating ${template.displayName}: ${projectName}`);
    console.log(`   Template: ${templateName}\n`);

    ensureDir(projectDir);
    ensureDir(path.join(projectDir, "src"));
    ensureDir(path.join(projectDir, "build"));

    if (template.name === "web" || template.name === "fullstack") {
      ensureDir(path.join(projectDir, "public"));
      if (template.name === "fullstack") {
        ensureDir(path.join(projectDir, "public", "build"));
      }
    }

    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = path.join(projectDir, filePath);
      const dirPath = path.dirname(fullPath);
      ensureDir(dirPath);

      const fileContent = typeof content === "function" ? content(projectName) : content;
      writeFile(fullPath, fileContent);
      console.log(`  ${colors.green}✓${colors.reset} ${filePath}`);
    }

    printBanner();
    printSuccess("Project created successfully!");

    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  ${colors.yellow}cd ${projectName}${colors.reset}`);
    console.log(`  ${colors.yellow}npm run build${colors.reset}`);

    if (template.name === "web") {
      console.log(`  ${colors.yellow}# Open index.html in browser${colors.reset}`);
    } else {
      console.log(`  ${colors.yellow}npm start${colors.reset}`);
    }

    console.log(`\n${colors.dim}Or run directly: bjs run src/main.bjs${colors.reset}\n`);
  });

// ==================== REPL COMMAND (WITH AUTOCOMPLETION) ====================

program
  .command("repl")
  .description("Start interactive BanglaScript REPL with autocompletion")
  .option("--no-translit", "Do not transliterate Bangla identifiers")
  .action((opts) => {
    printBanner();
    console.log(`${colors.cyan}Interactive Mode - Type BanglaScript code and press Enter${colors.reset}`);
    console.log(`${colors.dim}Tab autocompletion enabled | Commands: .help, .clear, .exit${colors.reset}\n`);

    const keywordList = Object.keys(KEYWORDS);

    function completer(line) {
      const lastWord = line.split(/[\s,();+*/={}[\]]+/).pop() || "";
      if (!lastWord) return [[], line];
      const hits = keywordList.filter((k) => k.startsWith(lastWord));
      return [hits.length ? hits : [], lastWord];
    }

    const historyFile = path.join(os.homedir(), ".bjs_history");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer,
      prompt: `${colors.green}bjs>${colors.reset} `,
    });

    let multilineBuffer = "";

    rl.prompt();

    rl.on("line", (line) => {
      const trimmed = line.trim();

      if (trimmed === ".exit" || trimmed === ".quit") {
        console.log("\n👋 বিদায়!");
        process.exit(0);
      }

      if (trimmed === ".help") {
        console.log(`
${colors.cyan}REPL Commands:${colors.reset}
  .help     Show this help
  .clear    Clear the screen
  .exit     Exit REPL
  .keywords Show all keywords

${colors.cyan}Tips:${colors.reset}
  - Press ${colors.yellow}Tab${colors.reset} to autocomplete Bengali keywords!
  - For multiline: end line with \\ or unclosed { (
  - Use ${colors.yellow}লিখো()${colors.reset} to print output
`);
        rl.prompt();
        return;
      }

      if (trimmed === ".clear") {
        console.clear();
        printBanner();
        rl.prompt();
        return;
      }

      if (trimmed === ".keywords") {
        showKeywords();
        rl.prompt();
        return;
      }

      // Handle multiline input
      if (trimmed.endsWith("\\")) {
        multilineBuffer += line.slice(0, -1) + "\n";
        process.stdout.write(`${colors.dim}...${colors.reset} `);
        return;
      }

      const code = multilineBuffer + line;
      multilineBuffer = "";

      if (!code.trim()) {
        rl.prompt();
        return;
      }

      try {
        const jsCode = transpile(code, opts.noTranslit);
        const wrappedCode = `(async () => { return (${jsCode}); })()`;

        eval(wrappedCode)
          .then((res) => {
            if (res !== undefined) {
              console.log(`${colors.dim}=>${colors.reset}`, res);
            }
            rl.prompt();
          })
          .catch(() => {
            // Fallback for statements
            try {
              const stmtWrapped = `(async () => { ${jsCode} })()`;
              eval(stmtWrapped).catch((err) => {
                console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
              }).finally(() => rl.prompt());
            } catch (err) {
              console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
              rl.prompt();
            }
          });
      } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        rl.prompt();
      }
    });

    rl.on("close", () => {
      console.log("\n👋 বিদায়!");
      process.exit(0);
    });
  });

// ==================== KEYWORDS COMMAND ====================

program
  .command("keywords")
  .description("Display all BanglaScript keywords")
  .option("-s, --search <term>", "Search for a keyword")
  .option("-c, --category <cat>", "Filter by category")
  .action((opts) => {
    showKeywords(opts.search, opts.category);
  });

// ==================== TRANSPILE COMMAND ====================

program
  .command("transpile [file]")
  .description("Transpile BanglaScript code to JavaScript")
  .option("-m, --minify", "Minify output JS")
  .option("--no-translit", "Do not transliterate Bangla identifiers")
  .action((file, opts) => {
    if (file) {
      try {
        const content = fs.readFileSync(file, "utf8");
        let { code } = transpileWithSourceMap(content, path.basename(file), opts.noTranslit);
        if (opts.minify) {
          code = transformSync(code, { presets: ["minify"], comments: false }).code;
        }
        process.stdout.write(code + "\n");
      } catch (error) {
        printError(`Transpile failed: ${error.message}`);
        process.exit(1);
      }
      return;
    }

    // Stdin mode
    let input = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      input += chunk;
    });
    process.stdin.on("end", () => {
      try {
        let { code } = transpileWithSourceMap(
          input.trim(),
          "stdin.bjs",
          opts.noTranslit,
        );
        if (opts.minify) {
          code = transformSync(code, { presets: ["minify"], comments: false }).code;
        }
        process.stdout.write(code + "\n");
      } catch (error) {
        printError(`Transpile failed: ${error.message}`);
        process.exit(1);
      }
    });
  });

// ==================== EVAL COMMAND ====================

program
  .command("eval <code>")
  .description("Evaluate BanglaScript code directly")
  .option("--no-translit", "Do not transliterate Bangla identifiers")
  .option("-s, --show-js", "Show transpiled JavaScript")
  .action((code, opts) => {
    try {
      const { code: jsCode } = transpileWithSourceMap(
        code,
        "eval.bjs",
        opts.noTranslit,
      );

      if (opts.showJs) {
        console.log(`\n${colors.cyan}📝 Transpiled JavaScript:${colors.reset}`);
        console.log("─".repeat(50));
        console.log(jsCode);
        console.log("─".repeat(50));
      }

      console.log("\n🚀 Output:");
      eval(jsCode);
    } catch (error) {
      printError(`Evaluation failed: ${error.message}`);
      process.exit(1);
    }
  });

// ==================== INFO COMMAND ====================

program
  .command("info [file]")
  .description("Show information about .bjs file or BanglaScript")
  .action((file) => {
    if (!file) {
      printBanner();
      console.log(`
${colors.cyan}About BanglaScript${colors.reset}
  Version: ${pkg.version}
  Description: ${pkg.description}
  License: ${pkg.license || "MIT"}

${colors.cyan}Links${colors.reset}
  Website: https://bangla-script.vercel.app
  GitHub: https://github.com/BengalEmpire/BanglaScript
  NPM: https://npmjs.com/package/banglascript
  VSCode: https://marketplace.visualstudio.com/items?itemName=BengalEmpire.banglascript

${colors.cyan}Commands${colors.reset}
  Use 'bjs --help' for usage information.
  Use 'bjs keywords' to see all available keywords.
  Use 'bjs init --list' to see project templates.
      `);
      return;
    }

    const expanded = expandFiles([file]);
    if (expanded.length === 0) {
      printError("File not found");
      process.exit(1);
    }

    const filePath = expanded[0];
    const code = fs.readFileSync(filePath, "utf8");

    console.log(`\n${colors.cyan}📄 File Information${colors.reset}`);
    console.log("─".repeat(50));
    console.log(`Name: ${path.basename(filePath)}`);
    console.log(`Path: ${path.resolve(filePath)}`);
    console.log(`Size: ${(code.length / 1024).toFixed(2)} KB`);

    const stats = getCodeStats(code);
    console.log(`\n${colors.cyan}📊 Code Statistics${colors.reset}`);
    console.log("─".repeat(50));
    console.log(`Total lines: ${stats.totalLines}`);
    console.log(`Code lines: ${stats.codeLines}`);
    console.log(`Comment lines: ${stats.commentLines}`);
    console.log(`Blank lines: ${stats.blankLines}`);
    console.log(`Characters: ${stats.characters}`);

    const validation = validateBanglaScript(code);
    console.log(`\n${colors.cyan}✓ Validation${colors.reset}`);
    console.log("─".repeat(50));
    if (validation.valid) {
      printSuccess("Valid BanglaScript");
    } else {
      printError("Invalid BanglaScript");
      validation.errors.forEach((err) => {
        console.error(`  ${colors.yellow}Line ${err.line}:${colors.reset} ${err.message}`);
      });
    }
    console.log();
  });

// ==================== CACHE COMMAND ====================

program
  .command("cache")
  .description("Manage transpilation cache")
  .option("-s, --stats", "Show cache statistics")
  .option("-c, --clear", "Clear all cache")
  .option("--clear-old", "Clear old cache entries (>7 days)")
  .action((opts) => {
    if (opts.clear) {
      cacheInstance.clear();
      printSuccess("Cache cleared");
      return;
    }

    if (opts.clearOld) {
      cacheInstance.clearOld();
      printSuccess("Old cache entries cleared");
      return;
    }

    const stats = cacheInstance.getStats();
    console.log(`\n${colors.cyan}📊 Cache Statistics${colors.reset}`);
    console.log("─".repeat(50));
    console.log(`Memory cache: ${stats.memoryCacheCount}/${stats.memoryCacheLimit} items`);
    console.log(`Disk cache: ${stats.diskCacheCount} items (${stats.diskCacheSizeMB} MB)`);
    console.log(`Status: ${stats.enabled ? colors.green + "Enabled" : colors.red + "Disabled"}${colors.reset}`);
    console.log();
  });

// ==================== UPGRADE COMMAND ====================

program
  .command("upgrade")
  .description("Check for and install updates")
  .action(() => {
    console.log(`\n${colors.cyan}Checking for updates...${colors.reset}`);
    const { execSync } = require("child_process");
    try {
      const latest = execSync("npm view banglascript version", { encoding: "utf8" }).trim();
      if (latest === pkg.version) {
        printSuccess(`You are on the latest version (${pkg.version})`);
      } else {
        printInfo(`New version available: ${latest} (current: ${pkg.version})`);
        console.log(`\nRun: ${colors.yellow}npm update -g banglascript${colors.reset}`);
      }
    } catch {
      printWarning("Could not check for updates. Check your internet connection.");
    }
    console.log();
  });

// ==================== ERROR HANDLING ====================

program.configureOutput({
  outputError: (str, write) => {
    write(`${colors.red}${str}${colors.reset}`);
  },
});

program.exitOverride((err) => {
  if (err.code === "commander.helpDisplayed") {
    process.exit(0);
  }
  if (err.code === "commander.version") {
    process.exit(0);
  }
  console.error(`\n❌ ${err.message}\n`);
  process.exit(1);
});

// ==================== PARSE ====================

program.parse(process.argv);

if (process.argv.length === 2) {
  printBanner();
  program.help();
}