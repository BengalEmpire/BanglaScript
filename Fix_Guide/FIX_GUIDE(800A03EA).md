# Fix Guide: Microsoft JScript Error on Windows

If you see this error when running **BanglaScript** (or any Node.js CLI tool):

```
Source: Microsoft JScript compilation error
Code: 800A03EA
Error: Syntax error
```

### What’s Happening

Windows is running your `.js` file using **Windows Script Host (JScript)** instead of **Node.js**.

That’s why you’re getting syntax errors — JScript doesn’t understand modern JavaScript (ES6+).

---

### Quick Fix (Permanent Solution)

**Run these commands once in an Administrator Command Prompt:**

```bash
assoc .js=jsfile
ftype jsfile="%ProgramFiles%\nodejs\node.exe" "%1" %*
```

Then verify:

```bash
assoc .js
ftype jsfile
```

You should see something like:

```
.js=jsfile
jsfile="C:\Program Files\nodejs\node.exe" "%1" %*
```

---

### Why This Works

These commands re-associate all `.js` files in Windows to open with **Node.js**,
not the legacy **Windows Script Host**.

After this, all global npm packages (like `banglascript`, `npx`, etc.) will run correctly — no more JScript errors.

---

### Optional Check

You can test it:

```bash
bjs --version
```

If it runs without an error, the fix worked.

---

### Temporary Workaround (If You Can’t Change Associations)

Instead of running:

```bash
bjs
```

Run it explicitly with Node:

```bash
node "%AppData%\npm\node_modules\banglascript\bin\bjs.js"
```

…but the permanent fix above is highly recommended.

---

**Recommended:** Apply the permanent fix once and you’ll never face this again.

---
