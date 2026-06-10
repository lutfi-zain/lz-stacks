#!/usr/bin/env node

/**
 * Test runner for lz-humanizer-pro.
 *
 * Usage: node tests/run.js
 *        node tests/run.js --lang en
 *        node tests/run.js --test score
 */

const { analyze, score } = require("../src/analyzer");
const { computeStats } = require("../src/stats");
const { detectLanguage } = require("../src/language");
const { humanize } = require("../src/humanizer");
const { humanizeId } = require("../src/humanizer-id");
const { autoFix } = require("../src/humanizer");

// ─── Utils ───────────────────────────────────────────────

let passed = 0;
let failed = 0;
let filterLang = null; // 'en' | 'id' | null
let filterTest = null;

function parseArgs() {
	const args = process.argv.slice(2);
	const langIdx = args.indexOf("--lang");
	if (langIdx !== -1 && args[langIdx + 1]) filterLang = args[langIdx + 1];
	const testIdx = args.indexOf("--test");
	if (testIdx !== -1 && args[testIdx + 1]) filterTest = args[testIdx + 1];
}
parseArgs();

function assert(condition, label) {
	if (condition) {
		passed++;
		console.log(`  ✅ ${label}`);
	} else {
		failed++;
		console.log(`  ❌ ${label}`);
	}
}

function assertClose(actual, expected, tolerance, label) {
	if (Math.abs(actual - expected) <= tolerance) {
		passed++;
		console.log(`  ✅ ${label} (${actual})`);
	} else {
		failed++;
		console.log(
			`  ❌ ${label}: expected ${expected}±${tolerance}, got ${actual}`,
		);
	}
}

function section(name) {
	console.log(`\n${"─".repeat(60)}`);
	console.log(`  ${name}`);
	console.log(`${"─".repeat(60)}`);
}

function shouldRun(name) {
	if (filterTest && !name.toLowerCase().includes(filterTest.toLowerCase()))
		return false;
	if (filterLang) {
		if (filterLang === "en" && (name.includes("ID") || name.includes("Indo")))
			return false;
		if (filterLang === "id" && !name.includes("ID") && !name.includes("Indo"))
			return false;
	}
	return true;
}

// ─── Tests ───────────────────────────────────────────────

function testLanguageDetection() {
	section("Language Detection");

	assert(
		detectLanguage("The quick brown fox jumps over the lazy dog") === "en",
		"EN: basic English",
	);
	assert(
		detectLanguage("I think this is a great idea for the project") === "en",
		"EN: common English",
	);
	assert(
		detectLanguage("Halo, apa kabar? Saya baik-baik saja") === "id",
		"ID: basic Indonesian",
	);
	assert(
		detectLanguage("Yang penting adalah kita terus belajar dan berkembang") ===
			"id",
		"ID: yang + important",
	);
	assert(detectLanguage("") === "en", "Empty string falls back to EN");
	assert(detectLanguage("a b c") === "en", "Short text falls back to EN");

	// Mixed
	const mixedEn =
		"This is the main point of the project and we should consider all options";
	assert(detectLanguage(mixedEn) === "en", "EN: mixed but dominant English");

	const mixedId =
		"Implementasi dari sistem ini sangat penting untuk keberhasilan proyek";
	assert(detectLanguage(mixedId) === "id", "ID: mixed but dominant Indonesian");
}

function testStats() {
	section("Statistics Engine");

	// English stats
	const enText =
		"This is a test. It has multiple sentences. Some are short. Others are longer and more complex with additional details.";
	const enStats = computeStats(enText, "en");
	assert(enStats.wordCount > 10, "EN: word count > 10");
	assert(enStats.sentenceCount >= 4, "EN: sentence count >= 4");
	assert(enStats.typeTokenRatio > 0, "EN: TTR > 0");
	assert(enStats.burstiness >= 0, "EN: burstiness >= 0");

	// Indonesian stats
	const idText =
		"Ini adalah teks uji. Terdapat beberapa kalimat di sini. Ada yang pendek. Ada yang lebih panjang dengan tambahan detail untuk menguji statistik.";
	const idStats = computeStats(idText, "id");
	assert(idStats.wordCount > 10, "ID: word count > 10");
	assert(idStats.sentenceCount >= 4, "ID: sentence count >= 4");
	assert(idStats.typeTokenRatio > 0, "ID: TTR > 0");

	// Empty
	const emptyStats = computeStats("", "en");
	assert(emptyStats.wordCount === 0, "Empty text returns 0 word count");
}

