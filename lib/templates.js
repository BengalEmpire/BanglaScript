/**
 * BanglaScript Project Templates
 * Tested and working templates for different project types
 */

const fs = require("fs");
const path = require("path");

// ==================== BASIC CONSOLE TEMPLATE ====================
const basicTemplate = {
    name: "basic",
    displayName: "বেসিক প্রজেক্ট (Basic Console App)",
    description: "Simple console-based BanglaScript project",
    files: {
        "src/main.bjs": `// বাংলাস্ক্রিপ্ট - বেসিক প্রজেক্ট

ব্যাক্তি নাম = "মাহমুদ";
পরিবর্তনশীল বয়স = ২০;
বাক্য পেশা = "একজন কম্পিউটার প্রোগ্রামার";

অনুষ্ঠান পরিচয়() {
    লিখো("নাম: " + নাম);
    লিখো("বয়স: " + বয়স);
    লিখো("পেশা: " + পেশা);
}

পরিচয়();

// গ্রেড ক্যালকুলেটর
সংখ্যা নম্বর = ৮৫;
যদি (নম্বর >= ৮০) {
    লিখো("গ্রেড: A+ 🎉");
} নাহলে যদি (নম্বর >= ৬০) {
    লিখো("গ্রেড: B ✓");
} নাহলে {
    লিখো("আরো চেষ্টা করুন! 💪");
}

// লুপ উদাহরণ
লিখো("🔢 সংখ্যা গণনা:");
জন্য (সংখ্যা i = ১; i <= ৫; i++) {
    লিখো("→ সংখ্যা: " + i);
}
লিখো("✓ সম্পন্ন!");

// র‍্যান্ডম সংখ্যা
লিখো("🎲 র‍্যান্ডম সংখ্যা:", এলোমেলো_সংখ্যা());
`,
        "package.json": (name) => JSON.stringify({
            name: name,
            version: "1.0.0",
            description: "BanglaScript প্রজেক্ট",
            main: "build/main.js",
            scripts: {
                build: "bjs build src/main.bjs -o build",
                start: "node build/main.js",
                dev: "bjs run src/main.bjs"
            },
            keywords: ["banglascript"],
            author: "",
            license: "MIT"
        }, null, 2),
        "README.md": (name) => `# ${name}

বাংলাস্ক্রিপ্ট প্রজেক্ট

## ব্যবহার

\`\`\`bash
npm run build
npm start
\`\`\`

অথবা সরাসরি:
\`\`\`bash
bjs run src/main.bjs
\`\`\`
`,
        ".gitignore": `node_modules/
build/
.banglascript-cache/
*.log
`
    }
};

