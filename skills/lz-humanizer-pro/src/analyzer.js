/**
 * analyzer.js — Analysis engine with bilingual support.
 *
 * Combines pattern detection + statistical analysis into composite score.
 * Supports English and Indonesian via --lang flag or auto-detection.
 *
 * Score composition:
 *   - Pattern score (65%): weighted hits per 100 words, breadth, category diversity
 *   - Uniformity score (35%): burstiness, TTR, MATTR, hapax, trigram, conjunctions
 *
 * Based on brandonwise/humanizer architecture + enhanced metrics.
 */

const { prepareText } = require("./preprocess");
const { detectLanguage, getLanguagePack } = require("./language");
const { computeStats, computeUniformityScore } = require("./stats");

const CATEGORY_LABELS = {
	content: "Content patterns",
	language: "Language & grammar",
	style: "Style patterns",
	communication: "Communication artifacts",
	filler: "Filler & hedging",
};

const CATEGORY_LABELS_ID = {
	content: "Pola konten",
	language: "Bahasa & tata bahasa",
	style: "Pola gaya",
	communication: "Artifak komunikasi",
	filler: "Pengisi & hedging",
};

const RELIABILITY_RECOMMENDED_WORDS = 150;

// ─── Main Analysis ───────────────────────────────────────

function analyze(text, opts = {}) {
	const {
		verbose = false,
		patternsToCheck = null,
		includeStats = true,
		ignoreCode = false,
		ignoreQuotes = false,
		lang = null, // 'en', 'id', or null for auto-detect
	} = opts;

	if (!text || typeof text !== "string") return emptyResult("en");

	const preparedText = prepareText(text, { ignoreCode, ignoreQuotes });
	const trimmed = preparedText.trim();
	if (trimmed.length === 0) return emptyResult("en");

	// Language detection
	const language = lang || detectLanguage(trimmed);
	const pack = getLanguagePack(language);
	const labels = language === "id" ? CATEGORY_LABELS_ID : CATEGORY_LABELS;

	const words = wordCount(trimmed);

	// ── Compute statistics ──────────────────────────────
	const stats = includeStats ? computeStats(trimmed, language) : null;
	const uniformityScore =
		stats && stats.wordCount >= 20 && stats.sentenceCount >= 3
			? computeUniformityScore(stats)
			: 0;

	// ── Run pattern detectors ───────────────────────────
	const findings = [];
	const categoryScores = {};
	for (const cat of Object.keys(labels)) {
		categoryScores[cat] = { matches: 0, weightedScore: 0, patterns: [] };
	}

	// Combine English + Indonesian patterns
	let allPatterns = [...pack.patterns];
	if (pack.patternsId) {
		allPatterns = [...allPatterns, ...pack.patternsId];
	}

	const activePatterns = patternsToCheck
		? allPatterns.filter((p) => patternsToCheck.includes(p.id))
		: allPatterns;

	for (const pattern of activePatterns) {
		const matches = pattern.detect(trimmed);
		if (matches.length > 0) {
			findings.push({
				patternId: pattern.id,
				patternName: pattern.name,
				category: pattern.category,
				description: pattern.description,
				weight: pattern.weight,
				matchCount: matches.length,
				matches: verbose ? matches : matches.slice(0, 5),
				truncated: !verbose && matches.length > 5,
			});
			categoryScores[pattern.category].matches += matches.length;
			categoryScores[pattern.category].weightedScore +=
				matches.length * pattern.weight;
			categoryScores[pattern.category].patterns.push(pattern.name);
		}
	}

	// ── Calculate scores ────────────────────────────────
	const patternScore = calculatePatternScore(findings, words);
	const compositeScore = calculateCompositeScore(
		patternScore,
		uniformityScore,
		findings,
	);
	const reliability = buildReliability({
		words,
		stats,
		findings,
		patternScore,
		uniformityScore,
	});

	// ── Build category summary ──────────────────────────
	const categories = {};
	for (const [cat, label] of Object.entries(labels)) {
		const data = categoryScores[cat];
		categories[cat] = {
			label,
			matches: data.matches,
			weightedScore: data.weightedScore,
			patternsDetected: data.patterns,
		};
	}

	const totalMatches = findings.reduce((sum, f) => sum + f.matchCount, 0);

	return {
		score: compositeScore,
		patternScore,
		uniformityScore,
		language,
		reliability,
		totalMatches,
		wordCount: words,
		stats,
		categories,
		findings,
		summary: buildSummary(
			compositeScore,
			totalMatches,
			findings,
			words,
			stats,
			reliability,
			language,
		),
	};
}

// ─── Reliability ─────────────────────────────────────────

