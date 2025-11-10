#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const pkg = require("../package.json");
const version = pkg.version;
const date = new Date().toISOString().split("T")[0];

const changelogPath = path.join(__dirname, "..", "CHANGELOG.md");

let changelog = "";
if (fs.existsSync(changelogPath)) {
  changelog = fs.readFileSync(changelogPath, "utf8");
}

const newEntry = `
## [${version}] - ${date}

### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 

`;

// Insert new entry after the header
const headerEnd = changelog.indexOf("\n\n");
if (headerEnd !== -1) {
  changelog =
    changelog.slice(0, headerEnd + 2) +
    newEntry +
    changelog.slice(headerEnd + 2);
} else {
  // Create new changelog
  changelog = `# Changelog

All notable changes to BanglaScript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
${newEntry}`;
}

fs.writeFileSync(changelogPath, changelog);

console.log(`✅ Updated CHANGELOG.md for version ${version}`);
console.log(
  "📝 Please edit CHANGELOG.md to add your changes before committing.",
);
