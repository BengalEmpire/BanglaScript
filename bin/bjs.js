#!/usr/bin/env node
/**
 * BanglaScript CLI v4.0.0
 * Enhanced command-line interface with new features
 */

if (process.platform === "win32") {
  require("child_process").execSync("chcp 65001 > nul");
}

const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const readline = require("readline");
const { transpileWithSourceMap, transpile } = require("../lib/transpile-ast");
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
    } catch (e) {
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
  $ bjs repl                        Start interactive REPL
  $ bjs keywords                    Show all keywords
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

// ==================== INIT COMMAND (ENHANCED) ====================

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
    // List templates
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

    // Determine template
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

    // Create directories
    ensureDir(projectDir);
    ensureDir(path.join(projectDir, "src"));
    ensureDir(path.join(projectDir, "build"));

    if (template.name === "web" || template.name === "fullstack") {
      ensureDir(path.join(projectDir, "public"));
      if (template.name === "fullstack") {
        ensureDir(path.join(projectDir, "public", "build"));
      }
    }

    // Write files
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = path.join(projectDir, filePath);
      const dirPath = path.dirname(fullPath);
      ensureDir(dirPath);

      const fileContent = typeof content === "function" ? content(projectName) : content;
      writeFile(fullPath, fileContent);
      console.log(`  ${colors.green}✓${colors.reset} ${filePath}`);
    }

    // Print banner
    printBanner();
    printSuccess("Project created successfully!");

    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  ${colors.yellow}cd ${projectName}${colors.reset}`);
    console.log(`  ${colors.yellow}npm run build${colors.reset}`);

    if (template.name === "web") {
      console.log(`  ${colors.yellow}# Open index.html in browser${colors.reset}`);
    } else if (template.name === "api" || template.name === "fullstack") {
      console.log(`  ${colors.yellow}npm start${colors.reset}`);
    } else {
      console.log(`  ${colors.yellow}npm start${colors.reset}`);
    }

    console.log(`\n${colors.dim}Or run directly: bjs run src/main.bjs${colors.reset}\n`);
  });

// ==================== REPL COMMAND ====================

program
  .command("repl")
  .description("Start interactive BanglaScript REPL")
  .option("--no-translit", "Do not transliterate Bangla identifiers")
  .action((opts) => {
    printBanner();
    console.log(`${colors.cyan}Interactive Mode - Type BanglaScript code and press Enter${colors.reset}`);
    console.log(`${colors.dim}Commands: .help, .clear, .exit${colors.reset}\n`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${colors.green}bjs>${colors.reset} `,
    });

    let multilineBuffer = "";
    let inMultiline = false;

    rl.prompt();

    rl.on("line", (line) => {
      const trimmed = line.trim();

      // Handle REPL commands
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
  - Type BanglaScript code and press Enter
  - For multiline: end line with \\ to continue
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
        inMultiline = true;
        process.stdout.write(`${colors.dim}...${colors.reset} `);
        return;
      }

      const code = multilineBuffer + line;
      multilineBuffer = "";
      inMultiline = false;

      if (!code.trim()) {
        rl.prompt();
        return;
      }

      try {
        const jsCode = transpile(code, opts.noTranslit);

        // Wrap in async IIFE for await support
        const wrappedCode = `(async () => { ${jsCode} })().catch(e => console.error(e))`;

        const result = eval(wrappedCode);

        // Don't print undefined results from void functions
        if (result !== undefined && !(result instanceof Promise)) {
          console.log(`${colors.dim}=>${colors.reset}`, result);
        }
      } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
      }

      rl.prompt();
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
    showKeywords();
  });

// ==================== TRANSPILE COMMAND ====================

program
  .command("transpile")
  .description("Transpile BanglaScript code from stdin to JavaScript")
  .option("-m, --minify", "Minify output JS")
  .option("--no-translit", "Do not transliterate Bangla identifiers")
  .action((opts) => {
    let input = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      input += chunk;
    });
    process.stdin.on("end", () => {
      try {
        const { code } = transpileWithSourceMap(
          input.trim(),
          "stdin.bjs",
          opts.noTranslit,
        );
        let output = code;
        if (opts.minify) {
          const minified = transformSync(output, {
            presets: ["minify"],
            comments: false,
          });
          output = minified.code;
        }
        process.stdout.write(output + "\n");
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
  Description: Write JavaScript in Bangla - জাভাস্ক্রিপ্ট বাংলায় লিখুন
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
    if (opts.stats) {
      const stats = cacheInstance.getStats();
      console.log(`\n${colors.cyan}📊 Cache Statistics${colors.reset}`);
      console.log("─".repeat(50));
      console.log(`Memory cache: ${stats.memoryCacheCount}/${stats.memoryCacheLimit} items`);
      console.log(`Disk cache: ${stats.diskCacheCount} items (${stats.diskCacheSizeMB} MB)`);
      console.log(`Status: ${stats.enabled ? colors.green + "Enabled" : colors.red + "Disabled"}${colors.reset}`);
      console.log();
      return;
    }

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

    // Default: show stats
    const stats = cacheInstance.getStats();
    console.log(`\n${colors.cyan}📊 Cache Statistics${colors.reset}`);
    console.log("─".repeat(50));
    console.log(`Memory: ${stats.memoryCacheCount} items`);
    console.log(`Disk: ${stats.diskCacheCount} items (${stats.diskCacheSizeMB} MB)`);
    console.log(`\nUse --clear to clear cache, --stats for detailed stats`);
    console.log();
  });

// ==================== FORMAT COMMAND ====================

program
  .command("format <file>")
  .description("Format BanglaScript code (experimental)")
  .option("-w, --write", "Write formatted code back to file")
  .action((file, opts) => {
    printWarning("Format command is experimental.");
    console.log("Coming in future versions!");
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

// Show help if no arguments
if (process.argv.length === 2) {
  printBanner();
  program.help();
}