/**
 * language.js — Language detection and routing.
 *
 * Detects whether text is English or Indonesian.
 * Routes to correct patterns, vocabulary, and humanization engine.
 */

// ─── Common words unique to each language ────────────────

const ID_MARKERS = [
	"dan",
	"di",
	"ke",
	"dari",
	"yang",
	"ini",
	"itu",
	"dengan",
	"untuk",
	"dalam",
	"pada",
	"adalah",
	"akan",
	"telah",
	"sudah",
	"tidak",
	"ada",
	"dapat",
	"bisa",
	"lebih",
	"sangat",
	"juga",
	"atau",
	"karena",
	"jika",
	"ketika",
	"saya",
	"kami",
	"kita",
	"mereka",
	"dia",
	"ia",
	"anda",
	"kamu",
	"bukan",
	"belum",
	"pernah",
	"sedang",
	"sedangkan",
	"sementara",
	"meskipun",
	"walaupun",
	"namun",
	"tetapi",
	"maka",
	"sehingga",
	"agar",
	"supaya",
	"yakni",
	"yaitu",
	"sebagai",
	"secara",
	"seluruh",
	"semua",
	"setiap",
	"beberapa",
	"sering",
	"biasanya",
	"selalu",
	"kadang",
	"jarang",
	"sini",
	"situ",
	"sana",
	"sekarang",
	"nanti",
	"dulu",
	"terima kasih",
	"tolong",
	"maaf",
	"silakan",
	"ya",
	"tidak",
	"boleh",
	"harus",
	"mau",
	"ingin",
	"bisa",
	"dapat",
];

const EN_MARKERS = [
	"the",
	"of",
	"and",
	"to",
	"in",
	"is",
	"are",
	"was",
	"were",
	"have",
	"has",
	"had",
	"do",
	"does",
	"did",
	"will",
	"would",
	"could",
	"should",
	"may",
	"might",
	"shall",
	"can",
	"must",
	"this",
	"that",
	"these",
	"those",
	"with",
	"for",
	"on",
	"at",
	"by",
	"from",
	"or",
	"but",
	"not",
	"be",
	"been",
	"being",
	"what",
	"which",
	"who",
	"whom",
	"when",
	"where",
	"why",
	"how",
	"very",
	"quite",
	"rather",
	"some",
	"any",
	"no",
	"every",
	"all",
	"both",
	"each",
	"few",
	"many",
	"much",
	"more",
	"most",
	"other",
	"hello",
	"hi",
	"thanks",
	"please",
	"excuse",
	"sorry",
	"yes",
	"no",
];

/**
 * Detect the language of a text.
 * Returns 'id' for Indonesian, 'en' for English.
 *
 * Uses simple ratio of ID-specific vs EN-specific common words.
 * Falls back to 'en' on tie or very short text.
 *
 * @param {string} text
 * @returns {'en' | 'id'}
 */
function detectLanguage(text) {
	if (!text || typeof text !== "string" || text.trim().length < 10) {
		return "en"; // fallback
	}

	const lower = text.toLowerCase();
	const words = lower.split(/\s+/).filter(Boolean);

	let idScore = 0;
	let enScore = 0;

	// Score based on unique marker words
	for (const word of words) {
		if (ID_MARKERS.includes(word)) idScore++;
		if (EN_MARKERS.includes(word)) enScore++;
	}

	// Also check for Indonesian-specific characters/digraphs
	// "ng", "ny", "sy", "kh" are common in Indonesian
	if (/[^a-z]?(ng|ny|sy|kh)[^a-z]?/i.test(lower)) idScore += 2;

	// "th" is common in English, rare in Indonesian
	const thCount = (
		lower.match(
			/\bthe\b|\bthis\b|\bthat\b|\bthese\b|\bthose\b|\bthem\b|\bthey\b|\bthere\b/g,
		) || []
	).length;
	enScore += thCount;

	// "di " as prefix is very Indonesian
	const diPrefix = (lower.match(/\bdi\w+/g) || []).length;
	idScore += diPrefix;

	// "to " as infinitive is very English
	const toInfinitive = (lower.match(/\bto \w+/g) || []).length;
	enScore += toInfinitive;

	// "yang" is uniquely Indonesian, very common
	const yangCount = (lower.match(/\byang\b/g) || []).length;
	idScore += yangCount * 3;

	// "the" is uniquely English, very common
	const theCount = (lower.match(/\bthe\b/g) || []).length;
	enScore += theCount * 3;

	return idScore > enScore ? "id" : "en";
}

/**
 * Get the correct pattern and vocabulary modules for a language.
 *
 * @param {'en'|'id'} lang
 * @returns {{ patterns: object[], vocabulary: object, patternsId?: object[] }}
 */
function getLanguagePack(lang) {
	if (lang === "id") {
		return {
			patterns: require("./patterns").patterns,
			patternsId: require("./patterns-id").patternsId,
			vocabulary: require("./vocabulary"),
			vocabularyId: require("./vocabulary-id"),
		};
	}
	return {
		patterns: require("./patterns").patterns,
		vocabulary: require("./vocabulary"),
	};
}

module.exports = { detectLanguage, getLanguagePack };
