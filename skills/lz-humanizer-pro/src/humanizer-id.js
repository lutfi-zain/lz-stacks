/**
 * humanizer-id.js — Indonesian humanization engine (5-Layer Framework).
 *
 * Based on lz-humanizer's framework:
 *   Layer 1: Sentence structure variation
 *   Layer 2: Conversational tone & word choice
 *   Layer 3: Emotional depth & personal voice
 *   Layer 4: Natural flow & jargon removal
 *   Layer 5: Deliberate imperfections
 *
 * Combines detection scores with qualitative rewriting guidance.
 */

const { analyze } = require("./analyzer");
const { TIER_1_ID, AI_PHRASES_ID } = require("./vocabulary-id");

// ─── Indonesian Auto-Fix ─────────────────────────────────

function autoFixId(text) {
	let result = text;
	const fixes = [];

	// Hapus pembukaan chatbot
	const chatbotOpen = [
		/^berikut adalah (.*?)(:)?\s*/gim,
		/^tentu,?\s*/gim,
		/^tentu saja!\s*/gim,
		/^dengan senang hati\s*/gim,
		/^pertanyaan (yang )?bagus!\s*/gim,
	];
	for (const regex of chatbotOpen) {
		if (regex.test(result)) {
			result = result.replace(regex, "");
			fixes.push("Hapus pembukaan chatbot");
		}
	}

	// Hapus penutup chatbot
	const chatbotClose = [
		/\s*semoga membantu[.!]?\s*$/gi,
		/\s*jika ada yang ingin ditanyakan[^.]*[.!]\s*$/gi,
		/\s*jangan ragu untuk (bertanya|menghubungi)[^.]*[.!]\s*$/gi,
	];
	for (const regex of chatbotClose) {
		if (regex.test(result)) {
			result = result.replace(regex, "");
			fixes.push("Hapus penutup chatbot");
		}
	}

	// Ganti frasa AI umum dengan yang natural
	const replacements = [
		{
			from: /\bdalam rangka (untuk )?\b/gi,
			to: "untuk",
			label: '"dalam rangka" → "untuk"',
		},
		{
			from: /\bdengan demikian\b/gi,
			to: "jadi",
			label: '"dengan demikian" → "jadi"',
		},
		{
			from: /\boleh karena itu\b/gi,
			to: "jadi",
			label: '"oleh karena itu" → "jadi"',
		},
		{
			from: /\bmemanfaatkan\b/gi,
			to: "menggunakan",
			label: '"memanfaatkan" → "menggunakan"',
		},
		{
			from: /\bdimanfaatkan\b/gi,
			to: "digunakan",
			label: '"dimanfaatkan" → "digunakan"',
		},
		{
			from: /\bpemanfaatan\b/gi,
			to: "penggunaan",
			label: '"pemanfaatan" → "penggunaan"',
		},
		{
			from: /\bmenunjukkan\b/gi,
			to: "menunjukan",
			label: '"menunjukkan" → "menunjukan"',
		},
		{
			from: /\bberfungsi sebagai\b/gi,
			to: "adalah",
			label: '"berfungsi sebagai" → "adalah"',
		},
		{
			from: /\bmerupakan\b/gi,
			to: "adalah",
			label: '"merupakan" → "adalah" (bila cocok)',
		},
		{ from: /\bsehingga\b/gi, to: "jadi", label: '"sehingga" → "jadi"' },
		{ from: /\bolebih lanjut\b/gi, to: "", label: '"lebih lanjut" → (hapus)' },
		{
			from: /\bsebagai (kesimpulan|penutup)\b/gi,
			to: "",
			label: '"sebagai kesimpulan" → (hapus)',
		},
	];

	for (const { from, to, label } of replacements) {
		if (from.test(result)) {
			result = result.replace(from, to);
			fixes.push(label);
		}
	}

	result = result.trim();
	return { text: result, fixes };
}

// ─── 5-Layer Humanization ───────────────────────────────

