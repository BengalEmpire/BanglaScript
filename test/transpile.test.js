/**
 * BanglaScript Comprehensive Test Suite
 * Compatible with Node.js test runner (node --test) and Jest
 */

const { describe, it, test: itAlias } = require("node:test");
const assert = require("node:assert");
const { transpile, transpileWithSourceMap, KEYWORDS } = require("../lib/transpile-ast");
const {
  convertBanglaNumbers,
  transliterateBanglaToLatin,
  sanitizeBanglaIdentifier,
  validateBanglaScript,
  generateCodeFrame,
  getCodeStats,
} = require("../lib/translate-words");
const { cacheInstance } = require("../lib/cache");
const { performanceMonitor } = require("../lib/performance");

const test = it || itAlias;

describe("BanglaScript Transpiler v4.2.0 Test Suite", () => {
  // ==================== 1. VARIABLES & DECLARATIONS ====================
  describe("Variable Declarations", () => {
    test("transpiles let (সংখ্যা, শব্দ, বাক্য, চলক, লেট)", () => {
      const input = `
        সংখ্যা বয়স = ২৫;
        শব্দ বার্তা = "হ্যালো";
        বাক্য টেক্সট = 'বাংলা';
        চলক এক্স = ১০;
        লেট কাউন্ট = ০;
      `;
      const output = transpile(input);
      assert.match(output, /let boyos = 25;/);
      assert.match(output, /let message = "হ্যালো";/);
      assert.match(output, /let text = 'বাংলা';/);
      assert.match(output, /let eks = 10;/);
      assert.match(output, /let kaunt = 0;/);
    });

    test("transpiles const (ধ্রুবক, ব্যাক্তি, কনস্ট)", () => {
      const input = `
        ধ্রুবক নাম = "করিম";
        ব্যাক্তি রোল = ১০১;
        কনস্ট পাই_মান = ৩.১৪১৬;
      `;
      const output = transpile(input);
      assert.match(output, /const nam = "করিম";/);
      assert.match(output, /const rol = 101;/);
      assert.match(output, /const pai_man = 3\.1416;/);
    });

    test("transpiles var (পরিবর্তনশীল, ভার)", () => {
      const input = `
        পরিবর্তনশীল পুরাতন = সত্য;
        ভার মোট = ৫০০;
      `;
      const output = transpile(input);
      assert.match(output, /var puraton = true;/);
      assert.match(output, /var mot = 500;/);
    });
  });

  // ==================== 2. CONTROL FLOW ====================
  describe("Control Flow", () => {
    test("transpiles if / else if / else (যদি / নাহলে_যদি / নাহলে / অন্যথায়)", () => {
      const input = `
        যদি (বয়স >= ১৮) {
          লিখো("প্রাপ্তবয়স্ক");
        } নাহলে_যদি (বয়স >= ১৩) {
          লিখো("কিশোর");
        } নাহলে {
          লিখো("শিশু");
        }
      `;
      const output = transpile(input);
      assert.match(output, /if \(boyos >= 18\)/);
      assert.match(output, /console\.log\("প্রাপ্তবয়স্ক"\)/);
      assert.match(output, /else if \(boyos >= 13\)/);
      assert.match(output, /else \{/);
    });

    test("transpiles switch / case / default (সুইচ / কেস / ডিফল্ট)", () => {
      const input = `
        সুইচ (দিন) {
          কেস ১:
            লিখো("রবিবার");
            থামাও;
          ডিফল্ট:
            লিখো("অন্য দিন");
        }
      `;
      const output = transpile(input);
      assert.match(output, /switch \(day\)/);
      assert.match(output, /case 1:/);
      assert.match(output, /break;/);
      assert.match(output, /default:/);
    });
  });

  // ==================== 3. LOOPS ====================
  describe("Loops", () => {
    test("transpiles for loop (জন্য / প্রতিটি)", () => {
      const input = `জন্য (সংখ্যা i = ০; i < ১০; i++) { লিখো(i); }`;
      const output = transpile(input);
      assert.match(output, /for \(let i = 0; i < 10; i\+\+\) \{/);
      assert.match(output, /console\.log\(i\);/);
    });

    test("transpiles while and do-while (যখন / করো)", () => {
      const input = `
        যখন (কাউন্ট > ০) {
          কাউন্ট--;
          যদি (কাউন্ট === ২) চালিয়ে_যাও;
        }
        করো {
          লিখো("চলছে");
        } যখন (মিথ্যা);
      `;
      const output = transpile(input);
      assert.match(output, /while \(kaunt > 0\)/);
      assert.match(output, /continue;/);
      assert.match(output, /do \{/);
      assert.match(output, /\} while \(false\);/);
    });

    test("transpiles for-of and for-in (অফ / ইন)", () => {
      const input = `
        জন্য (ধ্রুবক আইটেম অফ তালিকা) { লিখো(আইটেম); }
        জন্য (ধ্রুবক কী ইন অবজেক্ট) { লিখো(কী); }
      `;
      const output = transpile(input);
      assert.match(output, /for \(const aitem of list\)/);
      assert.match(output, /for \(const kee in object\)/);
    });
  });

  // ==================== 4. FUNCTIONS ====================
  describe("Functions", () => {
    test("transpiles function declaration (অনুষ্ঠান / ফাংশন / ফেরত)", () => {
      const input = `
        অনুষ্ঠান যোগফল(ক, খ) {
          ফেরত ক + খ;
        }
        ধ্রুবক গুণ = ফাংশন(x, y) {
          ফিরিয়ে_দাও x * y;
        };
      `;
      const output = transpile(input);
      assert.match(output, /function jogfol\(k, kh\) \{/);
      assert.match(output, /return k \+ kh;/);
      assert.match(output, /const Multiplication = function \(x, y\) \{/);
      assert.match(output, /return x \* y;/);
    });

    test("transpiles arrow functions and callbacks", () => {
      const input = `
        ধ্রুবক দ্বিগুণ = (n) => n * ২;
        ধ্রুবক ফলাফল = তালিকা.ম্যাপ((আইটেম) => আইটেম * ২);
      `;
      const output = transpile(input);
      assert.match(output, /const dwigun = n => n \* 2;/);
      assert.match(output, /\.map\(/);
    });
  });

  // ==================== 5. CLASSES & OOP ====================
  describe("Classes and OOP", () => {
    test("transpiles classes with constructor, extends, super, this, static", () => {
      const input = `
        ক্লাস প্রাণী {
          নির্মাতা(নাম) {
            এই.নাম = নাম;
          }
          স্ট্যাটিক তৈরি_করো() {
            ফেরত নতুন প্রাণী("সাধারণ");
          }
        }
        শ্রেণী মানুষ বিস্তৃত প্রাণী {
          গঠন(নাম, বয়স) {
            সুপার(নাম);
            এটি.বয়স = বয়স;
          }
        }
      `;
      const output = transpile(input);
      assert.match(output, /class animal \{/);
      assert.match(output, /constructor\(nam\) \{/);
      assert.match(output, /this\.nam = nam;/);
      assert.match(output, /static createElement\(\) \{/);
      assert.match(output, /return new animal\("সাধারণ"\);/);
      assert.match(output, /class manush extends animal \{/);
      assert.match(output, /super\(nam\);/);
    });
  });

  // ==================== 6. ASYNC / AWAIT & PROMISES ====================
  describe("Async / Await and Promises", () => {
    test("transpiles async/await and Promises", () => {
      const input = `
        অ্যাসিঙ্ক অনুষ্ঠান ডাটা_আনো(url) {
          ধ্রুবক রেসপন্স = অপেক্ষা ফেচ(url);
        }
        ধ্রুবক p = নতুন প্রমিজ((সমাধান, প্রত্যাখ্যান) => {
          সমাধান("সফল");
        });
      `;
      const output = transpile(input);
      assert.match(output, /async function data_ano\(url\) \{/);
      assert.match(output, /await fetch\(url\)/);
      assert.match(output, /new Promise\(\(resolve, reject\) => \{/);
      assert.match(output, /resolve\("সফল"\);/);
    });
  });

  // ==================== 7. ERROR HANDLING ====================
  describe("Error Handling", () => {
    test("transpiles try / catch / finally / throw", () => {
      const input = `
        চেষ্টা_করো {
          যদি (ভুল) ফেলা নতুন ত্রুটি("কিছু একটা ভুল হয়েছে");
        } ধরো (ত্রুটি) {
          ত্রুটি_লিখো(ত্রুটি);
        } অবশেষে {
          লিখো("সব শেষ");
        }
      `;
      const output = transpile(input);
      assert.match(output, /try \{/);
      assert.match(output, /throw new Error\("কিছু একটা ভুল হয়েছে"\);/);
      assert.match(output, /\} catch \(Error\) \{/);
      assert.match(output, /console\.error\(Error\);/);
      assert.match(output, /\} finally \{/);
      assert.match(output, /console\.log\("সব শেষ"\);/);
    });
  });

  // ==================== 8. NUMBER CONVERSION ====================
  describe("Bengali Digits Conversion", () => {
    test("converts Bengali digits to English digits in code", () => {
      assert.strictEqual(convertBanglaNumbers("১২৩৪৫৬৭৮৯০"), "1234567890");
      assert.strictEqual(convertBanglaNumbers("৩.১৪১৬"), "3.1416");

      const input = `সংখ্যা মোট_টাকা = ৯৮৭.৬৫;`;
      const output = transpile(input);
      assert.match(output, /let mot_taka = 987\.65;/);
    });
  });

  // ==================== 9. TRANSLITERATION & SANITIZATION ====================
  describe("Transliteration and Sanitization", () => {
    test("uses COMMON_MAP for known words", () => {
      assert.strictEqual(transliterateBanglaToLatin("নাম"), "nam");
      assert.strictEqual(transliterateBanglaToLatin("বয়স"), "boyos");
      assert.strictEqual(transliterateBanglaToLatin("যোগফল"), "jogfol");
      assert.strictEqual(transliterateBanglaToLatin("ব্যবহারকারী"), "user");
      assert.strictEqual(transliterateBanglaToLatin("শিক্ষা"), "education");
      assert.strictEqual(transliterateBanglaToLatin("বিজ্ঞান"), "science");
    });

    test("transliterates compound and conjunct words cleanly", () => {
      assert.strictEqual(transliterateBanglaToLatin("পরীক্ষা"), "experiment");
      assert.strictEqual(transliterateBanglaToLatin("অনুপাত"), "onupat");
      assert.strictEqual(transliterateBanglaToLatin("প্রোগ্রাম"), "program");
    });

    test("prefixes reserved words safely", () => {
      assert.strictEqual(sanitizeBanglaIdentifier("var"), "bs_var");
      assert.strictEqual(sanitizeBanglaIdentifier("let"), "bs_let");
      assert.strictEqual(sanitizeBanglaIdentifier("class"), "bs_class");
    });
  });

  // ==================== 10. MODERN BUILT-IN METHODS ====================
  describe("Modern Built-in Methods", () => {
    test("transpiles array methods and Map/Set correctly", () => {
      const input = `
        ধ্রুবক অ্যারে = [১, ২, ৩, ৪];
        ধ্রুবক দ্বিগুণ = অ্যারে.ম্যাপ(x => x * ২);
        ধ্রুবক ফিল্টারড = অ্যারে.ছাঁকনি(x => x > ২);
        ধ্রুবক যোগ = অ্যারে.হ্রাস((মোট, x) => মোট + x, ০);
        ধ্রুবক ম্যাপ_অবজেক্ট = নতুন মানচিত্র();
        ধ্রুবক সেট_অবজেক্ট = নতুন সেট();
      `;
      const output = transpile(input);
      assert.match(output, /\.map\(x => x \* 2\)/);
      assert.match(output, /\.filter\(x => x > 2\)/);
      assert.match(output, /\.reduce\(/);
      assert.match(output, /new Map\(\)/);
      assert.match(output, /new Set\(\)/);
    });

    test("transpiles Math and Global helpers", () => {
      const input = `
        ধ্রুবক রুট = গণিত.বর্গমূল(১৬);
        ধ্রুবক পাওয়ার = গণিত.শক্তি(২, ৩);
        ধ্রুবক পূর্ণ = পূর্ণসংখ্যা("123");
      `;
      const output = transpile(input);
      assert.match(output, /Math\.sqrt\(16\)/);
      assert.match(output, /Math\.pow\(2, 3\)/);
      assert.match(output, /parseInt\("123"\)/);
    });
  });

  // ==================== 11. SOURCE MAPS & CACHING ====================
  describe("Source Maps and Caching", () => {
    test("generates valid source maps", () => {
      const input = `সংখ্যা x = ১০;`;
      const result = transpileWithSourceMap(input, "test.bjs");
      assert.ok(result.code);
      assert.ok(result.map);
      assert.strictEqual(result.map.file, "test.bjs");
    });

    test("caches transpilation results for faster subsequent access", () => {
      cacheInstance.clear();
      const input = `সংখ্যা গতি = ১০০;`;
      const first = transpileWithSourceMap(input, "speed.bjs", false, { cache: true });
      const second = transpileWithSourceMap(input, "speed.bjs", false, { cache: true });
      assert.strictEqual(first.code, second.code);
      const stats = cacheInstance.getStats();
      assert.ok(stats.memoryCacheCount >= 1);
    });
  });

  // ==================== 12. VALIDATION & DIAGNOSTICS ====================
  describe("Syntax Validation and Diagnostics", () => {
    test("validates bracket matching accurately", () => {
      const validCode = `যদি (সত্য) { লিখো("ঠিক আছে"); }`;
      const validation1 = validateBanglaScript(validCode);
      assert.strictEqual(validation1.valid, true);

      const invalidCode = `যদি (সত্য { লিখো("ভুল"); }`;
      const validation2 = validateBanglaScript(invalidCode);
      assert.strictEqual(validation2.valid, false);
      assert.ok(validation2.errors.length > 0);
    });

    test("generates visual code frames for errors", () => {
      const code = "সংখ্যা ক = ১০;\nযদি (ভুল {\nলিখো('test');\n}";
      const frame = generateCodeFrame(code, 2, 9);
      assert.ok(frame.includes("> "));
      assert.ok(frame.includes("^"));
    });

    test("calculates accurate code statistics", () => {
      const code = "// মন্তব্য\nসংখ্যা ক = ১০;\n\nলিখো(ক);";
      const stats = getCodeStats(code);
      assert.strictEqual(stats.totalLines, 4);
      assert.strictEqual(stats.codeLines, 2);
      assert.strictEqual(stats.commentLines, 1);
      assert.strictEqual(stats.blankLines, 1);
    });
  });

  // ==================== 13. REGISTER HOOK ====================
  describe("Node.js Register Hook", () => {
    test("registers .bjs extension in require.extensions", () => {
      require("../lib/register");
      assert.ok(require.extensions[".bjs"]);
    });
  });
});
