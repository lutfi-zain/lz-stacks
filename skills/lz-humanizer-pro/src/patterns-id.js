/**
 * patterns-id.js — AI writing pattern detectors (Indonesian).
 *
 * 8+ pattern detectors specific to Indonesian AI-generated text.
 * Based on lz-humanizer's framework + Wikipedia:Signs of AI writing adapted.
 *
 * Each pattern has:
 *   { id, name, category, description, weight(1-5), detect(text) }
 * IDs start at 101 to avoid collision with English patterns (1-29).
 */

const {
	TIER_1_ID,
	TIER_2_ID,
	TIER_3_ID,
	AI_PHRASES_ID,
} = require("./vocabulary-id");

// ─── Helpers ─────────────────────────────────────────────

function findMatches(text, regex, suggestion, confidence = "high") {
	const results = [];
	const lines = text.split("\n");
	let offset = 0;

	for (let lineNum = 0; lineNum < lines.length; lineNum++) {
		const line = lines[lineNum];
		const lineRegex = new RegExp(
			regex.source,
			regex.flags.includes("g") ? regex.flags : `${regex.flags}g`,
		);
		let m;
		while ((m = lineRegex.exec(line)) !== null) {
			results.push({
				match: m[0],
				index: offset + m.index,
				line: lineNum + 1,
				column: m.index + 1,
				suggestion:
					typeof suggestion === "function" ? suggestion(m[0]) : suggestion,
				confidence,
			});
		}
		offset += line.length + 1;
	}
	return results;
}

function countMatches(text, regex) {
	const m = text.match(regex);
	return m ? m.length : 0;
}

function wordCount(text) {
	return text.trim().split(/\s+/).filter(Boolean).length;
}

function wordRegex(word) {
	const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	if (word.includes(" ")) return new RegExp(`\\b${escaped}\\b`, "gi");
	return new RegExp(`\\b${escaped}\\b`, "gi");
}

function scanWordList(text, wordList, suggestionPrefix, confidence = "high") {
	const results = [];
	for (const word of wordList) {
		const regex = wordRegex(word);
		const matches = findMatches(
			text,
			regex,
			`${suggestionPrefix}: "${word}". Gunakan kata yang lebih sederhana.`,
			confidence,
		);
		results.push(...matches);
	}
	return results;
}

function scanPhrases(text, phrases) {
	const results = [];
	for (const { pattern, fix } of phrases) {
		const matches = findMatches(
			text,
			pattern,
			fix.startsWith("(") ? fix : `Ganti dengan: ${fix}`,
		);
		results.push(...matches);
	}
	return results;
}

// ─── Indonesian Pattern Lists ────────────────────────────

const PROMOSI_ID = [
	/\bterletak di jantung\b/gi,
	/\bpesona\b/gi,
	/\bkeindahan alam\b/gi,
	/\bdengan bangga (mempersembahkan|menyajikan|meluncurkan)\b/gi,
	/\bmenawarkan (berbagai|segudang|pilihan)\b/gi,
	/\bkaya akan (sejarah|budaya|tradisi|nilai)\b/gi,
	/\bdikenal sebagai\b/gi, // contextual: flagged when not introducing proper noun
	/\bjantung (kota|budaya|ekonomi)\b/gi,
	/\bsurga (tersembunyi|wisata|kuliner)\b/gi,
	/\bwajib (dikunjungi|dicoba)\b/gi,
	/\btak (ada )?duanya\b/gi,
	/\bterbaik\b/gi, // puffery context
];

const SIGNIFIKANSI_ID = [
	/menjadi tonggak (sejarah|penting)/gi,
	/menjadi (salah satu|bagian penting)/gi,
	/berperan (penting|signifikan|krusial|vital)/gi,
	/memainkan peran (penting|kunci|signifikan|vital)/gi,
	/menandai (perubahan|pergeseran|babak baru)/gi,
	/menjadi landasan (bagi|untuk)/gi,
	/mencerminkan (perkembangan|perubahan|tren) yang lebih luas/gi,
	/sebagai (bagian|bagian integral) dari/gi,
	/.{3,30} merupakan .{3,50} yang (penting|signifikan|krusial|vital)/gi,
	/berkontribusi pada (perkembangan|pertumbuhan|kemajuan|transformasi)/gi,
	/tidak dapat dipisahkan dari/gi,
];

