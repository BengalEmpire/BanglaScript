const assert = require('assert');
const { transpile } = require('../lib/transpile-ast');

function normalize(code) {
  return code.replace(/\s+/g, ' ').trim();
}

// Test case 1: Basic console.log
const banglaCode1 = `লিখো('হ্যালো ওয়ার্ল্ড');`;
const expected1 = `console.log('হ্যালো ওয়ার্ল্ড');`;
assert.strictEqual(normalize(transpile(banglaCode1)), normalize(expected1), 'Basic log test failed');

// Test case 2: Variable declaration
const banglaCode2 = `সংখ্যা রোল = ৫;`;
const expected2 = `let rol = 5;`;
assert.strictEqual(normalize(transpile(banglaCode2)), normalize(expected2), 'Variable declaration test failed');

// Test case 3: If statement
const banglaCode3 = `যদি (rol > ০) { লিখো('পজিটিভ'); }`;
const expected3 = `if (rol > 0) { console.log('পজিটিভ'); }`;
assert.strictEqual(normalize(transpile(banglaCode3)), normalize(expected3), 'If statement test failed');

// Test case 4: Function
const banglaCode4 = `অনুষ্ঠান add(a, b) { ফিরিয়ে_দাও a + b; }`;
const expected4 = `function add(a, b) { return a + b; }`;
assert.strictEqual(normalize(transpile(banglaCode4)), normalize(expected4), 'Function test failed');

// Test case 5: Loop
const banglaCode5 = `জন্য (সংখ্যা i = ০; i < ৫; i++) { লিখো(i); }`;
const expected5 = `for (let i = 0; i < 5; i++) { console.log(i); }`;
assert.strictEqual(normalize(transpile(banglaCode5)), normalize(expected5), 'For loop test failed');

console.log('All tests passed!');