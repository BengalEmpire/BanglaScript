const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const path = require('path');
const { translateBanglaToJS, convertBanglaNumbers, transliterateBanglaToLatin, hasBanglaCharacters } = require('./translate-words');
const { tokenizePreserve } = require('./tokenizer');
const { KEYWORDS } = require('./keywords');


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
      plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties', 'asyncGenerators'],  // Removed 'flow' to avoid conflict
      errorRecovery: true
    });

    // Generate JS code with source map
    const output = generate(ast, {
      sourceMaps: true,
      sourceFileName: filename,
      compact: false,
      comments: true
    }, preprocessed);

    if (output.map) {
      output.map.sourcesContent = [banglaCode];
    }

    return {
      code: output.code,
      map: output.map
    };

  } catch (error) {
    let approxLine = 0;
    if (error.loc && typeof error.loc.index === 'number') {
      approxLine = banglaCode.substring(0, error.loc.index).split('\n').length;
    }
    throw new Error(`Transpilation Error at line ${approxLine || '?'}: ${error.message}`);
  }
}


function transpile(banglaCode, noTranslit = false) {
  const result = transpileWithSourceMap(banglaCode, 'source.bjs', noTranslit);
  return result.code;
}

module.exports = { transpile, transpileWithSourceMap, KEYWORDS };