const ATRIBUSI_VAGUE_ID = [
	/\bpara ahli (berpendapat|menyebutkan|mengatakan|menyatakan|meyakini)\b/gi,
	/\bpenelitian (menunjukkan|membuktikan|menyatakan|mengungkapkan)\b/gi,
	/\bberdasarkan (penelitian|studi|data) (yang )?(ada|tersedia)\b/gi,
	/\bsumber (menyebutkan|mengatakan|mengungkapkan)\b/gi,
	/\bdilaporkan (bahwa|secara luas)\b/gi,
	/\bsecara luas (diakui|dikenal|dianggap)\b/gi,
];

const TANTANGAN_ID = [
	/\bmeskipun (berbagai|banyak|adanya) (tantangan|hambatan|kendala|kesulitan)\b/gi,
	/\bmenghadapi (berbagai|banyak|beberapa) tantangan\b/gi,
	/\btantangan dan (peluang|masalah|hambatan)\b/gi,
	/\bke depannya? (terlihat|tampak|diharapkan) (cerah|lebih baik)\b/gi,
	/\bterus (berkembang|bertumbuh|berinovasi|beradaptasi)\b/gi,
	/\bdi tengah (tantangan|persaingan|perubahan)\b/gi,
];

const KOPULA_ID = [
	/\bberfungsi sebagai\b/gi,
	/\bbertindak sebagai\b/gi,
	/\bmenjadi (salah satu|bagian dari)\b/gi,
	/\bberperan sebagai\b/gi,
	/\bdapat dikategorikan sebagai\b/gi,
	/\btergolong sebagai\b/gi,
];

const SUPERFICIAL_I_ID = [
	/,\s*(menunjukkan|mencerminkan|memperlihatkan|menggambarkan|melambangkan|mengindikasikan|menandakan|mengartikan)\b[^.]{5,}/gi,
	/,\s*(sehingga|maka|dengan demikian) (\w+ ){0,10}(menunjukkan|mencerminkan|memperlihatkan)/gi,
];

const HEDGING_ID = [
	/\bdapat (dipastikan|diperkirakan|diasumsikan|dikatakan|dipertimbangkan)\b/gi,
	/\bmungkin bisa (jadi|saja|sahaja)\b/gi,
	/\bbisa jadi akan\b/gi,
	/\bdapat dikatakan bahwa\b/gi,
	/\b(pada intinya|intinya) (adalah|ialah|merupakan)\b/gi,
	/\bboleh (jadi|saja)\b/gi,
	/\bkemungkinan (besar|kecil) (akan )?\b/gi,
	/\bsecara (umum|garis besar|prinsip)\b.*\b(dapat|bisa)\b/gi,
	/\bkurang lebih\b/gi,
	/\bkiranya\b/gi,
];

// ─── Pattern Definitions (Indonesian) ────────────────────

