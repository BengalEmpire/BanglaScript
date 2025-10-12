const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const path = require('path');
const { translateBanglaToJS, convertBanglaNumbers, transliterateBanglaToLatin, hasBanglaCharacters } = require('./translate-words');
const { tokenizePreserve } = require('./tokenizer');
const { KEYWORDS } = require('./keywords');

// BanglaScript Keywords Mapping


/**
 * BanglaScript থেকে JavaScript এ transpile করে (Source Map সহ) - tokenizer ব্যবহার করে
 */
function transpileWithSourceMap(banglaCode, filename = 'source.bjs') {
  if (!banglaCode || !banglaCode.trim()) {
    return { code: '', map: null };
  }

  try {
    // Tokenize and transpile...
    const tokens = tokenizePreserve(banglaCode);
    let preprocessed = tokens.map(t => {
      if (t.type === 'string' || t.type === 'comment') return t.text;
      if (t.type === 'number') return convertBanglaNumbers(t.text);
      if (t.type === 'word') {
        const norm = t.text;
        if (KEYWORDS[norm]) return KEYWORDS[norm];
        if (hasBanglaCharacters(norm)) return transliterateBanglaToLatin(norm);
        return norm;
      }
      return t.text;
    }).join('');

    // Fix dangling statements (add ; for test cases if needed)
    preprocessed = preprocessed.replace(/^(let|const|var|return|if|for|while|function|class|try|switch|do)\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*(=.*)?$/gm, '$&;');

    // Parse to AST
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
   
    // Add original source to map
    if (output.map) {
      output.map.sourcesContent = [banglaCode];
      const sourceMapComment = `\n//# sourceMappingURL=${path.basename(filename)}.map`;
      if (filename !== 'source.bjs') {
        output.code += sourceMapComment;
      }
    }
   
    return {
      code: output.code,
      map: output.map
    };
   
  } catch (error) {
    const line = getLineNumber(preprocessed, error.loc ? error.loc.index : 0);
    throw new Error(`Transpilation Error at line ${line}: ${error.message}\n${error.stack || ''}`);
  }
}

/**
 * শুধু transpile করে (Source Map ছাড়া)
 */
function transpile(banglaCode) {
  const result = transpileWithSourceMap(banglaCode);
  return result.code;
}

module.exports = { transpile, transpileWithSourceMap, KEYWORDS };