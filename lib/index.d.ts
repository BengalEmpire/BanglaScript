// Type definitions for BanglaScript
// Project: https://github.com/BengalEmpire/BanglaScript

export interface TranspileResult {
  code: string;
  map: object | null;
}

export interface TranspileOptions {
  noTranslit?: boolean;
  minify?: boolean;
  cache?: boolean;
  compact?: boolean;
  comments?: boolean;
  retainLines?: boolean;
  filename?: string;
}

export interface ValidationError {
  message: string;
  line: number;
  column?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface CodeStats {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  characters: number;
}

export interface Token {
  type: "word" | "string" | "number" | "comment" | "regex" | "symbol" | "whitespace";
  text: string;
}

export interface BanglaKeywords {
  variables: string[];
  functions: string[];
  controlFlow: string[];
  loops: string[];
  oop: string[];
  console: string[];
  boolean: string[];
  errorHandling: string[];
  async: string[];
  switch: string[];
  types: string[];
  importExport: string[];
  timers: string[];
  collections: string[];
  math: string[];
  others: string[];
}

// Main transpiler functions
export function transpile(
  banglaCode: string,
  noTranslit?: boolean,
  options?: TranspileOptions
): string;

export function transpileSync(
  banglaCode: string,
  options?: TranspileOptions
): string;

export function transpileWithSourceMap(
  banglaCode: string,
  filename?: string,
  noTranslit?: boolean,
  options?: TranspileOptions
): TranspileResult;

export function preprocessBanglaScript(
  banglaCode: string,
  noTranslit?: boolean
): string;

// Keyword mapping
export const KEYWORDS: { [bangla: string]: string };

// Translation utilities
export function translateBanglaToJS(code: string): string;
export function convertBanglaNumbers(text: string): string;
export function transliterateBanglaToLatin(text: string): string;
export function sanitizeBanglaIdentifier(identifier: string): string;
export function hasBanglaCharacters(text: string): boolean;
export function generateCodeFrame(
  code: string,
  line?: number,
  column?: number
): string;

// Code analysis
export function getBanglaKeywords(): BanglaKeywords;
export function getTokenType(word: string): string;
export function validateBanglaScript(code: string): ValidationResult;
export function getCodeStats(code: string): CodeStats;

// Tokenizer
export function tokenizePreserve(code: string): Token[];
export function isUnicodeLetter(ch: string): boolean;

// Utility functions
export function escapeRegExp(string: string): string;

// Constants & Mappings
export const COMMON_MAP: { [bangla: string]: string };
export const BANGLA_TO_LATIN: { [bangla: string]: string };
export const CONJUNCTS_MAP: { [conjunct: string]: string };

// Register hook
export function register(): void;

// Build utilities
export function doBuild(
  file: string,
  outDir?: string,
  minify?: boolean,
  noTranslit?: boolean
): string | null;

export function watchAndBuild(
  files: string[],
  outDir: string,
  minify: boolean,
  noTranslit: boolean
): void;

export function showKeywords(filter?: string, categoryFilter?: string): void;

export interface Colors {
  reset: string;
  bright: string;
  dim: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  bgRed: string;
  bgGreen: string;
  bgYellow: string;
}

export function getColors(): Colors;
export function formatError(error: Error, context?: object): string;
export function formatSuccess(message: string, details?: object): string;

export class Timer {
  constructor();
  elapsed(): number;
  reset(): void;
}

export class TranspilationCache {
  constructor(cacheDir?: string, maxMemoryCacheSize?: number);
  get(code: string, options?: object): TranspileResult | null;
  set(code: string, options: object, result: TranspileResult): void;
  clear(): void;
  clearOld(maxAge?: number): void;
  getStats(): object;
  setEnabled(enabled: boolean): void;
}

export const cacheInstance: TranspilationCache;

export function ensureDir(dirPath: string): boolean;
export function readFile(filePath: string): string;
export function writeFile(filePath: string, content: string): boolean;
export function isBanglaScriptFile(filename: string): boolean;
export function getOutputFilename(inputFile: string, outputDir?: string): string;
export function getSourceMapFilename(inputFile: string, outputDir?: string): string;