function testAnalyzeEN() {
	section("Analysis Engine (English)");

	// Clear human text should score low
	const humanText = `I went to the store yesterday. They were out of milk. So I bought orange juice instead. My kid was disappointed but whatever. I'll try again tomorrow.`;
	const humanResult = analyze(humanText, { lang: "en" });
	assert(
		humanResult.score < 40,
		`EN human text: score < 40 (got ${humanResult.score})`,
	);
	assert(humanResult.language === "en", "EN: language detected as en");

	// AI-sounding text should score higher
	const aiText = `In today's rapidly evolving digital landscape, leveraging cutting-edge solutions serves as a pivotal cornerstone for transformative growth. This comprehensive synergy fosters innovation, showcasing a paradigm shift that underscores the importance of strategic alignment. Despite challenges, navigating these complexities is crucial for harnessing unprecedented value.`;
	const aiResult = analyze(aiText, { lang: "en" });
	assert(aiResult.score > 40, `EN AI text: score > 40 (got ${aiResult.score})`);
	assert(aiResult.totalMatches > 0, "EN AI text: has pattern matches");
	assert(aiResult.findings.length > 0, "EN AI text: has findings");

	// Very short text
	const shortResult = analyze("Hi there", { lang: "en" });
	assert(shortResult.score <= 20, "EN short: low score");
}

function testAnalyzeID() {
	section("Analysis Engine (Indonesian)");

	// Natural Indonesian should score low
	const naturalId = `Saya ke toko kemarin. Susunya habis. Jadi saya beli jus jeruk aja. Anak saya kecewa tapi yaudah. Saya coba lagi besok.`;
	const naturalResult = analyze(naturalId, { lang: "id" });
	assert(
		naturalResult.score < 40,
		`ID natural: score < 40 (got ${naturalResult.score})`,
	);
	assert(naturalResult.language === "id", "ID: language detected as id");

	// AI-sounding Indonesian should score higher
	const aiId = `Di era digital yang terus berkembang, memanfaatkan solusi inovatif menjadi tonggak penting dalam transformasi organisasi. Sinergi antara optimalisasi dan efisiensi menunjukkan pergeseran paradigma yang signifikan. Meskipun berbagai tantangan, implementasi strategi komprehensif ini berperan krusial dalam menavigasi kompleksitas lanskap bisnis modern.`;
	const aiResult = analyze(aiId, { lang: "id" });
	assert(aiResult.score > 35, `ID AI text: score > 35 (got ${aiResult.score})`);
	assert(aiResult.totalMatches > 0, "ID AI text: has pattern matches");
	assert(aiResult.findings.length > 0, "ID AI text: has findings");

	// Check that Indonesian patterns fired
	const idPatterns = aiResult.findings.filter((f) => f.patternId >= 100);
	assert(
		idPatterns.length > 0,
		"ID AI text: Indonesian-specific patterns detected",
	);
}

function testScoring() {
	section("Scoring (score function)");

	const low = score("I like cats. They are soft. My cat is orange.", {
		lang: "en",
	});
	assert(low < 40, `EN low score < 40 (got ${low})`);

	const high = score(
		"In today's digital landscape, leveraging robust synergy is pivotal for groundbreaking transformation. Despite challenges, this paradigm shift underscores the enduring legacy of innovation.",
		{ lang: "en" },
	);
	assert(high > 40, `EN high score > 40 (got ${high})`);

	const idLow = score(
		"Saya suka kucing. Kucing saya orange. Dia lucu sekali.",
		{ lang: "id" },
	);
	assert(idLow < 40, `ID low score < 40 (got ${idLow})`);

	const idHigh = score(
		"Pemanfaatan sinergi optimal dalam lanskap transformasi digital menjadi tonggak penting bagi inovasi terdepan.",
		{ lang: "id" },
	);
	assert(idHigh > 30, `ID high score > 30 (got ${idHigh})`);
}