function humanizeId(text, opts = {}) {
	const { autofix = false, ignoreCode = false, ignoreQuotes = false } = opts;

	const analysis = analyze(text, {
		verbose: true,
		includeStats: true,
		ignoreCode,
		ignoreQuotes,
		lang: "id",
	});

	// Layer analysis
	const layers = {
		layer1: analyzeSentenceVariation(analysis),
		layer2: analyzeToneAndWordChoice(analysis),
		layer3: analyzeEmotionalDepth(analysis),
		layer4: analyzeFlowAndJargon(analysis),
		layer5: analyzeImperfections(analysis),
	};

	// Group findings by priority
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
				suggestion: m.suggestion,
				confidence: m.confidence || "high",
			});
		}
	}

	let fixedText = null;
	let appliedFixes = [];
	if (autofix) {
		const result = autoFixId(text);
		fixedText = result.text;
		appliedFixes = result.fixes;
	}

	return {
		score: analysis.score,
		patternScore: analysis.patternScore,
		uniformityScore: analysis.uniformityScore,
		language: "id",
		reliability: analysis.reliability,
		wordCount: analysis.wordCount,
		totalIssues: analysis.totalMatches,
		stats: analysis.stats,
		layers,
		...packs,
		autofix: autofix ? { text: fixedText, fixes: appliedFixes } : null,
		guidance: buildGuidanceId(analysis, layers),
		styleTips: buildStyleTipsId(analysis.stats),
		prompting: buildPromptingId(layers),
	};
}

// ─── Layer Analysis ─────────────────────────────────────

function analyzeSentenceVariation(analysis) {
	const stats = analysis.stats;
	if (!stats || stats.sentenceCount < 3)
		return {
			status: "insufficient",
			tip: "Teks terlalu pendek untuk analisis variasi kalimat.",
		};

	const issues = [];
	if (stats.burstiness < 0.25)
		issues.push("Burstiness sangat rendah — panjang kalimat terlalu seragam.");
	if (stats.sentenceLengthVariation < 0.3)
		issues.push("Variasi panjang kalimat minim.");
	if (stats.avgSentenceLength > 25)
		issues.push("Rata-rata kalimat terlalu panjang (>25 kata).");
	if (stats.avgSentenceLength < 10)
		issues.push("Rata-rata kalimat terlalu pendek — gabungkan beberapa.");

	return {
		status: issues.length === 0 ? "baik" : "perlu diperbaiki",
		avgLength: stats.avgSentenceLength,
		burstiness: stats.burstiness,
		variation: stats.sentenceLengthVariation,
		issues,
		tip_baik:
			"Campur kalimat sangat pendek (3-8 kata) dengan yang lebih panjang. Gunakan fragmen untuk penekanan.",
		tip_perbaiki:
			"Variasikan panjang. Pola: 5 kata. 18 kata di sini. 7 kata. 22 kata untuk yang lebih kompleks.",
	};
}

function analyzeToneAndWordChoice(analysis) {
	const stats = analysis.stats;
	const findings = analysis.findings;

	const kataFormalCount = findings
		.filter((f) => f.patternId === 101 || f.patternId === 106)
		.reduce((sum, f) => sum + f.matchCount, 0);

	// Check for AI vocabulary density
	const aiVocabFindings = findings.filter((f) => f.patternId === 101);
	const aiVocabMatches = aiVocabFindings.reduce(
		(sum, f) => sum + f.matchCount,
		0,
	);

	return {
		status: aiVocabMatches > 5 ? "perlu diperbaiki" : "baik",
		kataFormalCount,
		aiVocabCount: aiVocabMatches,
		tip_baik:
			'Ganti kata formal dengan sehari-hari. "Memanfaatkan" → "gunakan", "menunjukkan" → "lihat". Tambah kontraksi secara natural.',
		tip_perbaiki:
			"Pindai kata-kata canggih. Apa yang bisa lebih sederhana? Target: bahasa yang Anda pakai ngobrol dengan teman.",
	};
}

function analyzeEmotionalDepth(analysis) {
	const stats = analysis.stats;

	const firstPersonDensity = stats ? stats.firstPersonDensity : 0;
	const punctDensity = stats ? stats.punctDensity : 0;

	const issues = [];
	if (firstPersonDensity < 0.5)
		issues.push('Hampir tidak ada perspektif personal (kata "saya"/"kami").');
	if (punctDensity < 0.3)
		issues.push("Sangat sedikit tanda tanya/seru —teks terasa datar.");

	return {
		status: issues.length === 0 ? "baik" : "perlu diperbaiki",
		firstPersonDensity,
		punctDensity,
		issues,
		tip_baik:
			'Tambahkan penanda opini ringan: "Saya pikir", "jujur saja", "menurut saya". Gunakan pertanyaan retoris.',
		tip_perbaiki:
			'Suntikkan perspektif personal. Di mana Anda bisa bilang "saya" atau "kami"? Tambahkan reaksi terhadap fakta, bukan lapor doang.',
	};
}