const patternsId = [
	{
		id: 101,
		name: "Kata AI Indonesia",
		category: "language",
		description:
			"Kata-kata yang terlalu sering muncul di teks AI Bahasa Indonesia.",
		weight: 5,
		detect(text) {
			const results = [];
			const words = wordCount(text);

			// Tier 1: selalu flag
			results.push(
				...scanWordList(
					text,
					TIER_1_ID,
					"Tier 1 kata AI (dead giveaway)",
					"high",
				),
			);

			// Tier 2: flag jika 2+ muncul
			const tier2Matches = scanWordList(
				text,
				TIER_2_ID,
				"Tier 2 kata AI (curiga)",
				"medium",
			);
			if (tier2Matches.length >= 2) results.push(...tier2Matches);

			// Tier 3: high density only
			if (words > 50) {
				const tier3Count = TIER_3_ID.reduce(
					(count, word) => count + countMatches(text, wordRegex(word)),
					0,
				);
				if (tier3Count / words > 0.04) {
					results.push(
						...scanWordList(
							text,
							TIER_3_ID,
							"Tier 3 kata AI (densitas tinggi)",
							"low",
						),
					);
				}
			}

			// Frasa AI Indonesia
			results.push(...scanPhrases(text, AI_PHRASES_ID));
			return results;
		},
	},

	{
		id: 102,
		name: "Promosi berlebihan (Indonesia)",
		category: "content",
		description:
			"Bahasa promosi dan travel guide — ciri khas teks AI Indonesia.",
		weight: 3,
		detect(text) {
			const results = [];
			for (const regex of PROMOSI_ID) {
				results.push(
					...findMatches(
						text,
						regex,
						"Ganti dengan deskripsi faktual dan netral.",
						"high",
					),
				);
			}
			return results;
		},
	},

	{
		id: 103,
		name: "Signifikansi berlebihan (Indonesia)",
		category: "content",
		description:
			"Klaim berlebihan tentang pentingnya sesuatu — khas AI Indonesia.",
		weight: 4,
		detect(text) {
			const results = [];
			for (const regex of SIGNIFIKANSI_ID) {
				results.push(
					...findMatches(
						text,
						regex,
						"Hapus klaim signifikansi. Sampaikan fakta konkret.",
						"high",
					),
				);
			}
			return results;
		},
	},

	{
		id: 104,
		name: "Atribusi samar (Indonesia)",
		category: "content",
		description:
			'"Penelitian menunjukkan", "Para ahli berpendapat" — tanpa sumber jelas.',
		weight: 4,
		detect(text) {
			const results = [];
			for (const regex of ATRIBUSI_VAGUE_ID) {
				results.push(
					...findMatches(
						text,
						regex,
						"Sebut sumber spesifik. Jika tidak bisa, hapus klaim.",
						"high",
					),
				);
			}
			return results;
		},
	},

	{
		id: 105,
		name: "Formula tantangan (Indonesia)",
		category: "content",
		description:
			'"Meskipun berbagai tantangan... terus berkembang" — boilerplate AI.',
		weight: 3,
		detect(text) {
			const results = [];
			for (const regex of TANTANGAN_ID) {
				results.push(
					...findMatches(
						text,
						regex,
						"Ganti dengan tantangan spesifik dan hasil konkret.",
						"high",
					),
				);
			}
			return results;
		},
	},

	{
		id: 106,
		name: "Hindari kopula (Indonesia)",
		category: "language",
		description:
			'"Berfungsi sebagai", "bertindak sebagai" — hindari "adalah" yang sederhana.',
		weight: 3,
		detect(text) {
			const results = [];
			for (const regex of KOPULA_ID) {
				results.push(
					...findMatches(
						text,
						regex,
						'Gunakan "adalah" atau "ialah" yang lebih sederhana.',
						"high",
					),
				);
			}
			return results;
		},
	},

	{
		id: 107,
		name: "Analisis -i superfisial (Indonesia)",
		category: "content",
		description:
			'Frasa partisip "-i" di akhir kalimat untuk memalsukan kedalaman.',
		weight: 4,
		detect(text) {
			const results = [];
			for (const regex of SUPERFICIAL_I_ID) {
				results.push(
					...findMatches(
						text,
						regex,
						'Hapus frasa "-i" di akhir. Jika penting, buat kalimat sendiri.',
						"high",
					),
				);
			}
			return results;
		},
	},

	{
		id: 108,
		name: "Hedging berlebihan (Indonesia)",
		category: "language",
		description:
			'Tumpukan kata keraguan: "mungkin bisa jadi akan", "dapat dikatakan bahwa".',
		weight: 3,
		detect(text) {
			const results = [];
			for (const regex of HEDGING_ID) {
				results.push(
					...findMatches(
						text,
						regex,
						"Satu qualifier per klaim. Potong sisanya.",
						"high",
					),
				);
			}
			return results;
		},
	},

	{
		id: 109,
		name: "Analogi perjalanan (Indonesia)",
		category: "language",
		description:
			'"Perjalanan transformasi", "melangkah maju", "lompatan besar" — metafora AI.',
		weight: 2,
		detect(text) {
			const patterns = [
				/\bperjalanan (transformasi|bisnis|digital|menuju)\b/gi,
				/\bmelangkah (maju|ke depan|lebih jauh)\b/gi,
				/\blompatan (besar|kuantum|signifikan)\b/gi,
				/\bmembuka (jalan|pintu|peluang|babak baru)\b/gi,
				/\bmenapaki (jalan|langkah|jejak)\b/gi,
			];
			const results = [];
			for (const regex of patterns) {
				results.push(
					...findMatches(
						text,
						regex,
						"Ganti dengan bahasa konkret. Hindari metafora abstract.",
						"medium",
					),
				);
			}
			return results;
		},
	},
];

// ─── Exports ─────────────────────────────────────────────

module.exports = {
	patternsId,
	findMatches,
	countMatches,
	wordCount,
	scanWordList,
	scanPhrases,
};
