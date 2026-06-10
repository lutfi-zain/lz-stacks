/**
 * stats.js — Enhanced text statistics engine (language-agnostic).
 *
 * Computes stylometric features for AI detection. All metrics work on
 * any language — they measure structural patterns, not vocabulary.
 *
 * Metrics (beyond humanizer):
 *   - Burstiness (consecutive sentence diff)
 *   - Type-token ratio (TTR)
 *   - MATTR — Moving Average Type-Token Ratio (stable vocabulary diversity)
 *   - Hapax legomena ratio — words appearing exactly once
 *   - Hapax dislegomena ratio — words appearing exactly twice
 *   - Sentence length coefficient of variation
 *   - Trigram repetition rate
 *   - Conjunction start ratio — sentences starting with and/but/so/or
 *   - Personal pronoun density — I/you/we/my/our per 100 words
 *   - Punctuation density — ?! per 100 words
 *   - Paragraph uniformity
 *   - Readability (syllable-based, language-aware)
 *
 * Based on:
 *   - Copyleaks stylistic fingerprint (arxiv 2503.01659v1)
 *   - StyloAI 31-feature stylometric analysis
 *   - Tarım & Onan (arxiv 2507.10475) — diffusion vs AR text
 *   - Honore's/Sichel's/Brunet's vocabulary richness measures
 */

// ─── Vocab Access ────────────────────────────────────────
// Import English function words by default
const { FUNCTION_WORDS } = require("./vocabulary");
const { FUNCTION_WORDS_ID } = require("./vocabulary-id");

// ─── Language-Specific Config ────────────────────────────

const LANG_CONFIG = {
	en: {
		funcWords: new Set(FUNCTION_WORDS),
		conjunctions:
			/^(and|but|or|so|yet|for|nor|because|however|therefore|thus|hence|meanwhile|nevertheless|nonetheless|furthermore|moreover|consequently|accordingly)\b/i,
		firstPerson: /\b(I|we|my|our|mine|ours)\b/i,
	},
	id: {
		funcWords: new Set(FUNCTION_WORDS_ID),
		conjunctions:
			/^(dan|tetapi|tapi|namun|sedangkan|sementara|atau|karena|sehingga|maka|jadi|meskipun|walaupun|sambil|seraya|lagi pula|selain itu|sementara itu|oleh karena itu|dengan demikian|akhirnya)\b/i,
		firstPerson: /\b(saya|aku|kami|kita|ku)\b/i,
	},
};

// ─── Sentence Splitting ─────────────────────────────────

