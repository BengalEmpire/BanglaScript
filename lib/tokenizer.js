function tokenizePreserve(code) {
  const tokens = [];
  const n = code.length;
  let i = 0;
  while (i < n) {
    const ch = code[i];
    if (ch === '"' || ch === "'" || ch === '`') {
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
        if (c === '\\') {
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
      tokens.push({ type: 'string', text: code.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === '/' && i + 1 < n && code[i + 1] === '/') {
      let j = i + 2;
      while (j < n && code[j] !== '\n') j++;
      tokens.push({ type: 'comment', text: code.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === '/' && i + 1 < n && code[i + 1] === '*') {
      let j = i + 2;
      while (j + 1 < n && !(code[j] === '*' && code[j + 1] === '/')) j++;
      if (j + 1 < n) j += 2;
      tokens.push({ type: 'comment', text: code.slice(i, j) });
      i = j;
      continue;
    }
    if (/[0-9\u09E6-\u09EF]/.test(ch)) {
      let j = i + 1;
      while (j < n && (/[0-9\u09E6-\u09EF]/.test(code[j]) || code[j] === '.')) j++;
      tokens.push({ type: 'number', text: code.slice(i, j) });
      i = j;
      continue;
    }
    if (isUnicodeLetter(ch) || ch === '_' || ch === '$') {
      let j = i + 1;
      while (j < n) {
        const c = code[j];
        if (isUnicodeLetter(c) || c === '_' || c === '$' || /[0-9\u09E6-\u09EF]/.test(c)) {
          j++;
          continue;
        }
        break;
      }
      tokens.push({ type: 'word', text: code.slice(i, j) });
      i = j;
      continue;
    }
    tokens.push({ type: 'symbol', text: ch });
    i++;
  }
  return tokens;
}

function isUnicodeLetter(ch) {
  return /[A-Za-z\u0980-\u09FF]/.test(ch);
}

module.exports = { tokenizePreserve, isUnicodeLetter };