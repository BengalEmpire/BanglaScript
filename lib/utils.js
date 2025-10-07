const BENGALI_DIGIT_START = 0x09E6;

function bengaliDigitsToAscii(str) {
  return str.replace(/[\u09E6-\u09EF]/g, (ch) => {
    const code = ch.charCodeAt(0);
    return String(code - BENGALI_DIGIT_START);
  });
}

function isUnicodeLetter(ch) {
  try {
    return /\p{L}/u.test(ch);
  } catch (e) {
    return /[A-Za-z\u00C0-\u024F\u0900-\u097F\u0980-\u09FF]/.test(ch);
  }
}

module.exports = { bengaliDigitsToAscii, isUnicodeLetter };