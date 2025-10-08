const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const path = require('path');
const { translateBanglaToJS, convertBanglaNumbers } = require('./translate-words');

// BanglaScript Keywords Mapping
const KEYWORDS = {

  // Variable declarations
  'বাক্য': 'let',
  'সংখ্যা': 'let',
  'চলক': 'let',
  'ধ্রুবক': 'const',
  'পরিবর্তনশীল': 'var',
 
  // Function
  'অনুষ্ঠান': 'function',
  'ফাংশন': 'function',
  'প্রেরণ': 'return',
  'ফেরত': 'return',
 
  // Control flow
  'যদি': 'if',
  'নাহলে': 'else',
  'অন্যথায়': 'else',
  'নাহলে_যদি': 'else if',
 
  // Loops
  'যখন': 'while',
  'জন্য': 'for',
  'প্রতিটি': 'for',
  'করো': 'do',
  'থামাও': 'break',
  'চালিয়ে_যাও': 'continue',
 
  // OOP
  'নতুন': 'new',
  'শ্রেণী': 'class',
  'ক্লাস': 'class',
  'গঠন': 'constructor',
  'এটি': 'this',
  'বিস্তৃত': 'extends',
  'স্ট্যাটিক': 'static',
  'স্থির': 'static',
 
  // Console methods
  'লিখো': 'console.log',
  'ছাপাও': 'console.log',
  'সমস্যা_লিখো': 'console.error',
  'সতর্কতা': 'console.warn',
  'তথ্য': 'console.info',
 
  // Boolean & null
  'সত্য': 'true',
  'মিথ্যা': 'false',
  'শূন্য': 'null',
  'অনির্ধারিত': 'undefined',
 
  // Error handling
  'চেষ্টা': 'try',
  'ধরো': 'catch',
  'অবশেষে': 'finally',
  'ফেলা': 'throw',
 
  // Async
  'অপেক্ষা': 'await',
  'অ্যাসিঙ্ক': 'async',
  'প্রতিজ্ঞা': 'Promise',
 
  // Switch
  'সুইচ': 'switch',
  'কেস': 'case',
  'ডিফল্ট': 'default',
 
  // Types
  'টাইপ': 'typeof',
  'ইনস্ট্যান্স': 'instanceof',
 
  // Import/Export
  'আমদানি': 'import',
  'রপ্তানি': 'export',
  'থেকে': 'from',
  'হিসেবে': 'as',
 
  // Others
  'ডিবাগ': 'debugger',
  'মুছো': 'delete',
  'ভ্যাড': 'void',
  'ইন': 'in',
  'অফ': 'of'
};

/**
 * BanglaScript কোড থেকে বাংলা keywords খুঁজে বের করে JavaScript এ রূপান্তর করে
 */
function preprocessBanglaKeywords(code) {
  let result = code;
 
  // নাহলে_যদি কে else if এ রূপান্তর (আগে করতে হবে কারণ এটি দুই শব্দ)
  result = result.replace(/নাহলে_যদি/g, 'else if');
 
  // সব keywords replace করো
  const wordChar = '[a-zA-Z0-9_$\\u0980-\\u09FF]';
  for (const [bangla, english] of Object.entries(KEYWORDS)) {
    if (bangla === 'নাহলে_যদি') continue; // ইতিমধ্যে done
   
    // Word boundary দিয়ে replace করো যাতে partial match না হয়
    const escaped = escapeRegExp(bangla);
    const regex = new RegExp(`(?< !${wordChar})${escaped}(? !${wordChar})`, 'gu');
    result = result.replace(regex, english);
  }
 
  return result;
}

/**
 * BanglaScript থেকে JavaScript এ transpile করে (Source Map সহ)
 */
function transpileWithSourceMap(banglaCode, filename = 'source.bjs') {
  if (!banglaCode || !banglaCode.trim()) {
    return { code: '', map: null };
  }

  try {
    // Step 1: Bangla numbers convert
    let preprocessed = convertBanglaNumbers(banglaCode);
    
    // Step 2: Keywords preprocess
    preprocessed = preprocessBanglaKeywords(preprocessed);
    
    // Step 3: Identifiers transliterate (variables, functions, etc.)
    preprocessed = translateBanglaToJS(preprocessed);
   
    // Step 4: Fix dangling statements (add ; for test cases)
    preprocessed = preprocessed.replace(/^(let|const|var|return|if|for|while|function|class|try|switch|do)\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*(=.*)?$/gm, '$&;');

    // Step 5: JavaScript code কে parse করো AST তে
    const ast = parser.parse(preprocessed, {
      sourceType: 'module',
      plugins: [],
      errorRecovery: true
    });
   
    // Step 6: AST থেকে JavaScript code generate করো
    const output = generate(ast, {
      sourceMaps: true,
      sourceFileName: filename
    }, preprocessed);
   
    // Step 7: Source map এ original source যোগ করো
    if (output.map) {
      output.map.sourcesContent = [banglaCode];
     
      // Source map reference যোগ করো generated code এর শেষে
      const sourceMapComment = `\n//# sourceMappingURL=${path.basename(filename)}.map`;
      output.code += sourceMapComment;
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
 * শুধু transpile করে (Source Map ছাড়া) - সহজ version
 */
function transpile(banglaCode) {
  const result = transpileWithSourceMap(banglaCode);
  return result.code;
}

module.exports = { transpile, transpileWithSourceMap, KEYWORDS };