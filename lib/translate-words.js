const { tokenizePreserve } = require("./tokenizer");
const { BANGLA_TO_LATIN, CONJUNCTS_MAP } = require("./banglaToLatin");

let COMMON_MAP = {};
try {
  ({ COMMON_MAP } = require("./common_map"));
} catch (e) {
  COMMON_MAP = {};
}

// Fast mapping lookup for digits
const BANGLA_DIGITS = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

/**
 * Transliterate a single Bangla word into clean Latin characters
 * @param {string} text - Bangla word
 * @returns {string} - Transliterated Latin word
 */
function transliterateSingle(text) {
  const cleaned = text.trim();
  if (!cleaned) return "bangla_var";
  if (COMMON_MAP[cleaned]) return COMMON_MAP[cleaned];

  let result = "";
  let i = 0;
  const len = cleaned.length;

  while (i < len) {
    // 1. Check for 3-character or 2-character conjuncts (e.g. ক্ষ, জ্ঞ, ষ্ণ, etc.)
    let matchedConjunct = false;
    for (let cLen = 4; cLen >= 2; cLen--) {
      if (i + cLen <= len) {
        const sub = cleaned.slice(i, i + cLen);
        if (CONJUNCTS_MAP && CONJUNCTS_MAP[sub]) {
          result += CONJUNCTS_MAP[sub];
          i += cLen;
          matchedConjunct = true;
          break;
        }
      }
    }
    if (matchedConjunct) continue;

    const char = cleaned[i];
    const next = cleaned[i + 1];

    // 2. Handle consonant + hasanta (্) combinations
    if (BANGLA_TO_LATIN[char] && next === "্") {
      result += BANGLA_TO_LATIN[char];
      i += 2; // Skip hasanta
      continue;
    }

    // 3. Regular ASCII characters
    if (/[a-zA-Z0-9_$]/.test(char)) {
      result += char;
    } else if (BANGLA_TO_LATIN[char] !== undefined) {
      result += BANGLA_TO_LATIN[char];
    }
    i++;
  }

  // Ensure valid start character
  if (/^[0-9]/.test(result)) result = "_" + result;
  if (!result) result = "bangla_var";
  return result;
}

/**
 * Transliterate Bangla text to Latin identifier
 * @param {string} text 
 * @returns {string}
 */
function transliterateBanglaToLatin(text) {
  if (!hasBanglaCharacters(text)) return text;
  const parts = text.split(/\s+/);
  if (parts.length > 1) {
    return parts.map(transliterateSingle).filter(Boolean).join("_");
  }
  return transliterateSingle(text);
}

// JavaScript reserved words list
const JS_RESERVED_WORDS = new Set([
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "let",
  "static",
  "enum",
  "await",
  "async",
  "null",
  "true",
  "false",
  "undefined",
  "NaN",
  "Infinity",
]);

/**
 * Sanitize a Bangla identifier into a safe, valid JavaScript identifier
 * @param {string} identifier 
 * @returns {string}
 */
function sanitizeBanglaIdentifier(identifier) {
  let translit = identifier;
  if (hasBanglaCharacters(identifier)) {
    translit = transliterateBanglaToLatin(identifier);
  }

  // If matches JS reserved word, prefix with bs_
  if (JS_RESERVED_WORDS.has(translit.toLowerCase())) {
    translit = `bs_${translit}`;
  }

  // Clean illegal identifier characters
  translit = translit.replace(/[^a-zA-Z0-9_$]/g, "_");

  // Ensure doesn't start with a number
  if (!/^[a-zA-Z_$]/.test(translit)) {
    translit = "_" + translit;
  }

  return translit;
}

/**
 * Translate Bangla identifiers in code
 * @param {string} code 
 * @returns {string}
 */
function translateBanglaToJS(code) {
  const tokens = tokenizePreserve(code);
  return tokens
    .map((t) => {
      if (t.type !== "word") return t.text;
      return sanitizeBanglaIdentifier(t.text);
    })
    .join("");
}

/**
 * Fast conversion of Bengali digits (০-৯) to English digits (0-9)
 * @param {string} text 
 * @returns {string}
 */
