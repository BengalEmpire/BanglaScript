# 💻 কম্পিউটার এবং প্রোগ্রামিং সহজভাবে বাংলায়

এই ডকুমেন্টে আমরা সহজভাবে বাংলায় ব্যাখ্যা করব কম্পিউটার কীভাবে কাজ করে, প্রোগ্রামিং ভাষা কী, JavaScript, Node.js, এবং BanglaScript (BJS) সম্পর্কে। ছোট বড় সবাই বুঝতে পারবে এমনভাবে লেখা হয়েছে।

---

## ১. কম্পিউটার কীভাবে কাজ করে?

কম্পিউটার হলো একটি যন্ত্র, যা তথ্য (data) গ্রহণ করে, সেই তথ্য প্রক্রিয়া (process) করে এবং ফলাফল (output) দেয়।

### 🖥️ Hardware (হার্ডওয়্যার)

কম্পিউটার হার্ডওয়্যার হলো যে সমস্ত অংশ আমরা স্পর্শ করতে পারি, যেমন:

* **CPU (Central Processing Unit)** – এটি কম্পিউটারের মস্তিষ্ক, সব হিসাব-নিকাশ এবং নির্দেশনাকে সম্পাদন করে।
* **RAM** – দ্রুত অস্থায়ী স্মৃতি, যেখানে চলমান প্রোগ্রাম এবং তথ্য রাখা হয়।
* **Storage (HDD/SSD)** – তথ্য সংরক্ষণ করার জন্য।
* **Input devices** – কীবোর্ড, মাউস
* **Output devices** – মনিটর, প্রিন্টার

### 💾 Firmware

Firmware হলো ছোট প্রোগ্রাম যা সরাসরি হার্ডওয়্যারের সঙ্গে থাকে। এটি হার্ডওয়্যারকে কীভাবে কাজ করতে হবে তা বলে। উদাহরণ: BIOS বা UEFI।

### 🖧 OS (Operating System)

OS হলো সফটওয়্যার যা কম্পিউটার হার্ডওয়্যার এবং অন্যান্য সফটওয়্যারকে পরিচালনা করে। এটি ফাইল ম্যানেজমেন্ট, প্রোগ্রাম execution, input/output control ইত্যাদি করে। যেমন: Windows, Linux, macOS।

---

## ২. Software কি?

Software হলো কম্পিউটারে রান করা প্রোগ্রাম। এটি হার্ডওয়্যারকে নির্দেশ দেয় কীভাবে কাজ করতে হবে। উদাহরণ:

* Word processor
* Games
* Web browser

### Programing Language (প্রোগ্রামিং ভাষা)

প্রোগ্রামিং ভাষা হলো একটি নির্দিষ্ট নিয়ম এবং শব্দভাণ্ডার যা দিয়ে আমরা কম্পিউটারকে কাজ করার নির্দেশ দিই।

---

## ৩. কেন JavaScript?

JavaScript হলো একটি প্রোগ্রামিং ভাষা যা মূলত ওয়েব ব্রাউজারে ব্যবহার হয়। এটি:

* ওয়েব পেজকে interactive করে
* ব্রাউজারে রান হয় (client-side)
* Node.js দিয়ে সার্ভার-সাইডেও রান করা যায়

### Node.js কী?

Node.js হলো JavaScript runtime যা কম্পিউটার বা সার্ভারে JavaScript চালাতে সাহায্য করে। এটি ব্রাউজারের বাইরে JS কোড রান করতে সক্ষম।

### কেন ব্রাউজারে JavaScript রান করে?

কারণ ব্রাউজারেই ওয়েব পেজ দেখা হয়। JavaScript দিয়ে page interaction, animation, form validation করা যায়। এটি user-friendly ওয়েব experience দেয়।

---

## ৪. Programming ভাষার মূল বিষয়গুলো

### ৪.১ Data Type (ডেটা টাইপ)

ডেটা টাইপ হলো তথ্যের ধরন। উদাহরণ:

* সংখ্যা (Number)
* বাক্য/String
* সত্য(true) / মিথ্যা(false)
* শূন্য(null)
* তালিকা/Array
* সমাবেশ/Object

### ৪.২ Function (ফাংশন/অনুষ্ঠান)

Function হলো কোডের একটি ব্লক যা নির্দিষ্ট কাজ করে। উদাহরণ:

```bangla
অনুষ্ঠান যোগফল(a, b) {
  প্রেরণ a + b;
}
লিখো(যোগফল(৫, ৩));
```

### ৪.৩ Loop (লুপ)

Loop দিয়ে আমরা কোডকে বারবার চালাতে পারি।

```bangla
জন্য (সংখ্যা i = ০; i < ৫; i = i + ১) {
  লিখো(i);
}
```

---

## ৫. BanglaScript (BJS) কেন?

BanglaScript হলো একটি ট্রান্সপাইলার কম্পাইলার যা বাংলা ভাষায় কোড লেখা সম্ভব করে। উদ্দেশ্য:

* যারা English programming এ স্বচ্ছন্দ নয়, তারা বাংলা ভাষায় কোড লিখে শেখতে পারবে।
* কম্পিউটার ও প্রোগ্রামের লজিক সহজে বোঝা যায়।

### .js এবং .bjs ফাইল

* **.js** = JavaScript ফাইল (যা কম্পিউটার/ব্রাউজারে রান হয়)
* **.bjs** = BanglaScript ফাইল (যা কম্পাইল হয়ে .js ফাইলে রূপান্তরিত হয়)

### BanglaScript কিভাবে কাজ করে?

* তুমি `main.bjs` ফাইলে বাংলা কোড লেখো।
* BanglaScript transpiler সেই কোডকে JavaScript-এ রূপান্তর করে।
* Node.js বা ব্রাউজারে সেই কোড রান হয়।

---

## ৬. উদাহরণ BJS কোড

```bangla
সংখ্যা x = ১০;
সংখ্যা y = ৫;

অনুষ্ঠান যোগফল(a, b) {
  প্রেরণ a + b;
}
লিখো(যোগফল(x, y));
```

**ব্যাখ্যা:**

* সংখ্যা = let
* অনুষ্ঠান = function
* প্রেরণ = return
* লিখো = console.log

---

## 🧠 সংক্ষিপ্ত সারসংক্ষেপ

* কম্পিউটার = Hardware + Software
* Firmware = Hardware control program
* OS = Operating system manages everything
* Programming language = কম্পিউটারকে নির্দেশ দেওয়ার নিয়ম
* JavaScript = ওয়েবের জন্য programming language
* Node.js = JavaScript runtime outside browser
* BanglaScript = বাংলা ভাষায় programming শেখার জন্য transpiler
* .bjs → BanglaScript file, .js → compiled JavaScript file

BanglaScript দিয়ে তুমি সহজেই বাংলা ভাষায় কোড লিখে কম্পিউটারকে নির্দেশ দিতে পারবে। এটি শিক্ষার্থীদের জন্য একটি চমৎকার টুল।
