const { tokenizePreserve } = require('./tokenizer');
const { COMMON_MAP } = require('./common_map');
const { BANGLA_TO_LATIN } = require('./banglaToLatin')

function transliterateSingle(text) {
  const cleaned = text.trim();
  if (COMMON_MAP[cleaned]) return COMMON_MAP[cleaned];

  let result = '';
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (/[a-zA-Z0-9_$]/.test(char)) {
      result += char;
    } else if (BANGLA_TO_LATIN[char]) {
      result += BANGLA_TO_LATIN[char];
    }
  }

  // Insert implicit 'a' between consecutive consonants
  result = result.replace(/([bcdfghjklmnpqrstvwxyz])([bcdfghjklmnpqrstvwxyz])/gi, '$1a$2');

  // Specific phonetic fixes
  result = result.replace(/pribar/g, 'paribar');
  result = result.replace(/shong/g, 'sang');
  result = result.replace(/khub/g, 'khub');

  if (/^[0-9]/.test(result)) result = '_' + result;
  if (!result) result = 'bangla_var';
  return result;
}

function transliterateBanglaToLatin(text) {
  if (!hasBanglaCharacters(text)) return text;
  const parts = text.split(/\s+/);
  if (parts.length > 1) {
    return parts.map(transliterateSingle).filter(Boolean).join('_');
  }
  return transliterateSingle(text);
}

function sanitizeBanglaIdentifier(identifier) {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(identifier)) {
    return identifier;
  }

  let translit = transliterateBanglaToLatin(identifier);
  const reserved = [
    'let', 'const', 'var', 'function', 'if', 'else', 'for', 'while', 'return', 'class',
    'try', 'catch', 'finally', 'throw', 'async', 'await', 'switch', 'case', 'default',
    'new', 'delete', 'typeof', 'void', 'yield',   'break', 'continue', 'do', 'import', 'export', 'from', 'as', 'extends', 'super',
    'this', 'static', 'get', 'set', 'in', 'of', 'instanceof', 'debugger', 'with',
    'null', 'true', 'false', 'undefined', 'NaN', 'Infinity'
  ];
  if (reserved.includes(translit.toLowerCase())) {
    translit = `bs_${translit}`;
  }
  // Ensure valid JS identifier
  translit = translit.replace(/[^a-zA-Z0-9_$]/g, '_');
  if (!/^[a-zA-Z_$]/.test(translit)) {
    translit = '_' + translit;
  }
  return translit;
}

function translateBanglaToJS(code) {
  const tokens = tokenizePreserve(code);
  return tokens.map(t => {
    if (t.type !== 'word') return t.text;
    return sanitizeBanglaIdentifier(t.text);
  }).join('');
}

function convertBanglaNumbers(text) {
  const banglaDigits = '০১২৩৪৫৬৭৮৯';
  const englishDigits = '0123456789';
 
  let result = text;
 
  for (let i = 0; i < banglaDigits.length; i++) {
    const regex = new RegExp(banglaDigits[i], 'g');
    result = result.replace(regex, englishDigits[i]);
  }
 
  return result;
}

function hasBanglaCharacters(text) {
  return /[\u0980-\u09FF]/.test(text);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getBanglaKeywords() {
  return {
    variables: ['বাক্য', 'সংখ্যা', 'চলক', 'ধ্রুবক', 'পরিবর্তনশীল', 'শব্দ', 'ব্যাক্তি'],
    functions: ['অনুষ্ঠান', 'ফাংশন', 'প্রেরণ', 'ফেরত', 'ফিরিয়ে_দাও'],
    controlFlow: ['যদি', 'নাহলে', 'অন্যথায়', 'নাহলে_যদি'],
    loops: ['যখন', 'জন্য', 'প্রতিটি', 'করো', 'থামাও', 'চালিয়ে_যাও', 'পুনরাবৃত্তি'],
    oop: ['নতুন', 'শ্রেণী', 'ক্লাস', 'গঠন', 'নির্মাতা', 'এটি', 'এই', 'বিস্তৃত', 'সম্প্রসারিত', 'স্ট্যাটিক', 'স্থির', 'সুপার', 'অতিক্লাস'],
    console: ['লিখো', 'ছাপাও', 'প্রিন্ট', 'দেখাও', 'সমস্যা_লিখো', 'ত্রুটি', 'সতর্কতা', 'সাবধান', 'তথ্য', 'পরিষ্কার'],
    boolean: ['সত্য', 'মিথ্যা', 'শূন্য', 'শুন্য', 'অনির্ধারিত', 'অসংজ্ঞায়িত'],
    errorHandling: ['চেষ্টা', 'চেষ্টা_করো', 'ধরো', 'ধরা', 'অবশেষে', 'শেষে', 'ফেলা', 'নিক্ষেপ', 'ছুড়ে_দাও'],
    async: ['অপেক্ষা', 'অপেক্ষা_করো', 'অ্যাসিঙ্ক', 'অসমকালীন', 'প্রমিজ', 'প্রতিশ্রুতি'],
    switch: ['সুইচ', 'পরিবর্তন', 'কেস', 'ক্ষেত্র', 'ডিফল্ট', 'সাধারণ'],
    types: ['টাইপ', 'ধরন', 'কিসের', 'ইনস্ট্যান্স', 'উদাহরণ', 'ভ্যাড', 'শূন্যতা'],
    importExport: ['আমদানি', 'আনো', 'রপ্তানি', 'রফতানি', 'পাঠাও', 'থেকে', 'হিসেবে', 'হিসাবে', 'যেমন'],
    others: ['ডিবাগ', 'থামো', 'মুছো', 'মুছে_ফেলো', 'ইন', 'ভিতরে', 'মধ্যে', 'অফ', 'মধ্য', 'এর']
  };
}

function getTokenType(word) {
  const keywords = getBanglaKeywords();
 
  for (const [type, words] of Object.entries(keywords)) {
    if (words.includes(word)) {
      return type;
    }
  }
 
  return 'identifier';
}

function validateBanglaScript(code) {
  const errors = [];
  const stacks = {
    '(': [],
    '[': [],
    '{': []
  };
  const closers = {
    ')': '(',
    ']': '[',
    '}': '{'
  };
  let currentLine = 1;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === '\n') {
      currentLine++;
      continue;
    }
    if (Object.keys(stacks).includes(char)) {
      stacks[char].push(currentLine);
    } else if (Object.keys(closers).includes(char)) {
      const expected = closers[char];
      if (stacks[expected].length === 0) {
        errors.push({ message: `Unmatched closing ${char}`, line: currentLine });
      } else {
        stacks[expected].pop();
      }
    }
  }
  for (const [open, stack] of Object.entries(stacks)) {
    if (stack.length > 0) {
      errors.push({ message: `Unmatched opening ${open}`, line: stack[stack.length - 1] });
    }
  }
  return { valid: errors.length === 0, errors };
}

function getCodeStats(code) {
  const lines = code.split(/\r?\n/);
  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed === '') {
      blankLines++;
    } else if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      commentLines++;
    } else {
      codeLines++;
    }
  });
  return {
    totalLines: lines.length,
    codeLines,
    commentLines,
    blankLines,
    characters: code.length
  };
}

module.exports = { 
  translateBanglaToJS, 
  convertBanglaNumbers, 
  getBanglaKeywords, 
  getTokenType, 
  transliterateBanglaToLatin, 
  sanitizeBanglaIdentifier,
  validateBanglaScript,
  getCodeStats,
  escapeRegExp,
  hasBanglaCharacters,
  COMMON_MAP,
  BANGLA_TO_LATIN 
};