const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const path = require('path');
const { translateBanglaToJS, convertBanglaNumbers, transliterateBanglaToLatin, hasBanglaCharacters } = require('./translate-words');
const { tokenizePreserve } = require('./tokenizer');
const { KEYWORDS } = require('./keywords');

/**
 * Transpiles BanglaScript to JavaScript with optional source map.
 * @param {string} banglaCode - The BanglaScript code.
 * @param {string} [filename='source.bjs'] - Source filename for map.
 * @param {boolean} [noTranslit=false] - If true, do not transliterate identifiers.
 * @returns {{code: string, map: object|null}}
 */
function transpileWithSourceMap(banglaCode, filename = 'source.bjs', noTranslit = false) {
  if (!banglaCode || !banglaCode.trim()) {
    return { code: '', map: null };
  }

  try {
    const tokens = tokenizePreserve(banglaCode);
    const preprocessed = tokens.map(t => {
      if (t.type === 'string' || t.type === 'comment' || t.type === 'regex') {
        return t.text;
      }
      if (t.type === 'number') {
        return convertBanglaNumbers(t.text);
      }
      if (t.type === 'word') {
        const norm = t.text;
        if (KEYWORDS[norm]) {
          return KEYWORDS[norm];
        }
        if (!noTranslit && hasBanglaCharacters(norm)) {
          return transliterateBanglaToLatin(norm);
        }
        return norm;
      }
      return t.text;
    }).join('');

    // Parse the preprocessed code to AST
    const ast = parser.parse(preprocessed, {
      sourceType: 'module',
      plugins: ['flow', 'jsx', 'typescript', 'decorators-legacy', 'classProperties', 'asyncGenerators'],
      errorRecovery: true
    });

    // Generate JS code with source map
    const output = generate(ast, {
      sourceMaps: true,
      sourceFileName: filename,
      compact: false,
      comments: true
    }, preprocessed);

    // Attach original source content to map
    if (output.map) {
      output.map.sourcesContent = [banglaCode];
    }

    return {
      code: output.code,
      map: output.map
    };

  } catch (error) {
    const approxLine = error.loc ? (preprocessed.substring(0, error.loc.index).split('\n').length) : 0;
    throw new Error(`Transpilation Error at approximate original line ${approxLine}: ${error.message}`);
  }
}

/**
 * Transpiles BanglaScript to JavaScript without source map.
 * @param {string} banglaCode - The BanglaScript code.
 * @param {boolean} [noTranslit=false] - If true, do not transliterate identifiers.
 * @returns {string}
 */
function transpile(banglaCode, noTranslit = false) {
  const result = transpileWithSourceMap(banglaCode, 'source.bjs', noTranslit);
  return result.code;
}

module.exports = { transpile, transpileWithSourceMap, KEYWORDS };