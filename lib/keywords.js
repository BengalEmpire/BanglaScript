/**
 * BanglaScript Keywords Mapping
 * Maps Bangla keywords and functions to their JavaScript equivalents
 */

const KEYWORDS = {
  // ==================== VARIABLES & DECLARATIONS ====================
  সংখ্যা: "let",
  শব্দ: "let",
  বাক্য: "let",
  চলক: "let",
  লেট: "let",
  পরিবর্তনশীল: "var",
  ভার: "var",
  ধ্রুবক: "const",
  ব্যাক্তি: "const",
  কনস্ট: "const",

  // ==================== FUNCTIONS & RETURNS ====================
  অনুষ্ঠান: "function",
  ফাংশন: "function",
  প্রেরণ: "return",
  ফেরত: "return",
  ফিরিয়ে_দাও: "return",

  // ==================== CONTROL FLOW ====================
  যদি: "if",
  নাহলে: "else",
  অন্যথায়: "else",
  নাহলে_যদি: "else if",
  অন্যথায়_যদি: "else if",

  // ==================== LOOPS ====================
  যখন: "while",
  যতক্ষণ: "while",
  জন্য: "for",
  প্রতিটি: "for",
  করো: "do",
  থামাও: "break",
  থামো_লুপ: "break",
  চালিয়ে_যাও: "continue",
  পরবর্তী: "continue",
  পুনরাবৃত্তি: "for",

  // ==================== OBJECTS & CLASSES ====================
  নতুন: "new",
  শ্রেণী: "class",
  ক্লাস: "class",
  গঠন: "constructor",
  নির্মাতা: "constructor",
  বিস্তৃত: "extends",
  সম্প্রসারিত: "extends",
  স্ট্যাটিক: "static",
  স্থির: "static",
  এটি: "this",
  এই: "this",
  সুপার: "super",
  অতিক্লাস: "super",

  // ==================== CONSOLE & LOGGING ====================
  লিখো: "console.log",
  ছাপাও: "console.log",
  প্রিন্ট: "console.log",
  দেখাও: "console.log",
  সমস্যা_লিখো: "console.log",
  ত্রুটি_লিখো: "console.error",
  লিখো_ত্রুটি: "console.error",
  লিখো_সতর্কতা: "console.warn",
  লিখো_সাবধান: "console.warn",
  লিখো_তথ্য: "console.info",
  পরিষ্কার_করো: "console.clear",
  টেবিল_দেখাও: "console.table",
  সময়_শুরু: "console.time",
  সময়_শেষ: "console.timeEnd",
  গণনা_করো: "console.count",
  ট্রেস_করো: "console.trace",

  // ==================== BOOLEAN & PRIMITIVES ====================
  সত্য: "true",
  সত্যি: "true",
  মিথ্যা: "false",
  মিছে: "false",
  শূন্য: "null",
  শুন্য: "null",
  নাল: "null",
  অনির্ধারিত: "undefined",
  অসংজ্ঞায়িত: "undefined",

  // ==================== EXCEPTION HANDLING ====================
  চেষ্টা: "try",
  চেষ্টা_করো: "try",
  ধরো: "catch",
  ধরা: "catch",
  অবশেষে: "finally",
  শেষে: "finally",
  ফেলা: "throw",
  নিক্ষেপ: "throw",
  ছুড়ে_দাও: "throw",

  // ==================== ASYNC & PROMISE ====================
  অপেক্ষা: "await",
  অপেক্ষা_করো: "await",
  অ্যাসিঙ্ক: "async",
  অসমকালীন: "async",

  // ==================== SWITCH STATEMENT ====================
  সুইচ: "switch",
  পরিবর্তন: "switch",
  কেস: "case",
  ক্ষেত্র: "case",
  ডিফল্ট: "default",
  সাধারণ: "default",

  // ==================== MODULE SYSTEM ====================
  আমদানি: "import",
  আনো: "import",
  রপ্তানি: "export",
  রফতানি: "export",
  পাঠাও: "export",
  থেকে: "from",
  হিসেবে: "as",
  হিসাবে: "as",
  যেমন: "as",

  // ==================== OPERATORS & TYPES ====================
  ইন: "in",
  ভিতরে: "in",
  মধ্যে: "in",
  অফ: "of",
  মধ্য: "of",
  এর: "of",
  টাইপ: "typeof",
  ধরন: "typeof",
  কিসের: "typeof",
  ইনস্ট্যান্স: "instanceof",
  উদাহরণ: "instanceof",
  ভ্যাড: "void",
  শূন্যতা: "void",
  মুছো: "delete",
  মুছে_ফেলো: "delete",

  // ==================== DEBUGGING ====================
  ডিবাগ: "debugger",
  থামো: "debugger",

  // ==================== DIALOG BOXES & BROWSER ====================
  ইনপুট: "prompt",
  জিজ্ঞাসা: "prompt",
  সতর্কতা_বক্স: "alert",
  সতর্কবার্তা: "alert",
  নিশ্চিত: "confirm",
  নিশ্চিত_করো: "confirm",

  // ==================== ARRAY METHODS ====================
  ঠেলো: "push",
  ঢোকাও: "push",
  তোলা: "pop",
  বের_করো: "pop",
  শিফট: "shift",
  প্রথম_সরাও: "shift",
  আনশিফট: "unshift",
  প্রথমে_যোগ: "unshift",
  কেটে_দাও: "splice",
  কাটো: "splice",
  খুঁজে: "find",
  খুঁজো: "find",
  শেষ_খুঁজো: "findLast",
  খুঁজে_সূচক: "findIndex",
  সূচক_খুঁজো: "findIndex",
  শেষ_সূচক_খুঁজো: "findLastIndex",
  অবস্থানে: "at",
  ম্যাপ: "map",
  ছাঁকনি: "filter",
  ফিল্টার: "filter",
  হ্রাস: "reduce",
  জোড়া: "join",
  ভাগ: "split",
  সাজাও: "sort",
  উল্টাও: "reverse",
  প্রতিটিতে: "forEach",
  কিছু: "some",
  সব: "every",
  অন্তর্ভুক্ত: "includes",
  ফ্ল্যাট: "flat",
  ফ্ল্যাট_ম্যাপ: "flatMap",
  ভরাট_করো: "fill",

  // ==================== STRING METHODS ====================
  দৈর্ঘ্য: "length",
  বড়হাতের: "toUpperCase",
  ছোটহাতের: "toLowerCase",
  ছাঁটাই: "trim",
  প্রতিস্থাপন: "replace",
  সব_প্রতিস্থাপন: "replaceAll",
  খণ্ড: "slice",
  উপস্ট্রিং: "substring",
  সূচকে: "indexOf",
  শেষ_সূচক: "lastIndexOf",
  শুরু_হয়: "startsWith",
  শেষ_হয়: "endsWith",
  পুনরাবৃত্তি_শব্দ: "repeat",

  // ==================== MATH OBJECT & METHODS ====================
  গণিত: "Math",
  পাই: "PI",
  বর্গমূল: "sqrt",
  শক্তি: "pow",
  পরম: "abs",
  সিলিং: "ceil",
  ফ্লোর: "floor",
  রাউন্ড: "round",
  সর্বোচ্চ: "max",
  সর্বনিম্ন: "min",
  এলোমেলো_সংখ্যা: "random",
  সাইন: "sin",
  কস: "cos",
  ট্যান: "tan",
  লগ: "log",

  // ==================== DATE & TIME ====================
  তারিখ: "Date",
  এখন: "now",
  পার্স_তারিখ: "parse",

  // ==================== GLOBAL HELPERS & TIMERS ====================
  পূর্ণসংখ্যা: "parseInt",
  দশমিক_সংখ্যা: "parseFloat",
  সংখ্যা_রূপান্তর: "Number",
  স্ট্রিং_রূপান্তর: "String",
  বুলিয়ান_রূপান্তর: "Boolean",
  দেরি_করো: "setTimeout",
  সেট_টাইমাউট: "setTimeout",
  নিয়মিত_করো: "setInterval",
  সেট_ইন্টারভাল: "setInterval",
  টাইমাউট_থামাও: "clearTimeout",
  ক্লিয়ার_টাইমাউট: "clearTimeout",
  ইন্টারভাল_থামাও: "clearInterval",
  ক্লিয়ার_ইন্টারভাল: "clearInterval",
  ফেচ: "fetch",

  // ==================== COLLECTIONS (Map, Set) ====================
  মানচিত্র: "Map",
  ম্যাপ_ক্লাস: "Map",
  সেট: "Set",
  উইক_ম্যাপ: "WeakMap",
  উইক_সেট: "WeakSet",

  // ==================== PROMISE ====================
  প্রমিজ: "Promise",
  প্রতিজ্ঞা: "Promise",
  প্রতিশ্রুতি: "Promise",
  সমাধান: "resolve",
  প্রত্যাখ্যান: "reject",
  সব_প্রমিজ: "Promise.all",
  দ্রুত_প্রমিজ: "Promise.race",
  যেকোনো_প্রমিজ: "Promise.any",
  নিষ্পত্তি_প্রমিজ: "Promise.allSettled",

  // ==================== JSON ====================
  জেসন: "JSON",
  শব্দসমূহ: "JSON.stringify",
  পার্স: "JSON.parse",
  বিশ্লেষণ: "JSON.parse",

  // ==================== OBJECT STATIC METHODS ====================
  অবজেক্ট_চাবি: "Object.keys",
  অবজেক্ট_মান: "Object.values",
  অবজেক্ট_জোড়া: "Object.entries",
  অবজেক্ট_স্থির: "Object.freeze",
  অবজেক্ট_নিযুক্ত: "Object.assign",

  // ==================== DOM BASICS ====================
  দস্তাবেজ: "document",
  ডকুমেন্ট: "document",
  নথি: "document",
  উইন্ডো: "window",
  জানালা: "window",
  বডি: "body",
  শিরোনাম: "title",

  // DOM Methods
  আইডি_দ্বারা_পাও: "getElementById",
  শ্রেণী_দ্বারা_পাও: "getElementsByClassName",
  ট্যাগ_দ্বারা_পাও: "getElementsByTagName",
  সিলেক্টর_দ্বারা_পাও: "querySelector",
  সব_সিলেক্টর_দ্বারা_পাও: "querySelectorAll",

  ইভেন্ট_শুনো: "addEventListener",
  ইভেন্ট_যোগ_করো: "addEventListener",
  ইভেন্ট_মুছো: "removeEventListener",
  ইভেন্ট_অপসারণ_করো: "removeEventListener",

  তৈরি_করো: "createElement",
  যোগ_করো: "appendChild",
  মুছ_ফেলো: "removeChild",

  সেট_করো: "setAttribute",
  যাপাও: "getAttribute",

  ক্লাস_যোগ_করো: "classList.add",
  ক্লাস_মুছো: "classList.remove",
  ক্লাস_টগল_করো: "classList.toggle",

  স্টাইল_প্রয়োগ_করো: "style",
  শৈলী: "style",

  বিষয়বস্তু_পরিবর্তন_করো: "innerHTML",
  টেক্সট_পরিবর্তন_করো: "innerText",

  // DOM Events
  ক্লিক: "click",
  প্রস্তুত_অবস্থা: "readyState",
  সম্পূর্ণ: "complete",
  ডকুমেন্ট_সামগ্রী_লোডেড: "DOMContentLoaded",

  // ==================== LOGICAL & COMPARISON OPERATORS ====================
  এবংএবং: "&&",
  অথবাঅথবা: "||",
  না: "!",
  নয়: "!",
  সমান: "===",
  অসমান: "!==",
  বড়: ">",
  ছোট: "<",
  বড়_বা_সমান: ">=",
  ছোট_বা_সমান: "<=",
};

module.exports = { KEYWORDS };