function convertBanglaNumbers(text) {
  return text.replace(/[০-৯]/g, (match) => BANGLA_DIGITS[match] || match);
}

/**
 * Check if text contains any Bengali unicode characters
 * @param {string} text 
 * @returns {boolean}
 */
function hasBanglaCharacters(text) {
  return /[\u0980-\u09FF]/.test(text);
}

/**
 * Escape regular expression special characters
 * @param {string} string 
 * @returns {string}
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Get all BanglaScript keywords organized by category
 * @returns {object}
 */
function getBanglaKeywords() {
  return {
    variables: [
      "সংখ্যা",
      "শব্দ",
      "বাক্য",
      "চলক",
      "লেট",
      "পরিবর্তনশীল",
      "ভার",
      "ধ্রুবক",
      "ব্যাক্তি",
      "কনস্ট",
    ],
    functions: ["অনুষ্ঠান", "ফাংশন", "প্রেরণ", "ফেরত", "ফিরিয়ে_দাও"],
    controlFlow: ["যদি", "নাহলে", "অন্যথায়", "নাহলে_যদি", "অন্যথায়_যদি"],
    loops: [
      "যখন",
      "যতক্ষণ",
      "জন্য",
      "প্রতিটি",
      "করো",
      "থামাও",
      "থামো_লুপ",
      "চালিয়ে_যাও",
      "পরবর্তী",
      "পুনরাবৃত্তি",
    ],
    oop: [
      "নতুন",
      "শ্রেণী",
      "ক্লাস",
      "গঠন",
      "নির্মাতা",
      "এটি",
      "এই",
      "বিস্তৃত",
      "সম্প্রসারিত",
      "স্ট্যাটিক",
      "স্থির",
      "সুপার",
      "অতিক্লাস",
    ],
    console: [
      "লিখো",
      "ছাপাও",
      "প্রিন্ট",
      "দেখাও",
      "সমস্যা_লিখো",
      "ত্রুটি_লিখো",
      "লিখো_ত্রুটি",
      "লিখো_সতর্কতা",
      "লিখো_সাবধান",
      "লিখো_তথ্য",
      "পরিষ্কার_করো",
      "টেবিল_দেখাও",
      "সময়_শুরু",
      "সময়_শেষ",
      "গণনা_করো",
      "ট্রেস_করো",
    ],
    boolean: [
      "সত্য",
      "সত্যি",
      "মিথ্যা",
      "মিছে",
      "শূন্য",
      "শুন্য",
      "নাল",
      "অনির্ধারিত",
      "অসংজ্ঞায়িত",
    ],
    errorHandling: [
      "চেষ্টা",
      "চেষ্টা_করো",
      "ধরো",
      "ধরা",
      "অবশেষে",
      "শেষে",
      "ফেলা",
      "নিক্ষেপ",
      "ছুড়ে_দাও",
    ],
    async: [
      "অপেক্ষা",
      "অপেক্ষা_করো",
      "অ্যাসিঙ্ক",
      "অসমকালীন",
      "প্রমিজ",
      "প্রতিজ্ঞা",
      "প্রতিশ্রুতি",
    ],
    switch: ["সুইচ", "পরিবর্তন", "কেস", "ক্ষেত্র", "ডিফল্ট", "সাধারণ"],
    types: [
      "টাইপ",
      "ধরন",
      "কিসের",
      "ইনস্ট্যান্স",
      "উদাহরণ",
      "ভ্যাড",
      "শূন্যতা",
    ],
    importExport: [
      "আমদানি",
      "আনো",
      "রপ্তানি",
      "রফতানি",
      "পাঠাও",
      "থেকে",
      "হিসেবে",
      "হিসাবে",
      "যেমন",
    ],
    timers: [
      "দেরি_করো",
      "সেট_টাইমাউট",
      "নিয়মিত_করো",
      "সেট_ইন্টারভাল",
      "টাইমাউট_থামাও",
      "ইন্টারভাল_থামাও",
      "ফেচ",
    ],
    collections: ["মানচিত্র", "ম্যাপ_ক্লাস", "সেট", "উইক_ম্যাপ", "উইক_সেট"],
    math: [
      "গণিত",
      "পাই",
      "বর্গমূল",
      "শক্তি",
      "পরম",
      "সিলিং",
      "ফ্লোর",
      "রাউন্ড",
      "সর্বোচ্চ",
      "সর্বনিম্ন",
      "এলোমেলো_সংখ্যা",
    ],
    others: [
      "ডিবাগ",
      "থামো",
      "মুছো",
      "মুছে_ফেলো",
      "ইন",
      "ভিতরে",
      "মধ্যে",
      "অফ",
      "মধ্য",
      "এর",
    ],
  };
}

