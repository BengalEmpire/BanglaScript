const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const path = require('path');
const { translateBanglaToJS, convertBanglaNumbers, transliterateBanglaToLatin, hasBanglaCharacters } = require('./translate-words');
const { tokenizePreserve } = require('./tokenizer');

// BanglaScript Keywords Mapping
const KEYWORDS = {
  'সংখ্যা': 'let',
  'শব্দ': 'let',
  'বাক্য': 'let',
  'চলক': 'let',
  'পরিবর্তনশীল': 'var',
  'ধ্রুবক': 'const',
  'অনুষ্ঠান': 'function',
  'ফাংশন': 'function',
  'প্রেরণ': 'return',
  'ফেরত': 'return',
  'যদি': 'if',
  'নাহলে': 'else',
  'অন্যথায়': 'else',
  'নাহলে_যদি': 'else if',
  'যখন': 'while',
  'জন্য': 'for',
  'প্রতিটি': 'for',
  'করো': 'do',
  'থামাও': 'break',
  'চালিয়ে_যাও': 'continue',
  'নতুন': 'new',
  'শ্রেণী': 'class',
  'ক্লাস': 'class',
  'গঠন': 'constructor',
  'লিখো': 'console.log',
  'ছাপাও': 'console.log',
  'সমস্যা_লিখো': 'console.error',
  'সতর্কতা': 'console.warn',
  'তথ্য': 'console.info',
  'সত্য': 'true',
  'মিথ্যা': 'false',
  'শূন্য': 'null',
  'শুন্য': 'null',
  'অনির্ধারিত': 'undefined',
  'চেষ্টা': 'try',
  'ধরো': 'catch',
  'অবশেষে': 'finally',
  'ফেলা': 'throw',
  'অপেক্ষা': 'await',
  'অ্যাসিঙ্ক': 'async',
  'সুইচ': 'switch',
  'কেস': 'case',
  'ডিফল্ট': 'default',
  'আমদানি': 'import',
  'রপ্তানি': 'export',
  'থেকে': 'from',
  'হিসেবে': 'as',
  'মুছো': 'delete',
  'ইন': 'in',
  'অফ': 'of',
  'এটি': 'this',
  'বিস্তৃত': 'extends',
  'স্ট্যাটিক': 'static',
  'স্থির': 'static'
};

/**
 * BanglaScript থেকে JavaScript এ transpile করে (Source Map সহ) - tokenizer ব্যবহার করে
 */
function transpileWithSourceMap(banglaCode, filename = 'source.bjs') {
  if (!banglaCode || !banglaCode.trim()) {
    return { code: '', map: null };
  }

  try {
    // Tokenize and transpile keywords, identifiers, numbers
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
      plugins: ['flow', 'jsx'],
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
    throw new Error(`Transpilation Error: ${error.message}\n${error.stack || ''}`);
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