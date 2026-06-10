/**
 * humanizer.js — English humanization engine.
 *
 * Takes analysis results and produces actionable rewrite suggestions.
 * Includes auto-fix for safe mechanical transforms.
 */

const { analyze } = require("./analyzer");

// ─── Auto-Fix ────────────────────────────────────────────

function autoFix(text) {
	let result = text;
	const fixes = [];

	// Curly quotes
	if (/[\u201C\u201D]/.test(result)) {
		result = result.replace(/[\u201C\u201D]/g, '"');
		fixes.push("Replaced curly double quotes with straight quotes");
	}
	if (/[\u2018\u2019]/.test(result)) {
		result = result.replace(/[\u2018\u2019]/g, "'");
		fixes.push("Replaced curly single quotes with straight quotes");
	}

	// Hidden unicode
	result = result.replace(/(?:\u200B|\u200C|\u200D|\u2060|\uFEFF|\u00AD)/g, "");
	if (
		result !==
		text.replace(/(?:\u200B|\u200C|\u200D|\u2060|\uFEFF|\u00AD)/g, "")
	) {
		fixes.push("Removed hidden unicode characters");
	}
	result = result.replace(/(?:\u00A0|\u202F)/g, " ");
	if (result !== text.replace(/(?:\u00A0|\u202F)/g, " ")) {
		fixes.push("Normalized non-breaking spaces");
	}

	// Safe filler replacements
	const safeFills = [
		{ from: /\bin order to\b/gi, to: "to", label: '"in order to" → "to"' },
		{
			from: /\bdue to the fact that\b/gi,
			to: "because",
			label: '"due to the fact that" → "because"',
		},
		{
			from: /\bat this point in time\b/gi,
			to: "now",
			label: '"at this point in time" → "now"',
		},
		{
			from: /\bin the event that\b/gi,
			to: "if",
			label: '"in the event that" → "if"',
		},
		{
			from: /\bhas the ability to\b/gi,
			to: "can",
			label: '"has the ability to" → "can"',
		},
		{
			from: /\bfor the purpose of\b/gi,
			to: "to",
			label: '"for the purpose of" → "to"',
		},
		{
			from: /\bfirst and foremost\b/gi,
			to: "first",
			label: '"first and foremost" → "first"',
		},
		{ from: /\butilize\b/gi, to: "use", label: '"utilize" → "use"' },
		{ from: /\butilizing\b/gi, to: "using", label: '"utilizing" → "using"' },
		{ from: /\butilization\b/gi, to: "use", label: '"utilization" → "use"' },
	];

	for (const { from, to, label } of safeFills) {
		if (from.test(result)) {
			result = result.replace(from, to);
			fixes.push(label);
		}
	}

	// Chatbot artifacts
	const chatbotStart = [
		/^(Here is|Here's) (a |an |the )?(comprehensive |brief |quick )?(overview|summary|breakdown|list|guide|explanation|look)[^.]*\.\s*/i,
		/^(Of course|Certainly|Absolutely|Sure)!\s*/i,
		/^(Great|Excellent|Good|Wonderful|Fantastic) question!\s*/i,
	];
	for (const regex of chatbotStart) {
		if (regex.test(result)) {
			result = result.replace(regex, "");
			fixes.push("Removed chatbot opening artifact");
		}
	}

	const chatbotEnd = [
		/\s*(I hope this helps|Let me know if you('d| would) like|Feel free to|Don't hesitate to|Is there anything else)[^.]*[.!]\s*$/i,
		/\s*Happy to help[.!]?\s*$/i,
	];
	for (const regex of chatbotEnd) {
		if (regex.test(result)) {
			result = result.replace(regex, "");
			fixes.push("Removed chatbot closing artifact");
		}
	}

	result = result.trim();
	return { text: result, fixes };
}

// ─── Humanize ────────────────────────────────────────────

function humanize(text, opts = {}) {
	const {
		autofix = false,
		includeStats = true,
		ignoreCode = false,
		ignoreQuotes = false,
		lang = "en",
	} = opts;

	const analysis = analyze(text, {
		verbose: true,
		includeStats,
		ignoreCode,
		ignoreQuotes,
		lang,
	});

	// Group suggestions by priority
	const packs = { critical: [], important: [], minor: [] };
	for (const finding of analysis.findings) {
		const bucket =
			finding.weight >= 4
				? "critical"
				: finding.weight >= 2
					? "important"
					: "minor";
		for (const m of finding.matches) {
			packs[bucket].push({
				pattern: finding.patternName,
				patternId: finding.patternId,
				category: finding.category,
				weight: finding.weight,
				text: m.match,
				line: m.line,
				column: m.column,
				suggestion: m.suggestion,
				confidence: m.confidence || "high",
			});
		}
	}

	let fixedText = null;
	let appliedFixes = [];
	if (autofix) {
		const result = autoFix(text);
		fixedText = result.text;
		appliedFixes = result.fixes;
	}

	const guidance = buildGuidance(analysis);
	const styleTips =
		includeStats && analysis.stats ? buildStyleTips(analysis.stats) : [];

	return {
		score: analysis.score,
		patternScore: analysis.patternScore,
		uniformityScore: analysis.uniformityScore,
		language: analysis.language,
		reliability: analysis.reliability,
		wordCount: analysis.wordCount,
		totalIssues: analysis.totalMatches,
		stats: analysis.stats,
		...packs,
		autofix: autofix ? { text: fixedText, fixes: appliedFixes } : null,
		guidance,
		styleTips,
	};
}

// ─── Guidance ────────────────────────────────────────────

function buildGuidance(analysis) {
	const tips = [];
	const ids = new Set(analysis.findings.map((f) => f.patternId));

	if (ids.has(1) || ids.has(4))
		tips.push(
			"Replace inflated/promotional language with concrete facts — dates, numbers, names.",
		);
	if (ids.has(3))
		tips.push(
			"Cut trailing -ing phrases. If the point matters, give it its own sentence.",
		);
	if (ids.has(5))
		tips.push(
			'Name your sources. "Experts say" means nothing — who, when, where?',
		);
	if (ids.has(6))
		tips.push(
			'Replace formulaic "despite challenges" with specific problems and outcomes.',
		);
	if (ids.has(7))
		tips.push(
			'Swap AI vocabulary for plain words: "delve" → "look at", "showcase" → "show".',
		);
	if (ids.has(8))
		tips.push(
			'Use "is" and "has" freely. "Serves as" and "boasts" are needlessly fancy.',
		);
	if (ids.has(9))
		tips.push('Drop "not just X, it\'s Y" frames. Just say what the thing IS.');
	if (ids.has(10))
		tips.push("Break up triads. Not everything needs three examples.");
	if (ids.has(13))
		tips.push("Ease up on em dashes. Use commas or periods instead.");
	if (ids.has(14) || ids.has(15))
		tips.push("Strip mechanical bold + inline-header lists. Let prose work.");
	if (ids.has(19) || ids.has(21))
		tips.push("Remove chatbot filler. Just deliver the content directly.");
	if (ids.has(20))
		tips.push("Delete knowledge-cutoff disclaimers. Research or omit.");
	if (ids.has(22) || ids.has(23))
		tips.push('Trim filler. "In order to" → "to". One qualifier per claim.');
	if (ids.has(24))
		tips.push("Cut generic conclusions. End with a specific fact.");
	if (ids.has(25)) tips.push("Remove reasoning chain artifacts. Just answer.");
	if (ids.has(28)) tips.push("Stop restating the question. Just answer.");

	if (analysis.score >= 50)
		tips.push(
			"Consider rewriting from scratch. Patching individual phrases is not enough — the structure needs rethinking.",
		);

	return tips;
}

// ─── Style Tips ──────────────────────────────────────────

function buildStyleTips(stats) {
	const tips = [];

	if (stats.burstiness < 0.25 && stats.sentenceCount > 4) {
		tips.push({
			metric: "burstiness",
			value: stats.burstiness,
			tip: "Sentence rhythm very uniform. Mix short punchy sentences (3-8 words) with long flowing ones (20+).",
		});
	}
	if (stats.sentenceLengthVariation < 0.3 && stats.sentenceCount > 4) {
		tips.push({
			metric: "sentenceLengthVariation",
			value: stats.sentenceLengthVariation,
			tip: `Sentences all ~${Math.round(stats.avgSentenceLength)} words. Vary rhythm.`,
		});
	}
	if (stats.avgSentenceLength > 28) {
		tips.push({
			metric: "avgSentenceLength",
			value: stats.avgSentenceLength,
			tip: "Average sentence too long. Break some into shorter ones.",
		});
	}
	if (stats.typeTokenRatio < 0.4 && stats.wordCount > 100) {
		tips.push({
			metric: "typeTokenRatio",
			value: stats.typeTokenRatio,
			tip: "Vocabulary is repetitive. Use more varied word choices.",
		});
	}
	if (stats.trigramRepetition > 0.1 && stats.wordCount > 100) {
		tips.push({
			metric: "trigramRepetition",
			value: stats.trigramRepetition,
			tip: "Repeated 3-word phrases. Vary sentence structures.",
		});
	}
	if (stats.conjunctionStartRatio < 0.05 && stats.sentenceCount > 5) {
		tips.push({
			metric: "conjunctionStartRatio",
			value: stats.conjunctionStartRatio,
			tip: 'Almost no sentences start with conjunctions. Humans use "And", "But", "So" to connect thoughts.',
		});
	}
	if (stats.firstPersonDensity < 0.5 && stats.wordCount > 100) {
		tips.push({
			metric: "firstPersonDensity",
			value: stats.firstPersonDensity,
			tip: 'No first-person perspective. Add "I", "we", "my" where natural.',
		});
	}

	if (tips.length >= 2) {
		tips.push({
			metric: "general",
			value: null,
			tip: "Read aloud test: if it sounds robotic, rewrite until it sounds like something you would actually say.",
		});
		tips.push({
			metric: "general",
			value: null,
			tip: 'Add first-person perspective: "I found", "We noticed", "In my experience". Humans write from a point of view.',
		});
	}

	return tips;
}

// ─── Format ──────────────────────────────────────────────

function formatSuggestions(result) {
	const lines = [];

	lines.push("");
	lines.push("┌──────────────────────────────────────────────────┐");
	lines.push("│           HUMANIZATION SUGGESTIONS                │");
	lines.push("└──────────────────────────────────────────────────┘");
	lines.push("");

	const filled = Math.round(result.score / 5);
	const bar = "█".repeat(filled) + "░".repeat(20 - filled);
	lines.push(`  AI Score: ${result.score}/100  [${bar}]`);
	lines.push(
		`  Language: ${result.language === "id" ? "Indonesian" : "English"}`,
	);
	lines.push(
		`  Issues: ${result.totalIssues}  |  Pattern: ${result.patternScore}  |  Uniformity: ${result.uniformityScore}`,
	);
	lines.push("");

	if (result.critical && result.critical.length > 0) {
		lines.push("── CRITICAL (dead giveaways) ───────────────────────");
		for (const s of result.critical)
			lines.push(
				`  L${s.line}: [${s.pattern}] "${truncate(s.text, 60)}"\n       → ${s.suggestion}`,
			);
		lines.push("");
	}

	if (result.important && result.important.length > 0) {
		lines.push("── IMPORTANT (noticeable) ──────────────────────────");
		for (const s of result.important.slice(0, 15))
			lines.push(
				`  L${s.line}: [${s.pattern}] "${truncate(s.text, 60)}"\n       → ${s.suggestion}`,
			);
		if (result.important.length > 15)
			lines.push(`  ... and ${result.important.length - 15} more`);
		lines.push("");
	}

	if (result.minor && result.minor.length > 0) {
		lines.push("── MINOR (subtle tells) ────────────────────────────");
		for (const s of result.minor.slice(0, 10))
			lines.push(
				`  L${s.line}: [${s.pattern}] "${truncate(s.text, 60)}"\n       → ${s.suggestion}`,
			);
		if (result.minor.length > 10)
			lines.push(`  ... and ${result.minor.length - 10} more`);
		lines.push("");
	}

	if (result.autofix && result.autofix.fixes.length > 0) {
		lines.push("── AUTO-FIXES ──────────────────────────────────────");
		for (const fix of result.autofix.fixes) lines.push(`  ✓ ${fix}`);
		lines.push("");
	}

	if (result.guidance && result.guidance.length > 0) {
		lines.push("── GUIDANCE ────────────────────────────────────────");
		for (const tip of result.guidance) lines.push(`  • ${tip}`);
		lines.push("");
	}

	if (result.styleTips && result.styleTips.length > 0) {
		lines.push("── STYLE TIPS (statistical) ────────────────────────");
		for (const t of result.styleTips) lines.push(`  ◦ ${t.tip}`);
		lines.push("");
	}

	lines.push("════════════════════════════════════════════════════");
	return lines.join("\n");
}

function truncate(str, len) {
	return typeof str === "string"
		? str.length > len
			? `${str.substring(0, len)}...`
			: str
		: "";
}

// ─── Exports ─────────────────────────────────────────────

module.exports = {
	humanize,
	autoFix,
	formatSuggestions,
	buildGuidance,
	buildStyleTips,
};
