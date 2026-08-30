const parser = require("@babel/parser");
const generate = require("@babel/generator").default;
const path = require("path");
const {
  translateBanglaToJS,
  convertBanglaNumbers,
  transliterateBanglaToLatin,
  hasBanglaCharacters,
  sanitizeBanglaIdentifier,
  generateCodeFrame,
} = require("./translate-words");
const { tokenizePreserve } = require("./tokenizer");
const { KEYWORDS } = require("./keywords");
const { cacheInstance } = require("./cache");
const { performanceMonitor } = require("./performance");

const BABEL_PARSER_PLUGINS = [
  "jsx",
  "typescript",
  "decorators-legacy",
  "classProperties",
  "classPrivateProperties",
  "classPrivateMethods",
  "privateIn",
  "asyncGenerators",
  "dynamicImport",
  "exportDefaultFrom",
  "exportNamespaceFrom",
  "optionalChaining",
  "nullishCoalescingOperator",
  "numericSeparator",
  "topLevelAwait",
  "importMeta",
];

/**
 * Preprocess BanglaScript tokens into JavaScript code string
 * @param {string} banglaCode 
 * @param {boolean} noTranslit 
 * @returns {string}
 */
function preprocessBanglaScript(banglaCode, noTranslit = false) {
  const tokens = tokenizePreserve(banglaCode);
  return tokens
    .map((t) => {
      if (t.type === "string" || t.type === "comment" || t.type === "regex") {
        return t.text;
      }
      if (t.type === "number") {
        return convertBanglaNumbers(t.text);
      }
      if (t.type === "word") {
        const norm = t.text;
        if (KEYWORDS[norm] !== undefined) {
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
}

/**
 * Transpile BanglaScript code to JavaScript with source maps
 * @param {string} banglaCode - The BanglaScript source code
 * @param {string} filename - Filename for source maps
 * @param {boolean} noTranslit - Disable transliteration of Bangla identifiers
 * @param {object} options - Additional options
 * @returns {{ code: string, map: object | null }} - Transpiled JavaScript code and source map
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
    performanceMonitor.start("preprocessing");
    const preprocessed = preprocessBanglaScript(banglaCode, noTranslit);
    performanceMonitor.end("preprocessing");

    // Parse the preprocessed code to AST
    performanceMonitor.start("parsing");
    const ast = parser.parse(preprocessed, {
      sourceType: "module",
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      allowUndeclaredExports: true,
      plugins: BABEL_PARSER_PLUGINS,
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
        compact: Boolean(options.compact),
        comments: options.comments !== false,
        retainLines: Boolean(options.retainLines),
      },
      preprocessed,
    );
    performanceMonitor.end("codeGeneration");

    if (output.map) {
      output.map.file = filename;
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

    let line = 1;
    let column = 1;

    if (error.loc) {
      line = error.loc.line || 1;
      column = error.loc.column || 1;
    }

    const codeFrame = generateCodeFrame(banglaCode, line, column);
    const enhancedError = new Error(
      `BanglaScript Transpilation Error at line ${line}, column ${column}:\n${error.message}\n\n${codeFrame}`,
    );
    enhancedError.line = line;
    enhancedError.column = column;
    enhancedError.codeFrame = codeFrame;
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
  const result = transpileWithSourceMap(
    banglaCode,
    options.filename || "source.bjs",
    noTranslit,
    options,
  );
  return result.code;
}

/**
 * Synchronous transpilation helper
 */
function transpileSync(banglaCode, options = {}) {
  return transpile(banglaCode, options.noTranslit || false, options);
}

module.exports = {
  transpile,
  transpileSync,
  transpileWithSourceMap,
  preprocessBanglaScript,
  KEYWORDS,
};