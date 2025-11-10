function tokenizePreserve(code) {
  const tokens = [];
  const n = code.length;
  let i = 0;
  let isExpressionStart = true;

  const expressionStarters = new Set([
    // English keywords
    "return",
    "throw",
    "await",
    "delete",
    "void",
    "typeof",
    "new",
    "yield",
    // Bangla equivalents
    "ফেরত",
    "প্রেরণ",
    "ফেলা",
    "অপেক্ষা",
    "মুছো",
    "শূন্য",
    "টাইপ",
    "নতুন",
  ]);

  const operators = new Set([
    "+",
    "-",
    "*",
    "/",
    "%",
    "**",
    "=",
    "==",
    "===",
    "!",
    "!=",
    "!==",
    ">",
    "<",
    ">=",
    "<=",
    "&&",
    "||",
    "?",
    ":",
    ",",
    ";",
    "~",
    "^",
    "&",
    "|",
    ">>",
    "<<",
    ">>>",
    "+=",
    "-=",
    "*=",
    "/=",
    "%=",
    "**=",
    "&=",
    "|=",
    "^=",
    "<<=",
    ">>=",
    ">>>=",
    "++",
    "--",
  ]);

  function updateExpressionStart(token) {
    if (token.type === "symbol") {
      if (operators.has(token.text) || ["!", "~"].includes(token.text)) {
        isExpressionStart = true;
      } else if (["(", "[", "{"].includes(token.text)) {
        isExpressionStart = true;
      } else if ([")", "]", "}"].includes(token.text)) {
        isExpressionStart = false;
      } else {
        isExpressionStart = false; // Default for other symbols
      }
    } else if (token.type === "word") {
      isExpressionStart = expressionStarters.has(token.text);
    } else if (["number", "string", "regex"].includes(token.type)) {
      isExpressionStart = false;
    } else if (token.type === "comment") {
      // Comments don't change expression state
    }
  }

  function scanRegex(start) {
    let j = start + 1;
    let esc = false;
    let inCharClass = false;

    while (j < n) {
      const c = code[j];
      if (esc) {
        esc = false;
        j++;
        continue;
      }
      if (c === "\\") {
        esc = true;
        j++;
        continue;
      }
      if (inCharClass) {
        if (c === "]") {
          inCharClass = false;
        }
        j++;
        continue;
      }
      if (c === "/") {
        j++;
        // Scan flags
        while (j < n && /[gimsuy]/.test(code[j])) {
          j++;
        }
        return j;
      }
      if (c === "[") {
        inCharClass = true;
        j++;
        continue;
      }
      j++;
    }
    return -1; // Invalid regex
  }

  while (i < n) {
    const ch = code[i];

    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      let esc = false;
      while (j < n) {
        const c = code[j];
        if (esc) {
          esc = false;
          j++;
          continue;
        }
        if (c === "\\") {
          esc = true;
          j++;
          continue;
        }
        if (c === quote) {
          j++;
          break;
        }
        j++;
      }
      const token = { type: "string", text: code.slice(i, j) };
      tokens.push(token);
      updateExpressionStart(token);
      i = j;
      continue;
    }

    if (ch === "/" && i + 1 < n && code[i + 1] === "/") {
      let j = i + 2;
      while (j < n && code[j] !== "\n") j++;
      const token = { type: "comment", text: code.slice(i, j) };
      tokens.push(token);
      updateExpressionStart(token);
      i = j;
      continue;
    }

    if (ch === "/" && i + 1 < n && code[i + 1] === "*") {
      let j = i + 2;
      while (j + 1 < n && !(code[j] === "*" && code[j + 1] === "/")) j++;
      if (j + 1 < n) j += 2;
      const token = { type: "comment", text: code.slice(i, j) };
      tokens.push(token);
      updateExpressionStart(token);
      i = j;
      continue;
    }

    if (
      ch === "/" &&
      i + 1 < n &&
      code[i + 1] !== "/" &&
      code[i + 1] !== "*" &&
      isExpressionStart
    ) {
      const end = scanRegex(i);
      if (end > i) {
        const token = { type: "regex", text: code.slice(i, end) };
        tokens.push(token);
        updateExpressionStart(token);
        i = end;
        continue;
      }
    }

    if (/[0-9\u09E6-\u09EF]/.test(ch)) {
      let j = i + 1;
      while (j < n && (/[0-9\u09E6-\u09EF]/.test(code[j]) || code[j] === "."))
        j++;
      const token = { type: "number", text: code.slice(i, j) };
      tokens.push(token);
      updateExpressionStart(token);
      i = j;
      continue;
    }

    if (isUnicodeLetter(ch) || ch === "_" || ch === "$") {
      let j = i + 1;
      while (j < n) {
        const c = code[j];
        if (
          isUnicodeLetter(c) ||
          c === "_" ||
          c === "$" ||
          /[0-9\u09E6-\u09EF]/.test(c)
        ) {
          j++;
          continue;
        }
        break;
      }
      const token = { type: "word", text: code.slice(i, j) };
      tokens.push(token);
      updateExpressionStart(token);
      i = j;
      continue;
    }

    // Improved symbol handling: skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    const token = { type: "symbol", text: ch };
    tokens.push(token);
    updateExpressionStart(token);
    i++;
  }

  return tokens;
}

function isUnicodeLetter(ch) {
  return /[A-Za-z\u0980-\u09FF]/.test(ch);
}

module.exports = { tokenizePreserve, isUnicodeLetter };