function analyzeFlowAndJargon(analysis) {
	const stats = analysis.stats;
	const findings = analysis.findings;

	const promoCount = findings
		.filter((f) => f.patternId === 102)
		.reduce((sum, f) => sum + f.matchCount, 0);
	const signifCount = findings
		.filter((f) => f.patternId === 103)
		.reduce((sum, f) => sum + f.matchCount, 0);
	const tantanganCount = findings
		.filter((f) => f.patternId === 105)
		.reduce((sum, f) => sum + f.matchCount, 0);
	const atribusiCount = findings
		.filter((f) => f.patternId === 104)
		.reduce((sum, f) => sum + f.matchCount, 0);

	const avgParaLen = stats ? stats.avgParagraphLength : 0;
	const issues = [];
	if (promoCount + signifCount > 3)
		issues.push("Terlalu banyak bahasa promosi dan klaim signifikansi.");
	if (tantanganCount > 1)
		issues.push('Formula "meskipun tantangan" terdeteksi.');
	if (atribusiCount > 1)
		issues.push(
			'Atribusi samar ("para ahli", "penelitian menunjukkan") tanpa sumber.',
		);
	if (avgParaLen > 120) issues.push("Paragraf terlalu panjang (>120 kata).");

	return {
		status: issues.length === 0 ? "baik" : "perlu diperbaiki",
		promoCount,
		signifCount,
		tantanganCount,
		atribusiCount,
		avgParagraphLength: avgParaLen,
		issues,
		tip_baik:
			'Pecah paragraf padat. Target 3-4 kalimat per paragraf. Gunakan transisi variasi, bukan "selain itu" melulu.',
		tip_perbaiki:
			"Hilangkan semua jargon korporat. Ganti dengan bahasa biasa. Pecah paragraf >4 kalimat.",
	};
}

function analyzeImperfections(analysis) {
	const stats = analysis.stats;

	const issues = [];
	if (stats && stats.trigramRepetition > 0.1)
		issues.push("Terlalu rapi — trigram repetition tinggi.");
	if (stats && stats.sentenceCount > 5 && stats.sentenceLengthStdDev < 3)
		issues.push("Struktur terlalu seragam — seperti template.");

	return {
		status: issues.length === 0 ? "baik" : "perlu diperbaiki",
		trigramRepetition: stats ? stats.trigramRepetition : 0,
		stdDev: stats ? stats.sentenceLengthStdDev : 0,
		issues,
		tip_baik:
			'Tambah "cacat" ringan: klarifikasi tengah-pikiran ("baiklah, tidak persis"), elipsis jarang, repetisi kata untuk penekanan.',
		tip_perbaiki:
			"Biarkan sedikit ketidaksempurnaan. Teks terlalu sempurna = AI. Tambahkan momen keraguan atau koreksi diri.",
	};
}

// ─── Guidance ────────────────────────────────────────────