function testAutoFix() {
	section("Auto-Fix");

	const input =
		"This is a testament to innovation. In order to utilize the system, due to the fact that we need better results.";
	const result = autoFix(input);
	assert(result.fixes.length > 0, "Auto-fix applied");
	assert(
		!result.text.includes("in order to"),
		'Auto-fix replaced "in order to"',
	);
	assert(
		!result.text.includes("due to the fact that"),
		'Auto-fix replaced "due to the fact that"',
	);
	assert(!result.text.includes("utilize"), 'Auto-fix replaced "utilize"');

	const clean = "This is normal text without any issues.";
	const cleanResult = autoFix(clean);
	assert(cleanResult.fixes.length === 0, "Clean text: no auto-fix needed");
}

function testHumanizeEN() {
	section("Humanization (English)");

	const aiText =
		"In today's digital landscape, leveraging robust synergy serves as a testament to transformative innovation.";
	const result = humanize(aiText, { lang: "en" });
	assert(result.score > 0, "EN humanize: score > 0");
	assert(result.guidance.length > 0, "EN humanize: has guidance");
	assert(result.totalIssues > 0, "EN humanize: has issues");

	// Auto-fix
	const fixed = humanize(aiText, { lang: "en", autofix: true });
	assert(fixed.autofix !== null, "EN humanize: autofix object present");
}

function testHumanizeID() {
	section("Humanization (Indonesian)");

	const aiText =
		"Pemanfaatan sinergi optimal dalam lanskap transformasi digital menjadi tonggak penting bagi inovasi terdepan.";
	const result = humanizeId(aiText);
	assert(result.score > 0, "ID humanize: score > 0");
	assert(result.guidance.length > 0, "ID humanize: has guidance");
	assert(result.layers !== undefined, "ID humanize: has 5-layer analysis");
	assert(result.prompting !== undefined, "ID humanize: has prompting");

	// Check layers
	for (let i = 1; i <= 5; i++) {
		assert(
			result.layers[`layer${i}`] !== undefined,
			`ID humanize: layer ${i} present`,
		);
	}
}

function testPreprocess() {
	section("Preprocessing");

	const { prepareText } = require("../src/preprocess");

	const withCode = "Some text\n```\ncode block\n```\nMore text";
	const masked = prepareText(withCode, { ignoreCode: true });
	assert(!masked.includes("code block"), "Preprocess: code block masked");

	const withQuote = "> quoted text\nNormal text";
	const maskedQuote = prepareText(withQuote, { ignoreQuotes: true });
	assert(!maskedQuote.includes("quoted"), "Preprocess: quote masked");
}

// ─── Run ─────────────────────────────────────────────────

const tests = [
	testLanguageDetection,
	testStats,
	testAnalyzeEN,
	testAnalyzeID,
	testScoring,
	testAutoFix,
	testHumanizeEN,
	testHumanizeID,
	testPreprocess,
];

console.log("\n🧪 lz-humanizer-pro test suite");
console.log(
	`   Filter: ${filterLang ? `lang=${filterLang}` : "all"}${filterTest ? ` test=${filterTest}` : ""}`,
);

for (const test of tests) {
	const name = test.name.replace(/^test/, "");
	if (shouldRun(name)) {
		test();
	}
}

console.log(`\n${"═".repeat(60)}`);
console.log(
	`  Results: ${passed} passed, ${failed} failed${failed > 0 ? " ❌" : " ✅"}`,
);
console.log(`${"═".repeat(60)}\n`);
process.exit(failed > 0 ? 1 : 0);