function buildReliability({
	words,
	stats,
	findings,
	patternScore,
	uniformityScore,
}) {
	const reasons = [];
	const sentenceCount = stats?.sentenceCount || 0;
	let confidenceScore = 100;

	if (words < 80) {
		confidenceScore -= 40;
		reasons.push("Sample very short (<80 words).");
	} else if (words < RELIABILITY_RECOMMENDED_WORDS) {
		confidenceScore -= 20;
		reasons.push(
			`Sample shorter than recommended (${RELIABILITY_RECOMMENDED_WORDS}+ words).`,
		);
	}
	if (sentenceCount > 0 && sentenceCount < 4) {
		confidenceScore -= 30;
		reasons.push("Fewer than 4 sentences limits rhythm analysis.");
	} else if (sentenceCount > 0 && sentenceCount < 7) {
		confidenceScore -= 12;
		reasons.push("Low sentence count — statistical signals weaker.");
	}
	if (findings.length <= 1) {
		confidenceScore -= 15;
		reasons.push("Only one AI pattern family detected.");
	}
	if (uniformityScore === 0) {
		confidenceScore -= 10;
		reasons.push("Uniformity metrics not applied (text too short/sparse).");
	}
	if (
		patternScore >= 60 &&
		findings.length >= 3 &&
		words >= RELIABILITY_RECOMMENDED_WORDS
	) {
		confidenceScore += 5;
	}

	confidenceScore = Math.max(0, Math.min(100, Math.round(confidenceScore)));
	const level =
		confidenceScore >= 75 ? "high" : confidenceScore >= 45 ? "medium" : "low";

	return {
		level,
		score: confidenceScore,
		reasons,
		recommendedMinWords: RELIABILITY_RECOMMENDED_WORDS,
		recommendation:
			level === "high"
				? "Signal quality strong enough for decision support."
				: `Treat as directional. Re-run on ${RELIABILITY_RECOMMENDED_WORDS}+ words across multiple paragraphs.`,
	};
}

// ─── Scoring ─────────────────────────────────────────────

function calculatePatternScore(findings, words) {
	if (words === 0 || findings.length === 0) return 0;

	let weightedTotal = 0;
	for (const f of findings) weightedTotal += f.matchCount * f.weight;

	const density = (weightedTotal / words) * 100;
	const densityScore = Math.min(Math.log2(density + 1) * 13, 60);

	const breadthBonus = Math.min(findings.length * 2, 20);
	const categoriesHit = new Set(findings.map((f) => f.category)).size;
	const categoryBonus = Math.min(categoriesHit * 4, 20);

	return Math.min(Math.round(densityScore + breadthBonus + categoryBonus), 100);
}

function calculateCompositeScore(patternScore, uniformityScore, findings) {
	if (patternScore === 0 && uniformityScore === 0) return 0;
	if (findings.length === 0)
		return Math.min(Math.round(uniformityScore * 0.15), 15);

	const blended = patternScore * 0.65 + uniformityScore * 0.35;
	return Math.min(Math.round(blended), 100);
}

// ─── Summary ─────────────────────────────────────────────

function buildSummary(
	score,
	totalMatches,
	findings,
	words,
	stats,
	reliability,
	lang,
) {
	const level =
		score >= 70
			? "heavily AI-generated"
			: score >= 45
				? "moderately AI-influenced"
				: score >= 20
					? "lightly AI-touched"
					: "mostly human-sounding";

	const levelId =
		score >= 70
			? "sangat mirip AI"
			: score >= 45
				? "cukup dipengaruhi AI"
				: score >= 20
					? "sedikit sentuhan AI"
					: "seperti tulisan manusia";

	const label = lang === "id" ? levelId : level;

	const topPatterns = findings
		.sort((a, b) => b.matchCount * b.weight - a.matchCount * a.weight)
		.slice(0, 3)
		.map((f) => f.patternName);

	let summary = `Score: ${score}/100 (${label}). Found ${totalMatches} matches across ${findings.length} pattern types in ${words} words.`;
	if (topPatterns.length > 0)
		summary += ` Top issues: ${topPatterns.join(", ")}.`;

	if (stats && stats.sentenceCount > 3) {
		if (stats.burstiness < 0.25)
			summary +=
				" Sentence rhythm very uniform (low burstiness) — typical of AI.";
		if (stats.typeTokenRatio < 0.4 && words > 100)
			summary += " Vocabulary diversity low.";
		if (stats.conjunctionStartRatio < 0.05 && stats.sentenceCount > 5)
			summary += " Very few conjunction-started sentences.";
		if (stats.firstPersonDensity < 0.5 && words > 100)
			summary += " Almost no first-person pronouns.";
	}

	if (reliability && reliability.level !== "high") {
		summary += ` Confidence: ${reliability.level}. ${reliability.recommendation}`;
	}

	return summary;
}