function buildGuidanceId(analysis, layers) {
	const tips = [];
	const ids = new Set(analysis.findings.map((f) => f.patternId));

	if (ids.has(101))
		tips.push(
			'Ganti kata AI Indonesia dengan kata sehari-hari. "Memanfaatkan" → "gunakan", "optimalisasi" → "perbaikan".',
		);
	if (ids.has(102))
		tips.push(
			'Hapus bahasa promosi. "Terletak di jantung kota" → "di pusat kota". "Pesona" → (spesifik — apa yang menarik?).',
		);
	if (ids.has(103))
		tips.push(
			'Hapus klaim signifikansi. Jangan bilang "menjadi tonggak penting" — bilang apa yang sebenarnya terjadi.',
		);
	if (ids.has(104))
		tips.push(
			'Sebut sumber spesifik. "Penelitian menunjukkan" → "Studi Smith (2024) menemukan".',
		);
	if (ids.has(105))
		tips.push(
			'Ganti formula "tantangan ke depan" dengan tantangan spesifik dan hasil konkret.',
		);
	if (ids.has(106))
		tips.push(
			'Gunakan "adalah" bukan "berfungsi sebagai". Sederhana itu lebih baik.',
		);
	if (ids.has(107))
		tips.push(
			'Potong frasa "-i" di akhir kalimat. Kalau penting, kasih kalimat sendiri.',
		);
	if (ids.has(108))
		tips.push(
			'Satu qualifier per klaim. "Mungkin bisa jadi akan" → pilih satu: "mungkin" atau "akan".',
		);

	// Layer-based tips
	if (layers.layer1.status === "perlu diperbaiki")
		tips.push(
			"LAYER 1: Variasikan panjang kalimat. Campur pendek (3-8 kata) dengan panjang (20+).",
		);
	if (layers.layer2.status === "perlu diperbaiki")
		tips.push(
			"LAYER 2: Gunakan bahasa sehari-hari. Kontraksi, kata sederhana, tone percakapan.",
		);
	if (layers.layer3.status === "perlu diperbaiki")
		tips.push(
			'LAYER 3: Tambahkan suara personal. "Saya pikir", opini ringan, pertanyaan retoris.',
		);
	if (layers.layer4.status === "perlu diperbaiki")
		tips.push(
			'LAYER 4: Hilangkan jargon. Pecah paragraf. Transisi natural, bukan "lebih lanjut".',
		);
	if (layers.layer5.status === "perlu diperbaiki")
		tips.push(
			"LAYER 5: Tambahkan imperfeksi ringan. Keraguan, koreksi diri, variasi struktur.",
		);

	if (analysis.score >= 50)
		tips.push(
			"Pertimbangkan tulis ulang total. Score tinggi = struktur AI, bukan cuma pilihan kata. Tulis dari awal dengan suara Anda sendiri.",
		);

	return tips;
}

function buildStyleTipsId(stats) {
	const tips = [];
	if (!stats) return tips;

	if (stats.burstiness < 0.25 && stats.sentenceCount > 4) {
		tips.push({
			metric: "burstiness",
			value: stats.burstiness,
			tip: 'LAYER 1: Ritme kalimat terlalu seragam. Campur pendek dan panjang. Contoh: "Saya coba. Hasilnya mengejutkan. Ternyata butuh waktu lebih lama dari yang saya kira — hampir tiga minggu penuh."',
		});
	}
	if (stats.typeTokenRatio < 0.4 && stats.wordCount > 100) {
		tips.push({
			metric: "typeTokenRatio",
			value: stats.typeTokenRatio,
			tip: "LAYER 2: Kosakata repetitif. Gunakan variasi kata tanpa synonym-cycling.",
		});
	}
	if (stats.firstPersonDensity < 0.5 && stats.wordCount > 100) {
		tips.push({
			metric: "firstPersonDensity",
			value: stats.firstPersonDensity,
			tip: 'LAYER 3: Tambahkan "saya", "kami", "menurut saya". Teks tanpa perspektif personal terasa seperti laporan robot.',
		});
	}
	if (stats.conjunctionStartRatio < 0.05 && stats.sentenceCount > 5) {
		tips.push({
			metric: "conjunctionStartRatio",
			value: stats.conjunctionStartRatio,
			tip: 'LAYER 4: Manusia sering mulai kalimat dengan "Tapi", "Jadi", "Makanya". Coba tambahkan.',
		});
	}
	if (stats.trigramRepetition > 0.1 && stats.wordCount > 100) {
		tips.push({
			metric: "trigramRepetition",
			value: stats.trigramRepetition,
			tip: "LAYER 5: Struktur terlalu rapi. Variasikan pola kalimat agar tidak seperti template.",
		});
	}

	if (tips.length >= 2) {
		tips.push({
			metric: "general",
			value: null,
			tip: 'Baca keras-keras. Di mana terasa kaku? Pecah kalimat panjang. Tambah kata kasual seperti "jadi", "dengar", "masalahnya".',
		});
	}

	return tips;
}

// ─── Prompting (lanjutan untuk user) ─────────────────────