// ==================== WEB APP TEMPLATE ====================
const webTemplate = {
    name: "web",
    displayName: "ওয়েব অ্যাপ (Web Application)",
    description: "Web application with HTML, CSS, and BanglaScript",
    files: {
        "src/main.bjs": `// বাংলাস্ক্রিপ্ট - ওয়েব অ্যাপ

দস্তাবেজ.ইভেন্ট_যোগ_করো("DOMContentLoaded", অনুষ্ঠান () {
    লিখো("পেজ লোড হয়েছে!");
    
    // শিরোনাম সেট করুন
    ধ্রুবক শিরোনাম = দস্তাবেজ.সিলেক্টর_দ্বারা_পাও("#title");
    যদি (শিরোনাম) {
        শিরোনাম.টেক্সট_পরিবর্তন_করো = "বাংলাস্ক্রিপ্ট ওয়েব অ্যাপ";
    }
    
    // বোতাম ইভেন্ট
    ধ্রুবক বোতাম = দস্তাবেজ.সিলেক্টর_দ্বারা_পাও("#btn");
    ধ্রুবক ফলাফল = দস্তাবেজ.সিলেক্টর_দ্বারা_পাও("#result");
    
    যদি (বোতাম) {
        বোতাম.ইভেন্ট_যোগ_করো("click", অনুষ্ঠান () {
            ধ্রুবক নাম = দস্তাবেজ.সিলেক্টর_দ্বারা_পাও("#name-input").value;
            যদি (নাম) {
                ফলাফল.বিষয়বস্তু_পরিবর্তন_করো = "স্বাগতম <b>" + নাম + "</b>! 🎉";
            } নাহলে {
                ফলাফল.টেক্সট_পরিবর্তন_করো = "দয়া করে নাম লিখুন!";
            }
        });
    }
    
    // কাউন্টার
    পরিবর্তনশীল count = ০;
    ধ্রুবক countDisplay = দস্তাবেজ.সিলেক্টর_দ্বারা_পাও("#counter");
    ধ্রুবক incBtn = দস্তাবেজ.সিলেক্টর_দ্বারা_পাও("#inc");
    ধ্রুবক decBtn = দস্তাবেজ.সিলেক্টর_দ্বারা_পাও("#dec");
    
    যদি (incBtn) {
        incBtn.ইভেন্ট_যোগ_করো("click", অনুষ্ঠান () {
            count = count + ১;
            countDisplay.টেক্সট_পরিবর্তন_করো = count;
        });
    }
    
    যদি (decBtn) {
        decBtn.ইভেন্ট_যোগ_করো("click", অনুষ্ঠান () {
            count = count - ১;
            countDisplay.টেক্সট_পরিবর্তন_করো = count;
        });
    }
});
`,
        "index.html": (name) => `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h1 id="title">বাংলাস্ক্রিপ্ট</h1>
        
        <div class="card">
            <h2>নাম লিখুন</h2>
            <input type="text" id="name-input" placeholder="আপনার নাম...">
            <button id="btn">জমা দিন</button>
            <p id="result"></p>
        </div>
        
        <div class="card">
            <h2>কাউন্টার</h2>
            <div class="counter">
                <button id="dec">-</button>
                <span id="counter">০</span>
                <button id="inc">+</button>
            </div>
        </div>
    </div>
    <script src="build/main.js"></script>
</body>
</html>
`,
        "style.css": `* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
    font-family: 'Noto Sans Bengali', sans-serif; 
    background: linear-gradient(135deg, #667eea, #764ba2);
    min-height: 100vh; 
    padding: 20px;
}
.container { max-width: 600px; margin: 0 auto; }
h1 { color: white; text-align: center; margin-bottom: 20px; font-size: 2rem; }
.card { 
    background: white; 
    border-radius: 16px; 
    padding: 24px; 
    margin-bottom: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.card h2 { color: #4a5568; margin-bottom: 16px; }
input { 
    width: 100%; 
    padding: 12px; 
    border: 2px solid #e2e8f0; 
    border-radius: 8px; 
    font-size: 16px;
    margin-bottom: 12px;
}
button { 
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
}
button:hover { background: #5a67d8; }
#result { margin-top: 16px; font-size: 18px; }
.counter { display: flex; align-items: center; justify-content: center; gap: 20px; }
.counter span { font-size: 3rem; font-weight: bold; color: #667eea; min-width: 80px; text-align: center; }
.counter button { font-size: 24px; width: 50px; height: 50px; border-radius: 50%; }
`,
        "package.json": (name) => JSON.stringify({
            name: name,
            version: "1.0.0",
            description: "BanglaScript ওয়েব অ্যাপ",
            scripts: {
                build: "bjs build src/main.bjs -o build",
                dev: "bjs watch src/main.bjs -o build"
            },
            keywords: ["banglascript", "web"],
            author: "",
            license: "MIT"
        }, null, 2),
        "README.md": (name) => `# ${name}

BanglaScript ওয়েব অ্যাপ

## ব্যবহার

\`\`\`bash
npm run build
\`\`\`

তারপর index.html ব্রাউজারে খুলুন।
`,
        ".gitignore": `node_modules/
build/
.banglascript-cache/
`
    }
};

// ==================== API SERVER TEMPLATE ====================
const apiTemplate = {
    name: "api",
    displayName: "API সার্ভার (REST API)",
    description: "Node.js REST API server with BanglaScript",
    files: {
        "src/server.bjs": `// বাংলাস্ক্রিপ্ট - API সার্ভার

ধ্রুবক http = require("http");
ধ্রুবক PORT = 3000;

// ডাটা
পরিবর্তনশীল users = [
    { id: 1, name: "রহিম" },
    { id: 2, name: "করিম" },
    { id: 3, name: "ফাতিমা" }
];

// সার্ভার তৈরি
ধ্রুবক server = http.createServer(অনুষ্ঠান (req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    যদি (req.url === "/" && req.method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "বাংলাস্ক্রিপ্ট API সার্ভার",
            endpoints: ["GET /users", "GET /health"]
        }));
    } নাহলে যদি (req.url === "/users" && req.method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({ count: users.length, users: users }));
    } নাহলে যদি (req.url === "/health" && req.method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
    } নাহলে {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "রাউট পাওয়া যায়নি" }));
    }
});

server.listen(PORT, অনুষ্ঠান () {
    লিখো("সার্ভার চালু হয়েছে: http://localhost:" + PORT);
    লিখো("এন্ডপয়েন্টস:");
    লিখো("  GET /       - API তথ্য");
    লিখো("  GET /users  - সব ব্যবহারকারী");
    লিখো("  GET /health - সার্ভার স্বাস্থ্য");
});
`,
        "package.json": (name) => JSON.stringify({
            name: name,
            version: "1.0.0",
            description: "BanglaScript API সার্ভার",
            main: "build/server.js",
            scripts: {
                build: "bjs build src/server.bjs -o build",
                start: "node build/server.js",
                dev: "npm run build && npm start"
            },
            keywords: ["banglascript", "api"],
            author: "",
            license: "MIT"
        }, null, 2),
        "README.md": (name) => `# ${name}

BanglaScript API সার্ভার

## ব্যবহার

\`\`\`bash
npm run build
npm start
\`\`\`

তার পর http://localhost:3000 খুলুন।
`,
        ".gitignore": `node_modules/
build/
.banglascript-cache/
`
    }
};