// ─── Quick Score ─────────────────────────────────────────

function score(text, opts = {}) {
	return analyze(text, opts).score;
}

// ─── Word Count ──────────────────────────────────────────

function wordCount(text) {
	return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Empty Result ────────────────────────────────────────

function emptyResult(lang) {
	return {
		score: 0,
		patternScore: 0,
		uniformityScore: 0,
		language: lang || "en",
		reliability: {
			level: "low",
			score: 0,
			reasons: ["No text provided."],
			recommendedMinWords: RELIABILITY_RECOMMENDED_WORDS,
			recommendation: `Provide ${RELIABILITY_RECOMMENDED_WORDS}+ words for stable scoring.`,
		},
		totalMatches: 0,
		wordCount: 0,
		stats: null,
		categories: {},
		findings: [],
		summary: "No text provided.",
	};
}

// ─── Formatters ──────────────────────────────────────────

function formatReport(result) {
	const lines = [];
	const lang = result.language || "en";

	lines.push("");
	lines.push("┌──────────────────────────────────────────────────┐");
	lines.push("│          AI WRITING PATTERN ANALYSIS             │");
	if (lang === "id")
		lines.push("│          ANALISIS POLA TULISAN AI                  │");
	lines.push("└──────────────────────────────────────────────────┘");
	lines.push("");

	const filled = Math.round(result.score / 5);
	const bar = "█".repeat(filled) + "░".repeat(20 - filled);
	lines.push(`  Score: ${result.score}/100  [${bar}]`);
	lines.push(`  Language: ${lang === "id" ? "Indonesian" : "English"}`);
	lines.push(
		`  Words: ${result.wordCount}  |  Matches: ${result.totalMatches}  |  Pattern: ${result.patternScore}  |  Uniformity: ${result.uniformityScore}`,
	);
	if (result.reliability) {
		lines.push(
			`  Confidence: ${result.reliability.level.toUpperCase()} (${result.reliability.score}/100)`,
		);
	}
	lines.push("");
	lines.push(`  ${result.summary}`);
	lines.push("");

	if (result.stats) {
		const s = result.stats;
		lines.push("── Text Statistics ─────────────────────────────────");
		lines.push(
			`  Sentences: ${s.sentenceCount}  |  Paragraphs: ${s.paragraphCount}`,
		);
		lines.push(
			`  Avg sentence length: ${s.avgSentenceLength} words (σ ${s.sentenceLengthStdDev})`,
		);
		lines.push(
			`  Burstiness: ${s.burstiness} ${burstinessLabel(s.burstiness)}`,
		);
		lines.push(
			`  TTR: ${s.typeTokenRatio}  |  MATTR: ${s.mattr}  |  Hapax: ${s.hapaxRatio}`,
		);
		lines.push(
			`  Conjunction start: ${(s.conjunctionStartRatio * 100).toFixed(1)}%  |  1st-person: ${s.firstPersonDensity.toFixed(1)}/100w`,
		);
		lines.push(
			`  Trigram repetition: ${s.trigramRepetition}  |  Readability: ${s.readability}`,
		);
		lines.push("");
	}

	lines.push("── Categories ──────────────────────────────────────");
	for (const [, data] of Object.entries(result.categories)) {
		if (data.matches > 0) {
			lines.push(
				`  ${data.label}: ${data.matches} matches (${data.patternsDetected.join(", ")})`,
			);
		}
	}
	lines.push("");

	if (result.findings.length > 0) {
		lines.push("── Findings ────────────────────────────────────────");
		for (const finding of result.findings) {
			lines.push("");
			lines.push(
				`  [${finding.patternId}] ${finding.patternName} (×${finding.matchCount}, weight: ${finding.weight})`,
			);
			lines.push(`      ${finding.description}`);
			for (const match of finding.matches) {
				const loc = match.line ? `L${match.line}` : "";
				const preview =
					typeof match.match === "string"
						? match.match.substring(0, 80) +
							(match.match.length > 80 ? "..." : "")
						: "";
				lines.push(`      ${loc}: "${preview}"`);
				if (match.suggestion) lines.push(`            → ${match.suggestion}`);
			}
			if (finding.truncated)
				lines.push(
					`      ... and ${finding.matchCount - finding.matches.length} more`,
				);
		}
	}

	lines.push("");
	lines.push("════════════════════════════════════════════════════");
	return lines.join("\n");
}

function formatMarkdown(result) {
	const lang = result.language || "en";
	const lines = [];

	lines.push("# AI Writing Pattern Analysis");
	if (lang === "id") lines.push("# Analisis Pola Tulisan AI");
	lines.push("");
	lines.push(`**Score: ${result.score}/100**`);
	lines.push(`**Language:** ${lang === "id" ? "Indonesian" : "English"}`);
	if (result.reliability)
		lines.push(
			`**Confidence:** ${result.reliability.level.toUpperCase()} (${result.reliability.score}/100)`,
		);
	lines.push("");
	lines.push(
		`Words: ${result.wordCount} | Matches: ${result.totalMatches} | Pattern: ${result.patternScore} | Uniformity: ${result.uniformityScore}`,
	);
	lines.push("");
	lines.push(result.summary);
	lines.push("");

	if (result.stats) {
		const s = result.stats;
		lines.push("## Text statistics");
		lines.push("");
		lines.push("| Metric | Value | Assessment |");
		lines.push("|--------|-------|------------|");
		lines.push(
			`| Avg sentence length | ${s.avgSentenceLength} words | ${s.avgSentenceLength > 25 ? "Long" : s.avgSentenceLength < 12 ? "Short" : "Normal"} |`,
		);
		lines.push(
			`| Sentence variation | σ ${s.sentenceLengthStdDev} | ${s.sentenceLengthStdDev > 8 ? "High (human-like)" : s.sentenceLengthStdDev < 4 ? "Low (AI-like)" : "Moderate"} |`,
		);
		lines.push(
			`| Burstiness | ${s.burstiness} | ${burstinessLabel(s.burstiness)} |`,
		);
		lines.push(
			`| TTR | ${s.typeTokenRatio} | ${ttrLabel(s.typeTokenRatio, s.wordCount)} |`,
		);
		lines.push(`| MATTR | ${s.mattr} | ${mattrLabel(s.mattr)} |`);
		lines.push(
			`| Hapax ratio | ${s.hapaxRatio} | ${s.hapaxRatio > 0.5 ? "High (human-like)" : s.hapaxRatio < 0.35 ? "Low (AI-like)" : "Moderate"} |`,
		);
		lines.push(
			`| Conjunction start | ${(s.conjunctionStartRatio * 100).toFixed(1)}% | ${s.conjunctionStartRatio > 0.12 ? "High (human-like)" : s.conjunctionStartRatio < 0.05 ? "Low (AI-like)" : "Moderate"} |`,
		);
		lines.push(
			`| First-person / 100w | ${s.firstPersonDensity.toFixed(1)} | ${s.firstPersonDensity > 2 ? "High (human-like)" : s.firstPersonDensity < 0.5 ? "Low (AI-like)" : "Moderate"} |`,
		);
		lines.push(
			`| Trigram repetition | ${s.trigramRepetition} | ${s.trigramRepetition > 0.1 ? "High (AI-like)" : "Normal"} |`,
		);
		lines.push(
			`| Readability | ${s.readability} | ${s.readability > 12 ? "Complex" : s.readability > 8 ? "Standard" : "Easy"} |`,
		);
		lines.push("");
	}

	if (result.findings.length > 0) {
		lines.push("## Findings");
		lines.push("");
		for (const finding of result.findings) {
			lines.push(
				`### ${finding.patternId}. ${finding.patternName} (×${finding.matchCount})`,
			);
			lines.push(`*${finding.description}*`);
			lines.push("");
			for (const match of finding.matches) {
				const loc = match.line ? `Line ${match.line}` : "";
				lines.push(
					`- ${loc}: \`${typeof match.match === "string" ? match.match.substring(0, 80) : ""}\``,
				);
				if (match.suggestion) lines.push(`  - ${match.suggestion}`);
			}
			lines.push("");
		}
	}

	return lines.join("\n");
}

function formatJSON(result) {
	return JSON.stringify(result, null, 2);
}

// ─── Label Helpers ───────────────────────────────────────

function burstinessLabel(b) {
	if (b >= 0.7) return "(high — human-like)";
	if (b >= 0.45) return "(moderate)";
	if (b >= 0.25) return "(low — somewhat uniform)";
	return "(very low — AI-like uniformity)";
}

function ttrLabel(ttr, wc) {
	if (wc < 100) return "(too short to assess)";
	if (ttr >= 0.6) return "(high — diverse vocabulary)";
	if (ttr >= 0.45) return "(moderate)";
	return "(low — repetitive vocabulary)";
}

function mattrLabel(m) {
	if (m >= 0.8) return "(high — diverse)";
	if (m >= 0.65) return "(moderate)";
	return "(low — repetitive)";
}

// ─── Exports ─────────────────────────────────────────────

module.exports = {
	analyze,
	score,
	calculatePatternScore,
	calculateCompositeScore,
	formatReport,
	formatMarkdown,
	formatJSON,
	CATEGORY_LABELS,
};
