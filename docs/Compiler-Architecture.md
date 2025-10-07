#  BanglaScript Compiler — গঠন ও কাজের প্রক্রিয়া (পরিকল্পনাধীন)

BanglaScript (BJS) একটি ট্রান্সপাইলার (Transpiler) বা ভাষা রূপান্তরকারী, যা বাংলা ভাষায় লেখা কোডকে JavaScript-এ রূপান্তর করে এবং ব্রাউজার বা Node.js-এ চালাতে সাহায্য করে।

---

## 🧩 ১. Compiler কী?

কম্পাইলার হলো এমন একটি সফটওয়্যার, যা উচ্চস্তরের ভাষা (যেমন BanglaScript) থেকে নিম্নস্তরের ভাষা (যেমন JavaScript বা Machine Code)-এ রূপান্তর করে, যাতে কম্পিউটার সেটি বুঝতে পারে।

BanglaScript আসলে **JavaScript-এ ট্রান্সপাইল** করে, তাই এটি Browser ও Node.js—উভয় জায়গায় চলতে পারে।

---

## 🏗️ ২. BanglaScript Compiler এর ধাপসমূহ

BanglaScript Compiler সাধারণত ৪টি ধাপে কাজ করে:

### ১️⃣ **Tokenization (Lexical Analysis)**

বাংলা ভাষায় লেখা কোডকে ছোট ছোট অংশে (টোকেন) ভেঙে ফেলা হয়।

উদাহরণ:

```bangla
অনুষ্ঠান মূল() {
  লিখো("হ্যালো বাংলা!");
}
```

➡️ টোকেন আকারে:

```
[অনুষ্ঠান, মূল, (, ), {, লিখো, (, “হ্যালো বাংলা!”, ), }, EOF]
```

### ২️⃣ **Parsing (Syntax Analysis)**

টোকেনগুলো বিশ্লেষণ করে প্রোগ্রামের গঠন (Syntax Tree বা AST - Abstract Syntax Tree) তৈরি হয়।

### ৩️⃣ **Translation (Conversion)**

এই AST ব্যবহার করে বাংলা শব্দগুলো JavaScript কোডে অনুবাদ করা হয়।

উদাহরণ:

```bangla
অনুষ্ঠান মূল() {
  লিখো("হ্যালো বাংলা!");
}
```

➡️ রূপান্তরিত JavaScript:

```js
function main() {
  console.log("হ্যালো বাংলা!");
}
```

### ৪️⃣ **Execution (চালানো)**

রূপান্তরিত কোডটি JavaScript runtime (Node.js বা Browser)-এ চালানো হয়।

---

## 🧠 ৩. Keywords Mapping (বাংলা → JavaScript)

| BanglaScript শব্দ | JavaScript সমতুল্য |
| ----------------- | ------------------ |
| অনুষ্ঠান          | function           |
| প্রেরণ            | return             |
| লিখো              | console.log        |
| সংখ্যা            | let                |
| বাক্য             | let                |
| তথ্য              | const              |
| সমাবেশ            | object             |
| যদি               | if                 |
| নাহলে             | else               |
| জন্য              | for                |
| যতক্ষণ            | while              |
| সত্য              | true               |
| মিথ্যা            | false              |

---

## 💾 ৪. ফাইল এক্সটেনশন: `.bjs`

BanglaScript কোড সাধারণত `.bjs` এক্সটেনশনে সংরক্ষণ করা হয়।

উদাহরণ:

```
main.bjs
```

এই ফাইলটি কম্পাইলার ব্যবহার করে JavaScript ফাইলে রূপান্তর করা হয়:

```
main.js
```

তারপর Node.js বা ব্রাউজার-এ চালানো যায়:

```bash
node main.js
```

---

## ⚡ ৫. উদাহরণ — পূর্ণ প্রক্রিয়া

**১️⃣ main.bjs:**

```bangla
অনুষ্ঠান শুভেচ্ছা() {
  লিখো("স্বাগতম, BanglaScript!");
}

শুভেচ্ছা();
```

**২️⃣ Compiler Output (main.js):**

```js
function shubhechha() {
  console.log("স্বাগতম, BanglaScript!");
}

shubhechha();
```

**৩️⃣ রান করলে আউটপুট:**

```
স্বাগতম, BanglaScript!
```

---

## 🧰 ৬. Compiler এর গঠন (Modules)

BanglaScript Compiler নিচের প্রধান মডিউল নিয়ে গঠিত:

1. **Lexer** – কোডকে টোকেনে বিভক্ত করে।
2. **Parser** – টোকেন থেকে Syntax Tree (AST) তৈরি করে।
3. **Translator** – AST থেকে JavaScript কোড তৈরি করে।
4. **Emitter** – নতুন `.js` ফাইল হিসেবে সংরক্ষণ করে।

---

## 🔥 ৭. Compiler রান করা

```bash
bjs build main.bjs
```

➡️ Output:

```
✅ main.js ফাইল সফলভাবে তৈরি হয়েছে!
```

---

## 🚀 ৮. ভবিষ্যৎ পরিকল্পনা

* BanglaScript IDE (Web Editor)
* BanglaScript Runtime (Node.js ভিত্তিক)
* Browser Plugin — যাতে `.bjs` সরাসরি ব্রাউজারে চলতে পারে
* শিক্ষামূলক কোর্স ও শিশুদের জন্য BanglaScript Playground 🎓

---

## 📘 উপসংহার

BanglaScript মূলত একটি সেতু — বাংলা ভাষায় লেখা কোডকে JavaScript-এর শক্তিশালী ইকোসিস্টেমে নিয়ে যায়। এতে করে নতুন প্রোগ্রামাররা মাতৃভাষায় কোড শেখার পাশাপাশি আন্তর্জাতিক মানের প্রোগ্রামিং স্কিল অর্জন করতে পারে।

**BanglaScript: মাতৃভাষায় কোড লেখো, JavaScript চালাও! 💡**
