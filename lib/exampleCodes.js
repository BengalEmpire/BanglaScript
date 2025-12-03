const fs = require('fs');
const path = require('path');

// ========== BASIC EXAMPLE ==========
const basicExample = `// Write JavaScript in Bangla!

ব্যাক্তি নাম = "মাহমুদ";
পরিবর্তনশীল বয়স = ২০;
বাক্য পেশা = "একজন কম্পিউটার প্রোগ্রামার"

অনুষ্ঠান পরিচয়() {
    লিখো("নাম: " + নাম);
    লিখো("বয়স: " + বয়স);
    লিখো("পেশা: " + পেশা);
}
পরিচয়();

সংখ্যা নম্বর = ৮৫;
যদি (নম্বর >= ৮০) {
    লিখো("গ্রেড: A+ 🎉");
} নাহলে যদি (নম্বর >= ৬০) {
    লিখো("গ্রেড: B ✓");
} নাহলে {
    লিখো("আরো চেষ্টা করুন! 💪");
}

// Loop example
লিখো("🔢 সংখ্যা গণনা:");
জন্য (সংখ্যা i = ১; i <= ৫; i++) {
    লিখো("→ সংখ্যা: " + i);
}
লিখো("✓ সম্পন্ন!");


লিখো("🎲 র‍্যান্ডম সংখ্যা:", এলোমেলো_সংখ্যা());`;


// ========== WEB EXAMPLE - LOAD FROM FILE ==========
let webExample = '';
try {
    const webExamplePath = path.join(__dirname, './bjs-example/web.bjs');
    webExample = fs.readFileSync(webExamplePath, 'utf8');
} catch (error) {
    console.error('Error loading web.bjs:', error.message);
    webExample = '// Error: Could not load web example file';
}


// ========== HTML TEMPLATE ==========
const htmlTemplate = `<!DOCTYPE html>
<html lang="bn">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BanglaScript Demo | BanglaScript</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
        rel="stylesheet">
</head>

<body>

    <div class="container">
        <!-- TOP LEFT: IP Section -->
        <div id="ip-section" class="section">
            <h1 id="শিরোনাম">লোড হচ্ছে...</h1>
            <button id="বোতাম" class="btn btn-primary">🌍 আপনার IP ও লোকেশন দেখুন</button>
            <div id="summary-box" class="summary-box" style="display:none;"></div>
            <div id="ফলাফল" class="result-box"></div>
        </div>

        <!-- TOP RIGHT: Quote Section -->
        <div id="quote-section" class="section">
            <h2>📜 আজকের প্রেরণাদায়ী উক্তি</h2>
            <div id="quote-box" class="loading">লোড হচ্ছে...</div>
            <button id="quote-btn" class="btn btn-secondary">🔄 আরেকটি কোট দিন</button>
        </div>

        <!-- BOTTOM: Name Section -->
        <div id="name-section" class="section">
            <h2>👤 আপনার সাথে একটু পরিচয়?</h2>
            <input id="name-input" type="text" placeholder="আপনার নাম লিখুন..." />
            <button id="name-btn" class="btn btn-primary">✨ জমা দিন</button>
            <p id="name-greet"></p>
            <div id="api-status" class="api-status"></div>
        </div>
    </div>

    <footer class="footer">
        Developed with ❤️ using BanglaScript | 2025
    </footer>

    <script src="build/main.js"></script>
</body>

</html>`;


// ========== CSS TEMPLATE ==========
const cssTemplate = `* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family: 'Noto Sans Bengali', sans-serif;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	min-height: 100vh;
	padding: 20px;
	display: grid;
	place-items: center;
	color: #2d3748;
}

/* MAIN CONTAINER */
.container {
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	padding: 40px;
	border-radius: 28px;
	max-width: 1000px;
	width: 100%;
	box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
	animation: fadeInUp 0.9s ease-out;

	display: grid;
	gap: 32px;
	grid-template-areas:
		"ip     quote"
		"name   name";
	grid-template-columns: 1fr 1fr;
}

/* GRID AREAS */
#ip-section {
	grid-area: ip;
}

#quote-section {
	grid-area: quote;
}

#name-section {
	grid-area: name;
}

/* ANIMATIONS */
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(40px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* SECTION COMMON STYLE */
.section {
	background: white;
	border-radius: 20px;
	padding: 32px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
	transition: transform 0.3s ease;
}

.section:hover {
	transform: translateY(-8px);
}

.section h2 {
	text-align: center;
	font-size: clamp(20px, 4vw, 26px);
	margin-bottom: 16px;
	color: #4a5568;
}

/* HEADINGS */
h1#title {
	text-align: center;
	font-size: clamp(28px, 6vw, 42px);
	font-weight: 800;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin-bottom: 24px;
}

/* BUTTONS */
.btn {
	padding: 14px 28px;
	border: none;
	border-radius: 14px;
	font-size: 17px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	width: 100%;
	margin-top: 12px;
}

.btn-primary {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
	transform: translateY(-3px);
	box-shadow: 0 10px 28px rgba(102, 126, 234, 0.5);
}

.btn-secondary {
	background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	color: white;
	margin-top: 16px;
	padding: 12px 24px;
	width: auto;
	display: block;
	margin-left: auto;
	margin-right: auto;
}

.btn-secondary:hover {
	transform: scale(1.05);
}

/* IP SECTION */
.result-box,
.summary-box {
	margin-top: 20px;
	padding: 24px;
	background: #f8fafc;
	border-radius: 16px;
	border-left: 5px solid #667eea;
	line-height: 1.9;
	font-size: 16px;
	min-height: 100px;
}

.summary-box {
	background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
	border-left-color: #f5576c;
	font-weight: 500;
}

/* QUOTE BOX */
#quote-box {
	padding: 28px;
	background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
	border-radius: 16px;
	border-left: 6px solid #f5576c;
	font-size: 18px;
	line-height: 1.8;
	text-align: center;
	min-height: 120px;
	align-items: center;
	justify-content: center;
}

.loading {
	color: #888;
	font-style: italic;
}

/* NAME SECTION */
#name-input {
	width: 100%;
	padding: 16px 20px;
	border: 2px solid #e2e8f0;
	border-radius: 14px;
	font-size: 17px;
	transition: all 0.3s;
}

#name-input:focus {
	outline: none;
	border-color: #667eea;
	box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

#name-greet {
	margin-top: 20px;
	font-size: 22px;
	font-weight: 600;
	text-align: center;
	color: #2d3748;
	min-height: 60px;
}

.api-status {
	margin-top: 16px;
	padding: 14px;
	background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
	border-radius: 12px;
	text-align: center;
	font-weight: 600;
	font-size: 15px;
}

/* FOOTER */
.footer {
	text-align: center;
	margin-top: 40px;
	color: white;
	font-size: 15px;
	font-weight: 500;
}

/* RESPONSIVE */
@media (max-width: 768px) {
	.container {
		grid-template-areas:
			"ip"
			"quote"
			"name";
		grid-template-columns: 1fr;
		padding: 28px;
		gap: 28px;
	}

	.section {
		padding: 28px;
	}
}

@media (max-width: 480px) {
	body {
		padding: 12px;
	}

	.container {
		padding: 20px;
		border-radius: 20px;
	}

	.btn {
		padding: 16px;
		font-size: 16px;
	}
}`;


// ========== EXPORT ==========
module.exports = { 
    basicExample, 
    webExample, 
    htmlTemplate, 
    cssTemplate 
};