function splitSentences(text) {
	const cleaned = text
		.replace(
			/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|etc|vs|approx|dept|est|vol)\./gi,
			"$1\u2024",
		)
		.replace(/\b([A-Z])\./g, "$1\u2024")
		.replace(/\b(\d+)\./g, "$1\u2024");

	const sentences = cleaned
		.split(
			/(?<=[.!?])\s+(?=[A-Z"'\u201C\u2018])|(?<=[.!?])$|(?<=[.!?])\s*(?:\n|$)/,
		)
		.map((s) => s.replace(/\u2024/g, ".").trim())
		.filter((s) => s.length > 0);

	return sentences;
}

// ─── Tokenization ───────────────────────────────────────

function tokenize(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s'-]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length > 0);
}

// ─── Enhanced Statistics ────────────────────────────────

function computeStats(text, lang = "en") {
	if (!text || typeof text !== "string" || text.trim().length === 0) {
		return emptyStats();
	}

	const words = tokenize(text);
	const sentences = splitSentences(text);
	const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

	if (words.length === 0) return emptyStats();

	const wordCount = words.length;
	const uniqueWords = new Set(words);
	const typeTokenRatio = uniqueWords.size / wordCount;

	// ── Hapax measures ──────────────────────────────────
	const wordFreq = {};
	for (const w of words) wordFreq[w] = (wordFreq[w] || 0) + 1;
	const hapaxLegomena = Object.values(wordFreq).filter((c) => c === 1).length;
	const hapaxDislegomena = Object.values(wordFreq).filter(
		(c) => c === 2,
	).length;
	const hapaxRatio = wordCount > 0 ? hapaxLegomena / wordCount : 0;
	const hapaxDisRatio = wordCount > 0 ? hapaxDislegomena / wordCount : 0;

	// ── MATTR (Moving Average TTR) ──────────────────────
	const windowSize = Math.min(100, Math.floor(wordCount / 2));
	const mattr = computeMATTR(words, windowSize);

	// ── Sentence-level stats ────────────────────────────
	const sentenceLengths = sentences
		.map((s) => tokenize(s).length)
		.filter((n) => n > 0);
	const sentenceCount = sentenceLengths.length;

	let avgSentenceLength = 0;
	let sentenceLengthStdDev = 0;
	let sentenceLengthVariation = 0;
	let burstiness = 0;

	if (sentenceCount > 1) {
		avgSentenceLength =
			sentenceLengths.reduce((a, b) => a + b, 0) / sentenceCount;
		const variance =
			sentenceLengths.reduce(
				(sum, len) => sum + (len - avgSentenceLength) ** 2,
				0,
			) / sentenceCount;
		sentenceLengthStdDev = Math.sqrt(variance);
		sentenceLengthVariation =
			avgSentenceLength > 0 ? sentenceLengthStdDev / avgSentenceLength : 0;

		// Burstiness: avg consecutive diff / avg length
		let consecutiveDiffSum = 0;
		for (let i = 1; i < sentenceLengths.length; i++) {
			consecutiveDiffSum += Math.abs(
				sentenceLengths[i] - sentenceLengths[i - 1],
			);
		}
		const avgConsecutiveDiff =
			consecutiveDiffSum / (sentenceLengths.length - 1);
		burstiness =
			avgSentenceLength > 0 ? avgConsecutiveDiff / avgSentenceLength : 0;
	} else if (sentenceCount === 1) {
		avgSentenceLength = sentenceLengths[0];
	}

	// ── Language-specific metrics ───────────────────────
	const config = LANG_CONFIG[lang] || LANG_CONFIG.en;

	// Conjunction start ratio
	let conjunctionStarts = 0;
	for (const s of sentences) {
		const firstWord = s.trim().split(/\s+/)[0];
		if (firstWord && config.conjunctions.test(firstWord)) conjunctionStarts++;
	}
	const conjunctionStartRatio =
		sentenceCount > 0 ? conjunctionStarts / sentenceCount : 0;

	// Personal pronoun density (per 100 words)
	const firstPersonCount = words.filter((w) =>
		config.firstPerson.test(w),
	).length;
	const firstPersonDensity =
		wordCount > 0 ? (firstPersonCount / wordCount) * 100 : 0;

	// Punctuation density
	const questionExclaim = (text.match(/[?!]/g) || []).length;
	const punctDensity = wordCount > 0 ? (questionExclaim / wordCount) * 100 : 0;
	const emDashCount = (text.match(/—/g) || []).length;
	const emDashDensity = wordCount > 0 ? (emDashCount / wordCount) * 100 : 0;

	// Function word ratio
	const funcWordCount = words.filter((w) => config.funcWords.has(w)).length;
	const functionWordRatio = wordCount > 0 ? funcWordCount / wordCount : 0;

	// ── Paragraph stats ─────────────────────────────────
	const paragraphCount = paragraphs.length;
	const avgParagraphLength =
		paragraphCount > 0
			? paragraphs.reduce((sum, p) => sum + tokenize(p).length, 0) /
				paragraphCount
			: 0;

	// Paragraph length uniformity (std dev of paragraph lengths)
	let paragraphLengthStdDev = 0;
	if (paragraphCount > 1) {
		const paraLengths = paragraphs.map((p) => tokenize(p).length);
		const paraMean =
			paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length;
		const paraVariance =
			paraLengths.reduce((sum, len) => sum + (len - paraMean) ** 2, 0) /
			paraLengths.length;
		paragraphLengthStdDev = Math.sqrt(paraVariance);
	}

	// ── Trigram repetition ──────────────────────────────
	const trigramRepetition = computeNgramRepetition(words, 3);

	// ── Vocabulary richness indices ─────────────────────
	// Honore's R = 100 * log10(n) / (1 - V1/V)  where V1=hapax, V=unique
	const honoreR =
		uniqueWords.size > 0 && uniqueWords.size - hapaxLegomena > 0
			? (100 * Math.log10(wordCount)) / (1 - hapaxLegomena / uniqueWords.size)
			: 0;

	// Brunet's W = N^(V^-0.165) (higher = richer vocab)
	const brunetW =
		uniqueWords.size > 0 ? wordCount ** (uniqueWords.size ** -0.165) : 0;

	// ── Readability ────────────────────────────────────
	// For EN: Flesch-Kincaid. For ID: simplified syllable-based.
	const syllableCount = words.reduce(
		(sum, w) => sum + estimateSyllables(w, lang),
		0,
	);
	let readability = 0;
	if (sentenceCount > 0) {
		if (lang === "id") {
			// Indonesian readability: simpler formula
			readability =
				0.39 * (wordCount / sentenceCount) +
				6.5 * (syllableCount / wordCount) -
				5;
		} else {
			readability =
				0.39 * (wordCount / sentenceCount) +
				11.8 * (syllableCount / wordCount) -
				15.59;
		}
	}

	return {
		wordCount,
		uniqueWordCount: uniqueWords.size,
		sentenceCount,
		paragraphCount,
		avgWordLength: round(
			words.reduce((sum, w) => sum + w.length, 0) / wordCount,
		),
		avgSentenceLength: round(avgSentenceLength),
		sentenceLengthStdDev: round(sentenceLengthStdDev),
		sentenceLengthVariation: round(sentenceLengthVariation),
		burstiness: round(burstiness),
		typeTokenRatio: round(typeTokenRatio),
		mattr: round(mattr),
		hapaxRatio: round(hapaxRatio),
		hapaxDisRatio: round(hapaxDisRatio),
		honoreR: round(honoreR),
		brunetW: round(brunetW),
		functionWordRatio: round(functionWordRatio),
		trigramRepetition: round(trigramRepetition),
		avgParagraphLength: round(avgParagraphLength),
		paragraphLengthStdDev: round(paragraphLengthStdDev),
		conjunctionStartRatio: round(conjunctionStartRatio),
		firstPersonDensity: round(firstPersonDensity),
		punctDensity: round(punctDensity),
		emDashDensity: round(emDashDensity),
		readability: round(readability),
		sentenceLengths,
	};
}

// ─── MATTR ───────────────────────────────────────────────

function computeMATTR(words, windowSize) {
	if (words.length < windowSize) return typeTokenRatioSimple(words);

	let totalTTR = 0;
	let windows = 0;

	for (let i = 0; i <= words.length - windowSize; i++) {
		const window = words.slice(i, i + windowSize);
		const unique = new Set(window);
		totalTTR += unique.size / windowSize;
		windows++;
	}

	return windows > 0 ? totalTTR / windows : 0;
}

function typeTokenRatioSimple(words) {
	if (words.length === 0) return 0;
	return new Set(words).size / words.length;
}

// ─── N-gram Repetition ──────────────────────────────────

function computeNgramRepetition(words, n) {
	if (words.length < n) return 0;

	const ngrams = {};
	for (let i = 0; i <= words.length - n; i++) {
		const gram = words.slice(i, i + n).join(" ");
		ngrams[gram] = (ngrams[gram] || 0) + 1;
	}

	const total = Object.keys(ngrams).length;
	if (total === 0) return 0;

	const repeated = Object.values(ngrams).filter((c) => c > 1).length;
	return repeated / total;
}

// ─── Syllable Estimation ────────────────────────────────

function estimateSyllables(word, lang = "en") {
	const clean = word.toLowerCase().replace(/[^a-z]/g, "");
	if (clean.length <= 3) return 1;

	if (lang === "id") {
		return estimateSyllablesID(clean);
	}

	// English
	const vowelGroups = clean.match(/[aeiouy]+/g);
	let count = vowelGroups ? vowelGroups.length : 1;
	if (clean.endsWith("e") && !clean.endsWith("le")) count--;
	if (clean.endsWith("ed") && clean.length > 3 && !/[aeiouy]ed$/.test(clean))
		count--;
	return Math.max(count, 1);
}

function estimateSyllablesID(word) {
	// Indonesian: each vowel group ≈ 1 syllable
	// Much more regular than English
	const vowelGroups = word.match(/[aiueo]+/g);
	return vowelGroups ? vowelGroups.length : 1;
}

// ─── Uniformity Score ───────────────────────────────────

function computeUniformityScore(stats) {
	if (stats.wordCount === 0) return 0;

	let score = 0;

	// Low burstiness = AI (max 20 pts)
	if (stats.burstiness < 0.2) score += 20;
	else if (stats.burstiness < 0.35) score += 14;
	else if (stats.burstiness < 0.5) score += 8;
	else if (stats.burstiness < 0.65) score += 4;

	// Low sentence length variation = AI (max 20 pts)
	if (stats.sentenceLengthVariation < 0.2) score += 20;
	else if (stats.sentenceLengthVariation < 0.35) score += 14;
	else if (stats.sentenceLengthVariation < 0.5) score += 8;
	else if (stats.sentenceLengthVariation < 0.65) score += 4;

	// Low vocabulary diversity = AI (max 15 pts)
	if (stats.wordCount > 100) {
		if (stats.typeTokenRatio < 0.35) score += 15;
		else if (stats.typeTokenRatio < 0.45) score += 10;
		else if (stats.typeTokenRatio < 0.55) score += 4;

		// Low MATTR = repetitive (max 10 pts)
		if (stats.mattr < 0.55) score += 10;
		else if (stats.mattr < 0.65) score += 6;
		else if (stats.mattr < 0.75) score += 3;

		// Low hapax ratio = less lexical creativity (max 10 pts)
		if (stats.hapaxRatio < 0.3) score += 10;
		else if (stats.hapaxRatio < 0.4) score += 6;
		else if (stats.hapaxRatio < 0.5) score += 3;

		// High trigram repetition = AI (max 10 pts)
		if (stats.trigramRepetition > 0.15) score += 10;
		else if (stats.trigramRepetition > 0.1) score += 6;
		else if (stats.trigramRepetition > 0.05) score += 3;
	}

	// Low conjunction start ratio = AI (max 5 pts)
	// Humans often start sentences with And/But/So
	if (stats.sentenceCount > 3) {
		if (stats.conjunctionStartRatio < 0.05) score += 5;
		else if (stats.conjunctionStartRatio < 0.1) score += 3;
	}

	// Low first-person density = AI (max 5 pts)
	if (stats.wordCount > 100) {
		if (stats.firstPersonDensity < 0.5) score += 5;
		else if (stats.firstPersonDensity < 1.5) score += 3;
	}

	// Low punctuation density = AI (max 5 pts)
	// AI text tends to avoid questions and exclamations
	if (stats.wordCount > 100) {
		if (stats.punctDensity < 0.3) score += 5;
		else if (stats.punctDensity < 0.8) score += 3;
	}

	return Math.min(score, 100);
}

function round(n) {
	return Math.round(n * 1000) / 1000;
}

function emptyStats() {
	return {
		wordCount: 0,
		uniqueWordCount: 0,
		sentenceCount: 0,
		paragraphCount: 0,
		avgWordLength: 0,
		avgSentenceLength: 0,
		sentenceLengthStdDev: 0,
		sentenceLengthVariation: 0,
		burstiness: 0,
		typeTokenRatio: 0,
		mattr: 0,
		hapaxRatio: 0,
		hapaxDisRatio: 0,
		honoreR: 0,
		brunetW: 0,
		functionWordRatio: 0,
		trigramRepetition: 0,
		avgParagraphLength: 0,
		paragraphLengthStdDev: 0,
		conjunctionStartRatio: 0,
		firstPersonDensity: 0,
		punctDensity: 0,
		emDashDensity: 0,
		readability: 0,
		sentenceLengths: [],
	};
}

// ─── Exports ─────────────────────────────────────────────

module.exports = {
	computeStats,
	computeUniformityScore,
	computeNgramRepetition,
	splitSentences,
	tokenize,
	estimateSyllables,
};