// ==================== FULLSTACK TEMPLATE ====================
const fullstackTemplate = {
    name: "fullstack",
    displayName: "ফুলস্ট্যাক অ্যাপ (Fullstack)",
    description: "Complete fullstack application with frontend and backend",
    files: {
        "src/server.bjs": `// বাংলাস্ক্রিপ্ট - ফুলস্ট্যাক সার্ভার

ধ্রুবক http = require("http");
ধ্রুবক fs = require("fs");
ধ্রুবক path = require("path");

ধ্রুবক PORT = 3000;

// MIME টাইপস
ধ্রুবক mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json"
};

// টুডু ডাটা
পরিবর্তনশীল todos = [
    { id: 1, text: "বাংলাস্ক্রিপ্ট শিখুন", done: false }
];

// সার্ভার
ধ্রুবক server = http.createServer(অনুষ্ঠান (req, res) {
    ধ্রুবক url = req.url;
    ধ্রুবক method = req.method;
    
    // API রাউটস
    যদি (url === "/api/todos" && method === "GET") {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify(todos));
        প্রেরণ;
    }
    
    // স্ট্যাটিক ফাইল সার্ভ
    পরিবর্তনশীল filePath = url === "/" ? "/index.html" : url;
    filePath = path.join(__dirname, "..", "public", filePath);
    
    ধ্রুবক ext = path.extname(filePath);
    ধ্রুবক contentType = mimeTypes[ext] || "text/plain";
    
    fs.readFile(filePath, অনুষ্ঠান (err, data) {
        যদি (err) {
            res.writeHead(404);
            res.end("File not found");
            প্রেরণ;
        }
        res.setHeader("Content-Type", contentType);
        res.writeHead(200);
        res.end(data);
    });
});

server.listen(PORT, অনুষ্ঠান () {
    লিখো("সার্ভার চালু: http://localhost:" + PORT);
});
`,
        "src/app.bjs": `// ফ্রন্টএন্ড অ্যাপ

দস্তাবেজ.ইভেন্ট_যোগ_করো("DOMContentLoaded", অনুষ্ঠান () {
    লিখো("অ্যাপ লোড হয়েছে");
    টুডু_লোড();
});

অনুষ্ঠান টুডু_লোড() {
    fetch("/api/todos")
        .then(অনুষ্ঠান (res) { প্রেরণ res.json(); })
        .then(অনুষ্ঠান (todos) {
            ধ্রুবক list = দস্তাবেজ.সিলেক্টর_দ্বারা_পাও("#todo-list");
            list.বিষয়বস্তু_পরিবর্তন_করো = "";
            জন্য (পরিবর্তনশীল i = 0; i < todos.length; i++) {
                ধ্রুবক todo = todos[i];
                list.বিষয়বস্তু_পরিবর্তন_করো = list.বিষয়বস্তু_পরিবর্তন_করো + "<li>" + todo.text + "</li>";
            }
        });
}
`,
        "public/index.html": (name) => `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Noto Sans Bengali', sans-serif; background: #f0f4f8; padding: 40px; }
        .container { max-width: 500px; margin: 0 auto; }
        h1 { text-align: center; margin-bottom: 20px; }
        ul { list-style: none; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        li { padding: 16px; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <h1>টুডু অ্যাপ</h1>
        <ul id="todo-list"></ul>
    </div>
    <script src="build/app.js"></script>
</body>
</html>
`,
        "package.json": (name) => JSON.stringify({
            name: name,
            version: "1.0.0",
            description: "BanglaScript ফুলস্ট্যাক অ্যাপ",
            scripts: {
                "build:client": "bjs build src/app.bjs -o public/build",
                "build:server": "bjs build src/server.bjs -o build",
                build: "npm run build:client && npm run build:server",
                start: "node build/server.js",
                dev: "npm run build && npm start"
            },
            keywords: ["banglascript", "fullstack"],
            author: "",
            license: "MIT"
        }, null, 2),
        "README.md": (name) => `# ${name}

BanglaScript ফুলস্ট্যাক অ্যাপ

## ব্যবহার

\`\`\`bash
npm run build
npm start
\`\`\`

তার পর http://localhost:3000 খুলুন।
`,
        ".gitignore": `node_modules/
build/
public/build/
.banglascript-cache/
`
    }
};

