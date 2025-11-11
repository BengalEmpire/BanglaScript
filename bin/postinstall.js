#!/usr/bin/env node
if (process.platform === 'win32') {
  require('child_process').execSync('chcp 65001 > nul');
}

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  brightGreen: "\x1b[92m",
  cyan: "\x1b[36m",
  brightCyan: "\x1b[96m",
  yellow: "\x1b[33m",
  brightYellow: "\x1b[93m",
  magenta: "\x1b[35m",
  brightMagenta: "\x1b[95m",
  blue: "\x1b[34m",
  brightBlue: "\x1b[94m",
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Gradient effect for text
const gradient = (text, color1, color2) => {
  return `${color1}${text}${colors.reset}`;
};

// Animated typewriter effect (simplified for install script)
const printLine = (text, delay = 0) => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(text);
      resolve();
    }, delay);
  });
};

async function displayWelcome() {
  console.clear();
  
  // Animated header
  await printLine(`
${colors.brightGreen}${colors.bright}
██████╗  █████╗ ███╗   ██╗ ██████╗ ██╗      █████╗ ███████╗ ██████╗██████╗ ██╗██████╗ ████████╗
██╔══██╗██╔══██╗████╗  ██║██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝
██████╔╝███████║██╔██╗ ██║██║  ███╗██║     ███████║███████╗██║     ██████╔╝██║██████╔╝   ██║   
██╔══██╗██╔══██║██║╚██╗██║██║   ██║██║     ██╔══██║╚════██║██║     ██╔══██╗██║██╔═══╝    ██║   
██████╔╝██║  ██║██║ ╚████║╚██████╔╝███████╗██║  ██║███████║╚██████╗██║  ██║██║██║        ██║   
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   
                                                                                               
                                    BanglaScript v3xx
${colors.reset}`, 0);

  await sleep(100);

  await printLine(`
${colors.brightCyan}${colors.bright}    ✨ Successfully Installed! ✨${colors.reset}
`, 100);

  await sleep(100);

  await printLine(`
${colors.cyan}    ┌─────────────────────────────────────────────────────────┐
    │  জাভাস্ক্রিপ্ট বাংলায় লিখুন!                                 │
    │  Write JavaScript in Bangla!                            │
    └─────────────────────────────────────────────────────────┘${colors.reset}
`, 200);

  await sleep(150);

  await printLine(`
${colors.brightYellow}${colors.bright}    🚀 Quick Start Commands:${colors.reset}
`, 250);

  const commands = [
    { cmd: 'bjs init my-project', desc: 'Create a new project', icon: '📦' },
    { cmd: 'bjs keywords', desc: 'View all Bangla keywords', icon: '📚' },
    { cmd: 'bjs build file.bjs', desc: 'Build a .bjs file', icon: '🔨' },
    { cmd: 'bjs run file.bjs', desc: 'Build and run instantly', icon: '⚡' },
    { cmd: 'bjs --help', desc: 'Show all commands', icon: '❓' },
  ];

  for (let i = 0; i < commands.length; i++) {
    const { cmd, desc, icon } = commands[i];
    await printLine(
      `    ${colors.cyan}${icon}  ${colors.brightGreen}${cmd.padEnd(22)}${colors.reset}${colors.dim}→${colors.reset} ${colors.yellow}${desc}${colors.reset}`,
      300 + (i * 80)
    );
  }

  await sleep(200);

  await printLine(`
${colors.brightMagenta}${colors.bright}    📖 Resources:${colors.reset}
`, 700);

  const resources = [
    { label: 'Documentation', url: 'https://bangla-script.vercel.app' },
    { label: 'GitHub', url: 'https://github.com/BengalEmpire/BanglaScript' },
    { label: 'Report Issues', url: 'https://github.com/BengalEmpire/BanglaScript/issues' },
  ];

  for (let i = 0; i < resources.length; i++) {
    const { label, url } = resources[i];
    await printLine(
      `    ${colors.magenta} ${colors.bright}${label.padEnd(16)}${colors.reset}${colors.dim}→${colors.reset} ${colors.brightBlue}${url}${colors.reset}`,
      800 + (i * 80)
    );
  }

  await sleep(200);

  await printLine(`
${colors.green}    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║  ${colors.brightGreen}💚 Happy Coding with BanglaScript! 🚀${colors.green}                    ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝${colors.reset}
`, 1000);

  await printLine(`
${colors.dim}    💡 Tip: For best Bengali text display on Windows, use
       Windows Terminal or PowerShell with UTF-8 encoding.${colors.reset}
`, 1100);

  await printLine('', 1200);
}

// Run the animated display
displayWelcome().catch(console.error);