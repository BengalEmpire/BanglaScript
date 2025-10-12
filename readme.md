# BanglaScript

**বাংলা ভাষায় JavaScript প্রোগ্রামিং!**

BanglaScript একটি transpiler যা আপনাকে বাংলা ভাষায় JavaScript কোড লিখতে দেয়। আপনার বাংলা কোড স্বয়ংক্রিয়ভাবে JavaScript এ রূপান্তরিত হয় এবং Node.js দিয়ে চলে।

## 🚀 ইনস্টলেশন

### Global Installation (সুপারিশকৃত)

```bash
npm install -g banglascript
```

### Local Installation

```bash
npm install --save-dev banglascript
```

## 📖 দ্রুত শুরু

### 1. নতুন প্রজেক্ট তৈরি করুন

```bash
bjs init my-first-project
cd my-first-project
```

### 2. BanglaScript ফাইল তৈরি করুন

`hello.bjs` ফাইল তৈরি করুন:

```banglascript
অনুষ্ঠান শুভেচ্ছা(নাম) {
  লিখো("হ্যালো, " + নাম + "!");
}

বাক্য নাম = "বিশ্ব";
শুভেচ্ছা(নাম);
```

### 3. চালান

```bash
bjs run hello.bjs
```

## 🛠️ CLI Commands

### Build Command
`.bjs` ফাইল থেকে `.js` ফাইল তৈরি করে:

```bash
bjs build <file> [options]

# উদাহরণ:
bjs build src/main.bjs
bjs build src/main.bjs --out dist
```

**Options:**
- `-o, --out <dir>` - Output directory (default: `build`)
- `-w, --watch` - Watch mode চালু করুন

### Run Command
Build করে সাথে সাথে Node.js দিয়ে চালায়:

```bash
bjs run <file> [options]

# উদাহরণ:
bjs run src/main.bjs
bjs run src/main.bjs --out dist
```

### Watch Command
ফাইল পরিবর্তন হলে স্বয়ংক্রিয়ভাবে rebuild করে:

```bash
bjs watch <file> [options]

# উদাহরণ:
bjs watch src/main.bjs
```

### Init Command
নতুন BanglaScript প্রজেক্ট তৈরি করে:

```bash
bjs init [project-name]

# উদাহরণ:
bjs init my-project
```

### Keywords Command
সব available keywords দেখায়:

```bash
bjs keywords
```

## 📚 Keywords Reference

### Variable Declaration (চলক ঘোষণা)

| বাংলা | JavaScript | উদাহরণ |
|-------|------------|---------|
| `বাক্য` | `let` | `বাক্য নাম = "রহিম";` |
| `সংখ্যা` | `let` | `সংখ্যা বয়স = ২৫;` |
| `ধ্রুবক` | `const` | `ধ্রুবক PI = ৩.১৪;` |
| `পরিবর্তনশীল` | `var` | `পরিবর্তনশীল x = ১০;` |

### Functions (ফাংশন)

| বাংলা | JavaScript | উদাহরণ |
|-------|------------|---------|
| `অনুষ্ঠান` | `function` | `অনুষ্ঠান যোগ(a, b) { ... }` |
| `ফাংশন` | `function` | `ফাংশন গুণ(x, y) { ... }` |
| `প্রেরণ` | `return` | `প্রেরণ a + b;` |
| `ফেরত` | `return` | `ফেরত ফলাফল;` |

### Control Flow (নিয়ন্ত্রণ প্রবাহ)

| বাংলা | JavaScript | উদাহরণ |
|-------|------------|---------|
| `যদি` | `if` | `যদি (বয়স >= ১৮) { ... }` |
| `নাহলে` | `else` | `নাহলে { ... }` |
| `অন্যথায়` | `else` | `অন্যথায় { ... }` |
| `নাহলে_যদি` | `else if` | `নাহলে_যদি (বয়স < ১৮) { ... }` |

### Loops (লুপ)