// ==================== CLI TOOL TEMPLATE ====================
const cliTemplate = {
    name: "cli",
    displayName: "CLI টুল (Command Line)",
    description: "Command-line tool with BanglaScript",
    files: {
        "src/cli.bjs": `#!/usr/bin/env node
// বাংলাস্ক্রিপ্ট - CLI টুল

ধ্রুবক args = process.argv.slice(2);
ধ্রুবক command = args[0] || "help";

// হেল্প
অনুষ্ঠান showHelp() {
    লিখো("=================================");
    লিখো("  বাংলাস্ক্রিপ্ট CLI টুল");
    লিখো("=================================");
    লিখো("");
    লিখো("কমান্ডস:");
    লিখো("  help     - এই সাহায্য দেখান");
    লিখো("  greet    - অভিবাদন জানান");
    লিখো("  calc     - ক্যালকুলেটর");
    লিখো("");
    লিখো("উদাহরণ:");
    লিখো("  mycli greet রহিম");
    লিখো("  mycli calc 5 + 3");
}

// গ্রীটিং
অনুষ্ঠান greet(name) {
    যদি (!name) {
        name = "বন্ধু";
    }
    লিখো("স্বাগতম, " + name + "!");
}

// ক্যালকুলেটর
অনুষ্ঠান calc(a, op, b) {
    ধ্রুবক num1 = parseFloat(a);
    ধ্রুবক num2 = parseFloat(b);
    পরিবর্তনশীল result = 0;
    
    যদি (op === "+") {
        result = num1 + num2;
    } নাহলে যদি (op === "-") {
        result = num1 - num2;
    } নাহলে যদি (op === "*") {
        result = num1 * num2;
    } নাহলে যদি (op === "/") {
        result = num1 / num2;
    } নাহলে {
        লিখো("অজানা অপারেটর: " + op);
        প্রেরণ;
    }
    
    লিখো("ফলাফল: " + num1 + " " + op + " " + num2 + " = " + result);
}

// মেইন
যদি (command === "help") {
    showHelp();
} নাহলে যদি (command === "greet") {
    greet(args[1]);
} নাহলে যদি (command === "calc") {
    calc(args[1], args[2], args[3]);
} নাহলে {
    লিখো("অজানা কমান্ড: " + command);
    showHelp();
}
`,
        "package.json": (name) => JSON.stringify({
            name: name,
            version: "1.0.0",
            description: "BanglaScript CLI টুল",
            main: "build/cli.js",
            bin: {
                [name]: "build/cli.js"
            },
            scripts: {
                build: "bjs build src/cli.bjs -o build",
                start: "node build/cli.js",
                link: "npm run build && npm link"
            },
            keywords: ["banglascript", "cli"],
            author: "",
            license: "MIT"
        }, null, 2),
        "README.md": (name) => `# ${name}

BanglaScript CLI টুল

## ব্যবহার

\`\`\`bash
npm run build
npm start help
npm start greet রহিম
npm start calc 5 + 3
\`\`\`

## গ্লোবাল ইন্সটল

\`\`\`bash
npm run link
${name} help
\`\`\`
`,
        ".gitignore": `node_modules/
build/
.banglascript-cache/
`
    }
};

// ==================== EXPORT ALL TEMPLATES ====================
const templates = {
    basic: basicTemplate,
    web: webTemplate,
    api: apiTemplate,
    fullstack: fullstackTemplate,
    cli: cliTemplate
};

function getTemplate(name) {
    return templates[name] || null;
}

function getTemplateNames() {
    return Object.keys(templates);
}

function getTemplateList() {
    return Object.values(templates).map(t => ({
        name: t.name,
        displayName: t.displayName,
        description: t.description
    }));
}

module.exports = {
    templates,
    getTemplate,
    getTemplateNames,
    getTemplateList,
    basicTemplate,
    webTemplate,
    apiTemplate,
    fullstackTemplate,
    cliTemplate
};
