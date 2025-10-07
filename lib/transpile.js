const KEYWORDS = {
  // statements
  'অনুষ্ঠান': 'function',
  'ধরো': 'let',
  'ধ্রুবক': 'const',
  'যদি': 'if',
  'অন্যথায়': 'else',
  'যখন': 'while',
  'যাবো': 'for',
  'থামাও': 'break',
  'ফেরত': 'return',
  'নির্বাহ': 'continue',
  'নতুন': 'new',
  'শ্রেণী': 'class',

  // IO
  'লিখো': 'console.log',
  'সমস্যা_লিখো': 'console.error',
  'পাওয়া': 'console.info',

  // module
  'নাও': 'import',
  'দাও': 'export',

  // literals
  'সত্য': 'true',
  'মিথ্যা': 'false',
  'শূন্য': 'null',
  'শুন্য': 'null'
};

// helper: is Unicode letter
function isLetter(ch) {
  return /\p{L}/u.test(ch); // Unicode letter property
}

function tokenizePreserve(code) {
  // We need to split into tokens but preserve strings and comments.
  const out = [];
  let i = 0;
  const n = code.length;
  while (i < n) {
    const ch = code[i];

    // strings: single or double or backtick
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      let esc = false;
      while (j < n) {
        const c = code[j];
        if (esc) { esc = false; j++; continue; }
        if (c === "\\") { esc = true; j++; continue; }
        if (c === quote) { j++; break; }
        j++;
      }
      out.push({ type: 'string', text: code.slice(i, j) });
      i = j;
      continue;
    }

    // single-line comment //
    if (ch === '/' && code[i+1] === '/') {
      let j = i + 2;
      while (j < n && code[j] !== '\n') j++;
      out.push({ type: 'comment', text: code.slice(i, j) });
      i = j;
      continue;
    }

    // multi-line comment /* ... */
    if (ch === '/' && code[i+1] === '*') {
      let j = i + 2;
      while (j < n && !(code[j] === '*' && code[j+1] === '/')) j++;
      j += 2;
      if (j > n) j = n;
      out.push({ type: 'comment', text: code.slice(i, j) });
      i = j;
      continue;
    }

    // other: accumulate until next special char or whitespace; we'll do a simple walk
    // We'll identify "words" made of letters/digits/underscore/Unicode letters
    if (isLetter(ch) || /[0-9_$]/.test(ch)) {
      let j = i + 1;
      while (j < n && (isLetter(code[j]) || /[0-9_$]/.test(code[j]))) j++;
      out.push({ type: 'word', text: code.slice(i, j) });
      i = j;
      continue;
    }

    // otherwise single char (whitespace, punctuation)
    out.push({ type: 'symbol', text: ch });
    i++;
  }
  return out;
}

function mapWord(w) {
  // exact map for whole keyword
  if (KEYWORDS.hasOwnProperty(w)) return KEYWORDS[w];
  return w;
}

function transpile(code, opts = {}) {
  // 1) tokenize preserving strings and comments
  const tokens = tokenizePreserve(code);

  // 2) map tokens of type 'word' via KEYWORDS
  const mapped = tokens.map(t => {
    if (t.type === 'word') {
      return mapWord(t.text);
    } else {
      return t.text;
    }
  });

  let out = mapped.join('');

  // 3) Post-process: some Bangla patterns need structural adjustments.
  // e.g., function declarations might be written: "অনুষ্ঠান নাম(প্যারাম) {"
  // Our basic token replacement already handled "অনুষ্ঠান"->"function".

  // 4) minor normalization: replace full-width punctuation if present
  out = out.replace(/\u0964/g, ';'); // danda to semicolon (optional)

  // 5) Return JS code
  // Add source comment
  const header = `// Transpiled by BanglaScript 1.0\n`;
  return header + out;
}

module.exports = { transpile };


/* বিঃদ্রঃ এই transpile পদ্ধতি ভাষাগত টোকেনিং করে, স্ট্রিং ও কমেন্টকে অপরিবর্তিত রাখে এবং কিওয়ার্ড-লেভেলে বাংলা→ইংরেজি মেপ করে। এটা প্রকৃত AST ভিত্তিক টুল নয় — তবু সঠিকভাবে লেখা .bjs কোডের জন্য কার্যকর ও নিরাপদ (স্ট্রিং/কমেন্ট ভাঙবে না)। পরবর্তী ভারের্সনে আমরা AST ব্যবহার করে আরো শক্তিশালী কনভার্শন দেব। */