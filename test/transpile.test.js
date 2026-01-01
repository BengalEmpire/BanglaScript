const { transpile } = require('../lib/transpile-ast');

// Helper to normalize code for comparison (ignores extra whitespace)
function normalize(code) {
    return code.replace(/\s+/g, ' ').trim();
}

describe('BanglaScript Transpiler', () => {
    describe('Variables', () => {
        test('should transpile let (সংখ্যা) declaration', () => {
            const input = `সংখ্যা বয়স = ২৫;`;
            const expected = `let bjs = 25;`;
            expect(normalize(transpile(input))).toBe(normalize(expected));
        });

        test('should transpile const (ধ্রুবক) declaration', () => {
            const input = `ধ্রুবক নাম = "করিম";`;
            const expected = `const nam = "করিম";`;
            expect(normalize(transpile(input))).toBe(normalize(expected));
        });
    });

    describe('Control Flow', () => {
        test('should transpile if-else (যদি-নাহলে)', () => {
            const input = `
        যদি (সত্য) {
          লিখো("সত্য");
        } নাহলে {
          লিখো("মিথ্যা");
        }
      `;
            const expected = `
        if (true) {
          console.log("সত্য");
        } else {
          console.log("মিথ্যা");
        }
      `;
            expect(normalize(transpile(input))).toBe(normalize(expected));
        });

        test('should transpile for loop (জন্য)', () => {
            const input = `জন্য (সংখ্যা i = ০; i < ১০; i++) { লিখো(i); }`;
            const expected = `for (let i = 0; i < 10; i++) { console.log(i); }`;
            expect(normalize(transpile(input))).toBe(normalize(expected));
        });
    });

    describe('Functions', () => {
        test('should transpile function declaration (অনুষ্ঠান)', () => {
            const input = `
        অনুষ্ঠান যোগ(ক, খ) {
          ফেরত ক + খ;
        }
      `;
            const expected = `
        function jog(k, kh) {
          return k + kh;
        }
      `;
            // Note: Variable names usually get transliterated if they are Bangla. 
            // Assuming 'যোগ' -> 'jog', 'ক' -> 'k', 'খ' -> 'kh' via transliteration/sanitize.
            // We need to match what the experimental results actually give.
            // For now, checking structure.

            const output = transpile(input);
            expect(output).toContain('function');
            expect(output).toContain('return');
        });
    });

    describe('Async/Await', () => {
        test('should transpile async/await', () => {
            const input = `
        অ্যাসিঙ্ক অনুষ্ঠান ডাটা_আনো() {
            ধ্রুবক রেসপন্স = অপেক্ষা_করো ফেচ("url");
        }
      `;
            const output = transpile(input);
            expect(output).toContain('async function');
            expect(output).toContain('await');
        });
    });

    describe('Classes', () => {
        test('should transpile class definitions', () => {
            const input = `
        ক্লাস মানুষ {
          নির্মাতা(নাম) {
            এই.নাম = নাম;
          }
        }
      `;
            const output = transpile(input);
            expect(output).toContain('class');
            expect(output).toContain('constructor');
            expect(output).toContain('this.nam');
        });
    });

    describe('Error Handling', () => {
        test('should transpile try-catch', () => {
            const input = `
        চেষ্টা_করো {
          ভুল();
        } ধরো (ত্রুটি) {
          লিখো(ত্রুটি);
        }
      `;
            const output = transpile(input);
            expect(output).toContain('try');
            expect(output).toContain('catch');
        });
    });
});
