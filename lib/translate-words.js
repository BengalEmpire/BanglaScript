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
    } else {
      result += '';
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
    'new', 'delete', 'typeof', 'void', 'yield'
  ];
  if (reserved.includes(translit.toLowerCase())) {
    translit = `bs_${translit}`;
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
    variables: ['বাক্য', 'সংখ্যা', 'চলক', 'ধ্রুবক', 'পরিবর্তনশীল'],
    functions: ['অনুষ্ঠান', 'ফাংশন', 'প্রেরণ', 'ফেরত'],
    controlFlow: ['যদি', 'নাহলে', 'অন্যথায়', 'নাহলে_যদি'],
    loops: ['যখন', 'জন্য', 'প্রতিটি', 'করো', 'থামাও', 'চালিয়ে_যাও'],
    oop: ['নতুন', 'শ্রেণী', 'ক্লাস', 'গঠন', 'এটি', 'বিস্তৃত', 'স্ট্যাটিক'],
    console: ['লিখো', 'ছাপাও', 'সমস্যা_লিখো', 'সতর্কতা', 'তথ্য'],
    boolean: ['সত্য', 'মিথ্যা', 'শূন্য', 'অনির্ধারিত'],
    errorHandling: ['চেষ্টা', 'ধরো', 'অবশেষে', 'ফেলা'],
    async: ['অপেক্ষা', 'অ্যাসিঙ্ক', 'প্রতিজ্ঞা'],
    switch: ['সুইচ', 'কেস', 'ডিফল্ট'],
    types: ['টাইপ', 'ইনস্ট্যান্স'],
    importExport: ['আমদানি', 'রপ্তানি', 'থেকে', 'হিসেবে'],
    others: ['ডিবাগ', 'মুছো', 'ভ্যাড', 'ইন', 'অফ']
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