| বাংলা | JavaScript | উদাহরণ |
|-------|------------|---------|
| `জন্য` | `for` | `জন্য (বাক্য i = ০; i < ১০; i++) { ... }` |
| `যখন` | `while` | `যখন (শর্ত) { ... }` |
| `করো` | `do` | `করো { ... } যখন (শর্ত);` |
| `থামাও` | `break` | `থামাও;` |
| `চালিয়ে_যাও` | `continue` | `চালিয়ে_যাও;` |

### Console Output (কনসোল আউটপুট)

| বাংলা | JavaScript | উদাহরণ |
|-------|------------|---------|
| `লিখো` | `console.log` | `লিখো("হ্যালো");` |
| `ছাপাও` | `console.log` | `ছাপাও(মান);` |
| `সমস্যা_লিখো` | `console.error` | `সমস্যা_লিখো("ত্রুটি!");` |
| `সতর্কতা` | `console.warn` | `সতর্কতা("সাবধান");` |
| `তথ্য` | `console.info` | `তথ্য("তথ্য");` |

### Boolean & Null

| বাংলা | JavaScript |
|-------|------------|
| `সত্য` | `true` |
| `মিথ্যা` | `false` |
| `শূন্য` | `null` |
| `অনির্ধারিত` | `undefined` |

### Object-Oriented Programming (OOP)

| বাংলা | JavaScript | উদাহরণ |
|-------|------------|---------|
| `শ্রেণী` | `class` | `শ্রেণী ব্যক্তি { ... }` |
| `নতুন` | `new` | `বাক্য obj = নতুন ব্যক্তি();` |
| `গঠন` | `constructor` | `গঠন(নাম) { ... }` |
| `এটি` | `this` | `এটি.নাম = নাম;` |
| `বিস্তৃত` | `extends` | `শ্রেণী ছাত্র বিস্তৃত ব্যক্তি { ... }` |

### Error Handling (ত্রুটি নিয়ন্ত্রণ)

| বাংলা | JavaScript | উদাহরণ |
|-------|------------|---------|
| `চেষ্টা` | `try` | `চেষ্টা { ... }` |
| `ধরো` | `catch` | `ধরো (ত্রুটি) { ... }` |
| `অবশেষে` | `finally` | `অবশেষে { ... }` |
| `ফেলা` | `throw` | `ফেলা নতুন Error("ত্রুটি");` |

### Async Programming

| বাংলা | JavaScript | উদাহরণ |
|-------|------------|---------|
| `অ্যাসিঙ্ক` | `async` | `অ্যাসিঙ্ক অনুষ্ঠান getData() { ... }` |
| `অপেক্ষা` | `await` | `বাক্য data = অপেক্ষা fetch(url);` |
| `প্রতিজ্ঞা` | `Promise` | `নতুন প্রতিজ্ঞা((resolve, reject) => { ... })` |

## 💡 উদাহরণ Programs

### 1. সাধারণ Calculator

```banglascript
// calculator.bjs

অনুষ্ঠান যোগ(a, b) {
  প্রেরণ a + b;
}

অনুষ্ঠান বিয়োগ(a, b) {
  প্রেরণ a - b;
}

অনুষ্ঠান গুণ(a, b) {
  প্রেরণ a * b;
}

অনুষ্ঠান ভাগ(a, b) {
  যদি (b === ০) {
    প্রেরণ "ভাগ করা সম্ভব নয়!";
  }
  প্রেরণ a / b;
}

বাক্য x = ১০;
বাক্য y = ৫;

লিখো("যোগ: " + যোগ(x, y));
লিখো("বিয়োগ: " + বিয়োগ(x, y));
লিখো("গুণ: " + গুণ(x, y));
লিখো("ভাগ: " + ভাগ(x, y));
```

### 2. Class উদাহরণ

