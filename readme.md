# BanglaScript (BJS) — AST-Based Transpiler

**Write JavaScript in Bangla (বাংলা)**

BanglaScript (BJS) is an **AST-based transpiler** that allows you to write code in the **Bangla language**, then automatically **translates it into JavaScript (JS)**.
Run your BanglaScript code seamlessly in **Node.js** or any modern **web browser**.

---

## 🚀 Features

✅ Write clean, readable Bangla code
✅ Converts Bangla syntax to valid JavaScript
✅ Runs directly in Node.js or browsers
✅ Supports `.bjs` file extension
✅ Built-in CLI with **build**, **run**, and **watch** modes
✅ AST (Abstract Syntax Tree) powered transformation for accuracy

---

## 📦 Installation

Install globally using **npm**:

```bash
npm install -g banglascript
```

Or locally in your project:

```bash
npm install banglascript --save-dev
```

---

## Usage

### Build (Transpile to JavaScript)

Transpile your BanglaScript file into JavaScript:

```bash
bjs build app.bjs --out dist
```

This will generate `app.js` in the `dist/` directory.

---

### ▶️ Run (Execute BanglaScript directly)

Run your BanglaScript file instantly with:

```bash
bjs run app.bjs
```

The transpiler will compile and execute the code in one step.

---

###  Watch (Auto Rebuild on Save)

Automatically recompile when changes are detected:

```bash
bjs watch app.bjs
```

---

## 📁 File Extension

All BanglaScript source files should use the `.bjs` extension.
Example:

```
hello.bjs
main.bjs
module.bjs
```

---

## 💡 Example

**hello.bjs**

```bangla
লিখো("হ্যালো বিশ্ব!");
যদি (বয়স > ১৮) {
    লিখো("তুমি প্রাপ্তবয়স্ক!");
}
```

Transpiles to:

```javascript
console.log("হ্যালো বিশ্ব!");
if (age > 18) {
    console.log("তুমি প্রাপ্তবয়স্ক!");
}
```

---

##  CLI Commands Summary

| Command            | Description                      | Example                        |
| ------------------ | -------------------------------- | ------------------------------ |
| `bjs build <file>` | Transpile BanglaScript to JS     | `bjs build app.bjs --out dist` |
| `bjs run <file>`   | Run BanglaScript directly        | `bjs run test.bjs`             |
| `bjs watch <file>` | Watch for changes & auto rebuild | `bjs watch main.bjs`           |

---

##  Tech Behind BanglaScript

* **Parser:** Acorn / Babel AST
* **Runtime:** Node.js
* **Transpilation:** Token mapping between Bangla keywords and JavaScript syntax

---

## Project Links

* **Docs Site:** Upcoming!
* **GitHub:** [https://github.com/BengalEmpire/BanglaScript](https://github.com/BengalEmpire/BanglaScript)
* **NPM:** [https://npmjs.com/package/banglascript](https://npmjs.com/package/banglascript)

---
