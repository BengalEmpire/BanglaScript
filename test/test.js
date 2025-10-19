const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { transpile, transpileWithSourceMap } = require('../lib/transpile-ast');
const { translateBanglaToJS, convertBanglaNumbers, transliterateBanglaToLatin } = require('../lib/translate-words');
const { validateBanglaScript, getCodeStats, doBuild, initProject } = require('../lib/utils');

// Test counter
let passed = 0;
let failed = 0;

// Test helper
function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Run all tests
console.log('🧪 Starting BanglaScript Transpiler Tests...\n');

// Test 1: Keyword Replacement (Basic)
test('Keywords: বাক্য → let', () => {
  const input = 'বাক্য x = 1;';
  const expected = 'let x = 1;';
  const output = transpile(input);
  assert(output.includes('let x'), `Expected 'let x', got: ${output}`);
});

// Test 2: Multiple Keywords
test('Keywords: Function and Return', () => {
  const input = `
অনুষ্ঠান যোগ(a, b) {
  ফেরত a + b;
}
  `;
  const expected = /function jog\(a, b\) \{[\s\n]*return a \+ b;[\s\n]*\}/;
  const output = transpile(input);
  assert(expected.test(output), `Expected function pattern, got: ${output}`);
});

// Test 3: Control Flow Keywords
test('Keywords: If-Else', () => {
  const input = `
যদি (x > 0) {
  লিখো("positive");
} নাহলে {
  লিখো("negative");
}
  `;
  const expected = /if \(x > 0\) \{[\s\n]*console\.log\("positive"\);[\s\n]*\} else \{[\s\n]*console\.log\("negative"\);[\s\n]*\}/;
  const output = transpile(input);
  assert(expected.test(output), `Expected if-else pattern, got: ${output}`);
});

// Test 4: Bangla Numbers Conversion
test('Numbers: Convert Bangla Digits', () => {
  const input = '১ + ২৩ = ২৪';
  const expected = '1 + 23 = 24';
  const output = convertBanglaNumbers(input);
  assert(output === expected, `Expected '${expected}', got: '${output}'`);
});

// Test 5: Identifier Transliteration
test('Transliterate: বাংলা নাম → Latin', () => {
  const input = 'নাম';
  const expected = 'nam';
  const output = transliterateBanglaToLatin(input);
  assert(output === expected, `Expected '${expected}', got: '${output}'`);
});

test('Transliterate: Complex Word মাহমুদ → mahmud', () => {
  const input = 'মাহমুদ';
  const expected = 'mahmud';
  const output = transliterateBanglaToLatin(input);
  assert(output === expected, `Expected '${expected}', got: '${output}'`);
});

// Test 6: Transliterate New Word
test('Transliterate: লাল → lal', () => {
  const input = 'লাল';
  const expected = 'lal';
  const output = transliterateBanglaToLatin(input);
  assert(output === expected, `Expected '${expected}', got: '${output}'`);
});

// Test 7: Full Transliteration in Code (Variables)
test('TranslateBanglaToJS: Variable Names', () => {
  const input = 'বাক্য নাম = "মাহমুদ"; লিখো(নাম);';
  const expected = /let nam = "মাহমুদ";[\s\n]*console\.log\(nam\);/;
  const output = transpile(input);
  assert(expected.test(output), `Expected transliterated vars, got: ${output}`);
});

// Test 8: Syntax Validation
test('Validation: Valid Code', () => {
  const input = 'বাক্য x = 1; { y = 2; }';
  const validation = validateBanglaScript(input);
  assert(validation.valid, 'Expected valid code');
});

test('Validation: Unmatched Bracket', () => {
  const input = 'বাক্য x = 1; (';
  const validation = validateBanglaScript(input);
  assert(!validation.valid, 'Expected invalid due to unmatched bracket');
  assert(validation.errors.length > 0, 'Expected errors array');
});

// Test 9: Code Stats
test('Stats: Basic Code', () => {
  const input = '// comment\nবাক্য x=1;\n// another comment\n';
  const stats = getCodeStats(input);
  assert(stats.totalLines === 4, `Expected 4 lines, got: ${stats.totalLines}`);
  assert(stats.codeLines === 1, `Expected 1 code line, got: ${stats.codeLines}`);
  assert(stats.commentLines === 2, `Expected 2 comments, got: ${stats.commentLines}`);
});

// Test 10: Full Transpilation with Source Map
test('TranspileWithSourceMap: Basic', () => {
  const input = 'বাক্য x = 1; লিখো(x);';
  const result = transpileWithSourceMap(input, 'test.bjs');
  assert(result.code.includes('let x = 1'), `Expected let in code: ${result.code}`);
  assert(result.map !== null, 'Expected source map');
  assert(result.map.sourcesContent[0] === input, 'Expected original source in map');
});

