const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const babel = require('@babel/core');
const path = require('path');
const fs = require('fs');
const { bengaliDigitsToAscii, isUnicodeLetter } = require('./utils');


const KEYWORDS = {
  'সংখ্যা': 'let',
  'বাক্য': 'let',
  'ধ্রুবক': 'const',
  'অনুষ্ঠান': 'function',
  'প্রেরণ': 'return',
  'যদি': 'if',
  'নাহলে': 'else',
  'অন্যথায়': 'else',
  'যখন': 'while',
  'জন্য': 'for',
  'থামাও': 'break',
  'চালিয়ে_যাও': 'continue',
  'নতুন': 'new',
  'শ্রেণী': 'class',
  'গঠন': 'constructor',
  'লিখো': 'console.log',
  'সমস্যা_লিখো': 'console.error',
  'পাওয়া': 'console.info',
  'পাঠাও': 'console.warn',
  'সত্য': 'true',
  'মিথ্যা': 'false',
  'শূন্য': 'null',
  'শুন্য': 'null',
  'চেষ্টা': 'try',
  'ধরো': 'catch',
  'অবশেষে': 'finally',
  'ফেলা': 'throw',
  'অপেক্ষা': 'await',
  'প্রতিজ্ঞা': 'Promise'
};

// Tokenizer that preserves strings & comments (lightweight)
function tokenizePreserve(code) {
  const tokens = [];
  const n = code.length;
  let i = 0;

  while (i < n) {
    const ch = code[i];

    // strings
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      let esc = false;
      while (j < n) {
        const c = code[j];
        if (esc) { esc = false; j++; continue; }
        if (c === '\\') { esc = true; j++; continue; }
        if (c === quote) { j++; break; }
        j++;
      }
      tokens.push({ type: 'string', text: code.slice(i, j) });
      i = j;
      continue;
    }

    // comments
    if (ch === '/' && code[i+1] === '/') {
      let j = i + 2;
      while (j < n && code[j] !== '\n') j++;
      tokens.push({ type: 'comment', text: code.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === '/' && code[i+1] === '*') {
      let j = i + 2;
      while (j < n && !(code[j] === '*' && code[j+1] === '/')) j++;
      j += 2;
      if (j > n) j = n;
      tokens.push({ type: 'comment', text: code.slice(i, j) });
      i = j;
      continue;
    }

    // numbers
    if (/[0-9\u09E6-\u09EF]/.test(ch)) {
      let j = i + 1;
      while (j < n && (/[0-9\u09E6-\u09EF]/.test(code[j]) || code[j] === '.')) j++;
      tokens.push({ type: 'number', text: code.slice(i, j) });
      i = j;
      continue;
    }

    // words
    if (isUnicodeLetter(ch) || ch === '_' || ch === '$') {
      let j = i + 1;
      while (j < n) {
        const c = code[j];
        if (isUnicodeLetter(c) || c === '_' || c === '$' || /[0-9\u09E6-\u09EF]/.test(c)) { j++; continue; }
        break;
      }
      tokens.push({ type: 'word', text: code.slice(i, j) });
      i = j;
      continue;
    }

    // symbol/whitespace
    tokens.push({ type: 'symbol', text: ch });
    i++;
  }

  return tokens;
}

// Map tokens -> interim JS source (string)
function tokensToInterimJS(tokens) {
  return tokens.map(t => {
    if (t.type === 'string' || t.type === 'comment') return t.text;
    if (t.type === 'word') {
      if (KEYWORDS.hasOwnProperty(t.text)) return KEYWORDS[t.text];
      return t.text;
    }
    if (t.type === 'number') {
      return bengaliDigitsToAscii(t.text);
    }
    return t.text;
  }).join('');
}

// Main transpile function with source map generation
function transpileWithSourceMap(code_bjs, sourceFileName = 'input.bjs') {
  // 1) tokenize & build interim JS string
  const tokens = tokenizePreserve(code_bjs);
  const interimJS = tokensToInterimJS(tokens);

    // 2) parse interim JS to AST
  const ast = parse(interimJS, { sourceType: 'module', plugins: ['jsx', 'classProperties'] });

  // 3) (optional) you can run Babel transforms here if needed (not changing content now)
  // 4) generate code + source map mapping to the interimJS (we will try to make source map reference original .bjs)
  const gen = generate(ast, {
    sourceMaps: true,
    sourceFileName: sourceFileName + '.interim.js' // intermediate name
  }, interimJS);

    // Modify the source map to reference original .bjs file instead of interimJS
  const map = gen.map; // existing map object
  map.sources = [sourceFileName];
  map.sourcesContent = [code_bjs];

  // 5) final code (include sourceMappingURL comment)
  const code = gen.code + `\n//# sourceMappingURL=${path.basename(sourceFileName)}.map`;

  return { code, map };
}

module.exports = { transpileWithSourceMap };