/**
 * Identify token category for a given word
 * @param {string} word 
 * @returns {string}
 */
function getTokenType(word) {
  const keywords = getBanglaKeywords();

  for (const [type, words] of Object.entries(keywords)) {
    if (words.includes(word)) {
      return type;
    }
  }

  return "identifier";
}

/**
 * Validate BanglaScript structural syntax (balanced brackets, quotes)
 * @param {string} code 
 * @returns {{ valid: boolean, errors: Array<{ message: string, line: number, column: number }> }}
 */
function validateBanglaScript(code) {
  const errors = [];
  const tokens = tokenizePreserve(code);

  const stack = [];
  const matching = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  let line = 1;
  let col = 1;

  for (const token of tokens) {
    if (token.type === "whitespace") {
      const lines = token.text.split("\n");
      if (lines.length > 1) {
        line += lines.length - 1;
        col = lines[lines.length - 1].length + 1;
      } else {
        col += token.text.length;
      }
      continue;
    }

    if (token.type === "symbol") {
      const char = token.text;
      if (char === "(" || char === "[" || char === "{") {
        stack.push({ char, line, col });
      } else if (matching[char]) {
        const expected = matching[char];
        if (stack.length === 0) {
          errors.push({
            message: `অতিরিক্ত বন্ধনী: Unmatched closing '${char}'`,
            line,
            column: col,
          });
        } else {
          const top = stack.pop();
          if (top.char !== expected) {
            errors.push({
              message: `অমিল বন্ধনী: Mismatched '${top.char}' closed with '${char}'`,
              line,
              column: col,
            });
          }
        }
      }
    }

    // Advance position
    const tokenLines = token.text.split("\n");
    if (tokenLines.length > 1) {
      line += tokenLines.length - 1;
      col = tokenLines[tokenLines.length - 1].length + 1;
    } else {
      col += token.text.length;
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop();
    errors.push({
      message: `বন্ধনী বন্ধ করা হয়নি: Unclosed '${unclosed.char}' opened at line ${unclosed.line}`,
      line: unclosed.line,
      column: unclosed.col,
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generate a visual code frame pointing to an error line & column
 * @param {string} code 
 * @param {number} line 
 * @param {number} column 
 * @returns {string}
 */
function generateCodeFrame(code, line = 1, column = 1) {
  if (!code) return "";
  const lines = code.split(/\r?\n/);
  const startLine = Math.max(1, line - 2);
  const endLine = Math.min(lines.length, line + 2);
  const frame = [];

  for (let i = startLine; i <= endLine; i++) {
    const lineContent = lines[i - 1] || "";
    const isErrorLine = i === line;
    const prefix = isErrorLine ? "> " : "  ";
    const lineNum = String(i).padStart(4, " ");
    frame.push(`${prefix}${lineNum} | ${lineContent}`);

    if (isErrorLine && column > 0) {
      const indent = " ".repeat(7 + Math.max(0, column - 1));
      frame.push(`${indent}^`);
    }
  }

  return frame.join("\n");
}

/**
 * Calculate code metrics
 * @param {string} code 
 * @returns {object}
 */
function getCodeStats(code) {
  const lines = code.split(/\r?\n/);
  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed === "") {
      blankLines++;
    } else if (trimmed.startsWith("//") || trimmed.startsWith("/*")) {
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
    characters: code.length,
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
  generateCodeFrame,
  getCodeStats,
  escapeRegExp,
  hasBanglaCharacters,
  COMMON_MAP,
  BANGLA_TO_LATIN,
};