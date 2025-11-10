#!/usr/bin/env node

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
};

console.log(`
${colors.bright}${colors.green}╔═══════════════════════════════════════════════╗
║                                               ║
║       BanglaScript Successfully Installed     ║
║                                               ║
╚═══════════════════════════════════════════════╝${colors.reset}

${colors.cyan}জাভাস্ক্রিপ্ট বাংলায় লিখুন! Write JavaScript in Bangla!${colors.reset}

${colors.yellow}Quick Start:${colors.reset}
  ${colors.green}bjs init my-project${colors.reset}       Create a new project
  ${colors.green}bjs keywords${colors.reset}              View all Bangla keywords
  ${colors.green}bjs build file.bjs${colors.reset}        Build a .bjs file
  ${colors.green}bjs run file.bjs${colors.reset}          Build and run
  ${colors.green}bjs --help${colors.reset}                Show all commands

${colors.yellow}Documentation:${colors.reset} https://bangla-script.vercel.app
${colors.yellow}GitHub:${colors.reset}        https://github.com/BengalEmpire/BanglaScript
${colors.yellow}Issues:${colors.reset}        https://github.com/BengalEmpire/BanglaScript/issues

${colors.green}Happy coding! 🚀${colors.reset}
`);