// Test 11: Complex Example Transpilation
test('Full Example: Function + Loop + If', () => {
  const input = `
অনুষ্ঠান গুণন(a, b) {
  ফেরত a * b;
}

বাক্য সংখ্যা = ৫;
জন্য (বাক্য i = ১; i <= সংখ্যা; i++) {
  যদি (গুণন(i, ২) > ৫) {
    লিখো("বড়");
  } নাহলে {
    লিখো("ছোট");
  }
}
  `;
  const output = transpile(input);
  const expectedPatterns = [
    /function gunon\(a, b\) \{ return a \* b; \}/,
    /let songkha = 5;/,
    /for \(let i = 1; i <= songkha; i\+\+ \) \{/,
    /if \(gunon\(i, 2\) > 5\) \{ console\.log\("বড়"\); \} else \{ console\.log\("ছোট"\); \}/
  ];
  expectedPatterns.forEach((pattern, idx) => {
    assert(pattern.test(output), `Pattern ${idx + 1} failed: ${pattern}`);
  });
});

// Test 12: Edge Case - Empty Code
test('Transpile: Empty String', () => {
  const input = '';
  const output = transpile(input);
  assert(output === '', 'Expected empty output');
});

// Test 13: Error Handling in Transpile
test('Transpile: Invalid Syntax', () => {
  const input = 'বাক্য x = ;';
  try {
    transpile(input);
    assert(false, 'Expected error on invalid syntax');
  } catch (error) {
    assert(error.message.includes('Transpilation Error'), `Expected transpilation error, got: ${error.message}`);
  }
});

// Test 14: Transliterate Invalid Start (Number)
test('Transliterate: Starts with Number', () => {
  const input = '১নাম';
  const expected = '_1nam';
  const output = transliterateBanglaToLatin(input);
  assert(output === expected, `Expected '${expected}', got: '${output}'`);
});

// Test 15: Transliterate with Implicit Vowel Fix
test('Transliterate: পরিবার → paribar', () => {
  const input = 'পরিবার';
  const expected = 'paribar';
  const output = transliterateBanglaToLatin(input);
  assert(output === expected, `Expected '${expected}', got: '${output}'`);
});

// New Test 16: No Transliteration Option
test('No Transliteration: Keep Bangla Identifiers', () => {
  const input = 'বাক্য নাম = "মাহমুদ"; লিখো(নাম);';
  const output = transpileWithSourceMap(input, 'test.bjs', true).code;
  assert(output.includes('নাম'), `Expected 'নাম' to remain, got: ${output}`);
});

// New Test 17: CLI Build Command
test('CLI: Build Command', () => {
  const testDir = path.join(__dirname, 'test_temp');
  const testFile = path.join(testDir, 'test.bjs');
  const outDir = path.join(testDir, 'build');
  fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(testFile, 'বাক্য x = 1; লিখো(x);');

  const result = doBuild(testFile, outDir);
  assert(result && fs.existsSync(result), `Expected output file at ${result}`);
  const output = fs.readFileSync(result, 'utf8');
  assert(output.includes('let x = 1'), `Expected 'let x = 1' in output, got: ${output}`);

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
});

// New Test 18: CLI Run Command
test('CLI: Run Command', () => {
  const testDir = path.join(__dirname, 'test_temp');
  const testFile = path.join(testDir, 'test.bjs');
  const outDir = path.join(testDir, 'build');
  fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(testFile, 'লিখো("Hello from BanglaScript!");');

  const result = doBuild(testFile, outDir);
  assert(result && fs.existsSync(result), `Expected output file at ${result}`);

  const runResult = spawnSync(process.execPath, [result], { encoding: 'utf8' });
  assert(runResult.stdout.includes('Hello from BanglaScript!'), `Expected 'Hello from BanglaScript!' in output, got: ${runResult.stdout}`);

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
});

// New Test 19: Init Project
test('Init: Project Structure', () => {
  const testDir = path.join(__dirname, 'test_project');
  initProject('test_project');

  assert(fs.existsSync(testDir), 'Expected project directory to be created');
  assert(fs.existsSync(path.join(testDir, 'src', 'main.bjs')), 'Expected main.bjs to exist');
  assert(fs.existsSync(path.join(testDir, 'package.json')), 'Expected package.json to exist');
  assert(fs.existsSync(path.join(testDir, 'README.md')), 'Expected README.md to exist');

  const mainBjs = fs.readFileSync(path.join(testDir, 'src', 'main.bjs'), 'utf8');
  assert(mainBjs.includes('শ্রেণী মানুষ'), 'Expected class example in main.bjs');
  assert(mainBjs.includes('অ্যাসিঙ্ক অনুষ্ঠান'), 'Expected async example in main.bjs');

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
});

// New Test 20: CLI Watch Command Simulation
test('CLI: Watch Command Simulation', () => {
  const testDir = path.join(__dirname, 'test_temp');
  const testFile = path.join(testDir, 'test.bjs');
  const outDir = path.join(testDir, 'build');
  fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(testFile, 'বাক্য x = 1; লিখো(x);');

  const result = doBuild(testFile, outDir);
  assert(result && fs.existsSync(result), `Expected output file at ${result}`);

  // Simulate file change
  fs.writeFileSync(testFile, 'বাক্য x = 2; লিখো(x);');
  const newResult = doBuild(testFile, outDir);
  assert(newResult && fs.existsSync(newResult), `Expected new output file at ${newResult}`);
  const output = fs.readFileSync(newResult, 'utf8');
  assert(output.includes('let x = 2'), `Expected 'let x = 2' in output, got: ${output}`);

  // Cleanup
  fs.rmSync(testDir);
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`🧪 Test Summary:`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  📊 Total: ${passed + failed}`);
if (failed === 0) {
  console.log('🎉 All tests passed! Transpiler is working correctly.');
} else {
  console.log('⚠️  Some tests failed. Check the errors above.');
  process.exit(1);
}