function buildPromptingId(layers) {
	const prompts = [];

	if (layers.layer1.status === "perlu diperbaiki") {
		prompts.push(
			"A: Baca ini keras-keras. Di mana terasa kaku? Pecah kalimat panjang. Campur dengan yang pendek.",
		);
	}
	if (layers.layer2.status === "perlu diperbaiki") {
		prompts.push(
			"B: Pindai kata-kata formal. Mana yang bisa diganti dengan versi sehari-hari? Coba tulis ulang seperti Anda ngobrol.",
		);
	}
	if (layers.layer3.status === "perlu diperbaiki") {
		prompts.push(
			'C: Tambahkan perspektif pribadi. "Saya pikir", "dari yang saya lihat". Kenapa ini penting buat Anda atau pembaca?',
		);
	}
	if (layers.layer4.status === "perlu diperbaiki") {
		prompts.push(
			'D: Periksa setiap paragraf. Lebih dari 4 kalimat? Pecah. Transisi alami? Ganti "lebih lanjut" dengan konektor kasual.',
		);
	}
	if (layers.layer5.status === "perlu diperbaiki") {
		prompts.push(
			"E: Cek autentisitas. Terdengar seperti orang sungguhan? Tambah imperfeksi kecil, momen keraguan, klarifikasi.",
		);
	}

	if (prompts.length === 0) {
		prompts.push(
			'Teks sudah cukup natural. Bisa coba: "Baca sekali lagi keras-keras — apakah ada yang masih terasa kaku?"',
		);
	}

	return prompts;
}

// ─── Format Output ───────────────────────────────────────

function formatSuggestionsId(result) {
	const lines = [];

	lines.push("");
	lines.push("┌──────────────────────────────────────────────────┐");
	lines.push("│          SARAN HUMANISASI BAHASA INDONESIA        │");
	lines.push("└──────────────────────────────────────────────────┘");
	lines.push("");

	const filled = Math.round(result.score / 5);
	const bar = "█".repeat(filled) + "░".repeat(20 - filled);
	lines.push(`  Skor AI: ${result.score}/100  [${bar}]`);
	lines.push(
		`  Masalah: ${result.totalIssues}  |  Pola: ${result.patternScore}  |  Keseragaman: ${result.uniformityScore}`,
	);
	if (result.layers) {
		const statusEmoji = (s) =>
			s === "baik" ? "✅" : s === "perlu diperbaiki" ? "⚠️" : "ℹ️";
		lines.push(
			`  Layer 1: ${statusEmoji(result.layers.layer1.status)} Variasi kalimat`,
		);
		lines.push(
			`  Layer 2: ${statusEmoji(result.layers.layer2.status)} Tone & pilihan kata`,
		);
		lines.push(
			`  Layer 3: ${statusEmoji(result.layers.layer3.status)} Kedalaman emosi`,
		);
		lines.push(
			`  Layer 4: ${statusEmoji(result.layers.layer4.status)} Aliran & jargon`,
		);
		lines.push(
			`  Layer 5: ${statusEmoji(result.layers.layer5.status)} Imperfeksi`,
		);
	}
	lines.push("");

	if (result.critical && result.critical.length > 0) {
		lines.push("── KRITIS (dead giveaways) ────────────────────────");
		for (const s of result.critical)
			lines.push(
				`  L${s.line}: [${s.pattern}] "${truncate(s.text, 60)}"\n       → ${s.suggestion}`,
			);
		lines.push("");
	}

	if (result.important && result.important.length > 0) {
		lines.push("── PENTING (pola noticeable) ──────────────────────");
		for (const s of result.important.slice(0, 15))
			lines.push(
				`  L${s.line}: [${s.pattern}] "${truncate(s.text, 60)}"\n       → ${s.suggestion}`,
			);
		if (result.important.length > 15)
			lines.push(`  ... dan ${result.important.length - 15} lagi`);
		lines.push("");
	}

	if (result.guidance && result.guidance.length > 0) {
		lines.push("── PANDUAN ────────────────────────────────────────");
		for (const tip of result.guidance) lines.push(`  • ${tip}`);
		lines.push("");
	}

	if (result.styleTips && result.styleTips.length > 0) {
		lines.push("── TIPS GAYA (statistik) ───────────────────────────");
		for (const t of result.styleTips) lines.push(`  ◦ ${t.tip}`);
		lines.push("");
	}

	if (result.prompting && result.prompting.length > 0) {
		lines.push("── PROMPT LANJUTAN ────────────────────────────────");
		for (const p of result.prompting) lines.push(`  ${p}`);
		lines.push("");
	}

	if (result.autofix && result.autofix.fixes.length > 0) {
		lines.push("── PERBAIKAN OTOMATIS ─────────────────────────────");
		for (const fix of result.autofix.fixes) lines.push(`  ✓ ${fix}`);
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
	humanizeId,
	autoFixId,
	formatSuggestionsId,
	buildGuidanceId,
	buildStyleTipsId,
};