```banglascript
// person.bjs

শ্রেণী ব্যক্তি {
  গঠন(নাম, বয়স) {
    এটি.নাম = নাম;
    এটি.বয়স = বয়স;
  }

  পরিচয়() {
    লিখো("আমার নাম " + এটি.নাম + " এবং বয়স " + এটি.বয়স);
  }
}

বাক্য ব্যক্তি১ = নতুন ব্যক্তি("করিম", ২৫);
ব্যক্তি১.পরিচয়();
```

### 3. Array Operations

```banglascript
// array-example.bjs

বাক্য সংখ্যা_তালিকা = [১, ২, ৩, ৪, ৫];

লিখো("তালিকা: " + সংখ্যা_তালিকা);

জন্য (বাক্য i = ০; i < সংখ্যা_তালিকা.length; i++) {
  লিখো("সূচক " + i + ": " + সংখ্যা_তালিকা[i]);
}

// যোগফল বের করা
বাক্য মোট = ০;
জন্য (বাক্য সংখ্যা of সংখ্যা_তালিকা) {
  মোট = মোট + সংখ্যা;
}

লিখো("মোট যোগফল: " + মোট);
```

### 4. ত্রুটি নিয়ন্ত্রণ

```banglascript
// error-handling.bjs

অনুষ্ঠান ভাগ_করো(লব, হর) {
  চেষ্টা {
    যদি (হর === ০) {
      ফেলা নতুন Error("শূন্য দিয়ে ভাগ করা যায় না");
    }
    প্রেরণ লব / হর;
  } ধরো (ত্রুটি) {
    সমস্যা_লিখো("ত্রুটি: " + ত্রুটি.message);
    প্রেরণ শূন্য;
  } অবশেষে {
    লিখো("ভাগ প্রক্রিয়া সম্পন্ন");
  }
}

বাক্য ফলাফল = ভাগ_করো(১০, ০);
লিখো("ফলাফল: " + ফলাফল);
```

## 🌟 Word Translation

BanglaScript স্বয়ংক্রিয়ভাবে বাংলা variable/function নাম ইংরেজিতে translate করে। আপনি `lib/translate-words.js` ফাইলে নতুন শব্দ যোগ করতে পারেন।

```banglascript
// বাংলায় লেখা
বাক্য নাম = "রহিম";
বাক্য বয়স = ২৫;

// JavaScript এ রূপান্তরিত হয়
let name = "রহিম";
let age = ২৫;
```

## 🔧 Source Maps

BanglaScript source maps তৈরি করে, যা debugging সহজ করে। যদি কোন error হয়, আপনি original `.bjs` ফাইলে exact লাইন নম্বর পাবেন।

## 📦 Package.json Scripts

আপনার project এ এই scripts যোগ করুন:

```json
{
  "scripts": {
    "build": "bjs build src/main.bjs",
    "start": "bjs run src/main.bjs",
    "watch": "bjs watch src/main.bjs"
  }
}
```

## 🤝 অবদান রাখুন

BanglaScript একটি open-source project। আপনি নতুন keywords, translations, বা features যোগ করতে পারেন!

1. Repository fork করুন
2. নতুন feature branch তৈরি করুন
3. Changes commit করুন
4. Pull request পাঠান

## 📄 License

MIT License - বিস্তারিত দেখুন LICENSE ফাইলে

## 🙏 স্বীকৃতি

- Babel - Parsing এবং code generation এর জন্য
- Commander.js - CLI তৈরির জন্য
- Chokidar - File watching এর জন্য

## 📞 যোগাযোগ

সমস্যা বা প্রশ্ন থাকলে GitHub Issues ব্যবহার করুন।

---

**বাংলা ভাষায় কোড লিখুন**

---


## Project Links

-   **Docs Site:**  [https://bangla-script.vercel.app/](https://bangla-script.vercel.app/)
-   **GitHub:**  [https://github.com/BengalEmpire/BanglaScript](https://github.com/BengalEmpire/BanglaScript)
-   **NPM:**  [https://npmjs.com/package/banglascript](https://npmjs.com/package/banglascript)