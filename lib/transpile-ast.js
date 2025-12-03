const parser = require("@babel/parser");
const generate = require("@babel/generator").default;
const path = require("path");
const {
  translateBanglaToJS,
  convertBanglaNumbers,
  transliterateBanglaToLatin,
  hasBanglaCharacters,
  sanitizeBanglaIdentifier,
} = require("./translate-words");
const { tokenizePreserve } = require("./tokenizer");
const { KEYWORDS } = require("./keywords");
const { cacheInstance } = require("./cache");
const { performanceMonitor } = require("./performance");

/**
 * Transpile BanglaScript code to JavaScript with source maps
 * @param {string} banglaCode - The BanglaScript source code
 * @param {string} filename - Filename for source maps
 * @param {boolean} noTranslit - Disable transliteration of Bangla identifiers
 * @param {object} options - Additional options
 * @returns {object} { code, map } - Transpiled JavaScript code and source map
 */
function transpileWithSourceMap(
  banglaCode,
  filename = "source.bjs",
  noTranslit = false,
  options = {},
) {
  performanceMonitor.start("transpileWithSourceMap");

  if (!banglaCode || !banglaCode.trim()) {
    performanceMonitor.end("transpileWithSourceMap");
    return { code: "", map: null };
  }

  // Check cache if enabled
  const cacheOptions = { noTranslit, filename };
  const useCache = options.cache !== false;

  if (useCache) {
    performanceMonitor.start("cacheCheck");
    const cached = cacheInstance.get(banglaCode, cacheOptions);
    performanceMonitor.end("cacheCheck");

    if (cached) {
      performanceMonitor.end("transpileWithSourceMap");
      return { code: cached.code, map: cached.map };
    }
  }

  try {
    performanceMonitor.start("tokenization");
    const tokens = tokenizePreserve(banglaCode);
    performanceMonitor.end("tokenization");

    performanceMonitor.start("preprocessing");
    const preprocessed = tokens
      .map((t) => {
        if (t.type === "string" || t.type === "comment" || t.type === "regex") {
          return t.text;
        }
        if (t.type === "number") {
          return convertBanglaNumbers(t.text);
        }
        if (t.type === "word") {
          const norm = t.text;
          if (KEYWORDS[norm]) {
            return KEYWORDS[norm];
          }
          if (!noTranslit && hasBanglaCharacters(norm)) {
            return sanitizeBanglaIdentifier(norm);
          }
          return norm;
        }
        return t.text;
      })
      .join("");
    performanceMonitor.end("preprocessing");

    // Parse the preprocessed code to AST
    performanceMonitor.start("parsing");
    const ast = parser.parse(preprocessed, {
      sourceType: "module",
      plugins: [
        "jsx",
        "typescript",
        "decorators-legacy",
        "classProperties",
        "asyncGenerators",
        "dynamicImport",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "optionalChaining",
        "nullishCoalescingOperator",
      ],
      errorRecovery: true,
    });
    performanceMonitor.end("parsing");

    // Generate JS code with source map
    performanceMonitor.start("codeGeneration");
    const output = generate(
      ast,
      {
        sourceMaps: true,
        sourceFileName: filename,
        compact: false,
        comments: true,
        retainLines: false,
      },
      preprocessed,
    );
    performanceMonitor.end("codeGeneration");

    if (output.map) {
      output.map.sourcesContent = [banglaCode];
    }

    const result = {
      code: output.code,
      map: output.map,
    };

    // Cache the result
    if (useCache) {
      performanceMonitor.start("cacheSet");
      cacheInstance.set(banglaCode, cacheOptions, result);
      performanceMonitor.end("cacheSet");
    }

    performanceMonitor.end("transpileWithSourceMap");
    return result;
  } catch (error) {
    performanceMonitor.end("transpileWithSourceMap");

    let approxLine = 0;
    if (error.loc && typeof error.loc.index === "number") {
      approxLine = banglaCode.substring(0, error.loc.index).split("\n").length;
    } else if (error.loc && error.loc.line) {
      approxLine = error.loc.line;
    }

    const enhancedError = new Error(
      `Transpilation Error at line ${approxLine || "?"}: ${error.message}`,
    );
    enhancedError.line = approxLine;
    enhancedError.originalError = error;
    throw enhancedError;
  }
}

/**
 * Transpile BanglaScript code to JavaScript (without source maps)
 * @param {string} banglaCode - The BanglaScript source code
 * @param {boolean} noTranslit - Disable transliteration of Bangla identifiers
 * @param {object} options - Additional options
 * @returns {string} - Transpiled JavaScript code
 */
function transpile(banglaCode, noTranslit = false, options = {}) {
  const result = transpileWithSourceMap(banglaCode, "source.bjs", noTranslit, options);
  return result.code;
}

module.exports = { transpile, transpileWithSourceMap, KEYWORDS };