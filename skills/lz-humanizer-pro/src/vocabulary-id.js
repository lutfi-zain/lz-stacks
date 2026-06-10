/**
 * vocabulary-id.js — Indonesian AI vocabulary database.
 *
 * 200+ Indonesian words and phrases organized into detection tiers.
 * Sourced from:
 *   - lz-humanizer skill's banned word list
 *   - Wikipedia:Signs of AI writing (adapted for Indonesian patterns)
 *   - Real-world observation of ChatGPT/Claude output in Bahasa Indonesia
 */

// ─── Tier 1: Dead Giveaways ─────────────────────────────
// Words that strongly signal AI-generated Indonesian text.

const TIER_1_ID = [
	// Formal replacements for simple words
	"memanfaatkan",
	"dimanfaatkan",
	"pemanfaatan",
	"menunjukkan",
	"ditunjukkan",
	"perlihatkan",
	"memperlihatkan",
	"melambangkan",
	"dilambangkan",
	"menggambarkan",
	"digambarkan",
	"penggambaran",
	"menjadi tonggak",
	"merupakan", // overused as copula replacement
	"berfungsi sebagai",
	"bertindak sebagai",
	"menjadi landasan",
	"menjadi fondasi",

	// Jargon korporat
	"sinergi",
	"bersinergi",
	"sinergitas",
	"optimalisasi",
	"mengoptimalkan",
	"optimal",
	"efisiensi",
	"mengefisienkan",
	"transformasi",
	"transformasional",
	"mentransformasi",
	"lanskap", // abstract: "lanskap bisnis"
	"inovasi",
	"berinovasi",
	"menginovasi",
	"terobosan",
	"revolusioner",
	"disruptif",
	"disrupsi",
	"agilitas",
	"akselerasi",
	"mempercepat",
	"kapabilitas",
	"kompetensi inti",
	"tata kelola",
	"keberlanjutan",

	// Kata kunci AI umum
	"tapestri", // direct translation of "tapestry"
	"selami",
	"mendalam",
	"pendalaman",
	"komprehensif",
	"rumit",
	"kerumitan",
	"sebagai fondasi",
	"sebagai landasan",
	"sebagai pilar",
	"perjalanan", // abstract: "perjalanan transformasi"
	"lompatan",
	"terdepan",
	"terkemuka",
	"terkenal",
	"berdaya guna",

	// Frasa promosi
	"terletak di jantung",
	"pesona",
	"keindahan alam",
	"dikenal sebagai", // when used puffery
	"menawarkan",
	"menyajikan",
	"memiliki beragam",
	"kaya akan", // "kaya akan sejarah"
	"jantung kota",
	"pusat kegiatan",
];

// ─── Tier 2: Suspicious in Density ──────────────────────
// Normal in isolation, clusters signal AI.

const TIER_2_ID = [
	"implementasi",
	"mengimplementasikan",
	"terimplementasi",
	"fasilitasi",
	"memfasilitasi",
	"terfasilitasi",
	"kolaborasi",
	"berkolaborasi",
	"kolaboratif",
	"elaborasi",
	"mengelaborasi",
	"artikulasi",
	"mengartikulasikan",
	"integrasi",
	"terintegrasi",
	"mengintegrasikan",
	"sosialisasi",
	"mensosialisasikan",
	"intensifikasi",
	"diversifikasi",
	"diversifikasi",
	"harmonisasi",
	"sinkronisasi",
	"mensinkronkan",
	"evaluasi",
	"mengevaluasi",
	"monitoring",
	"kaji",
	"mengkaji",
	"pengkajian",
	"eksekusi",
	"mengeksekusi",
	"inisiatif",
	"strategis",
	"fundamental",
	"kontribusi",
	"berkontribusi",
	"partisipasi",
	"berpartisipasi",
	"apresiasi",
	"mengapresiasi",
	"klarifikasi",
	"mengklarifikasi",
	"progresif",
	"konstruktif",
	"produktif",
	"produktivitas",
	"akuntabilitas",
	"transparansi",
	"kredibilitas",
	"kapasitas", // "kapasitas untuk berubah"
	"momentum",
	"mainstream",
	"mindset",
	"insight",
	"talent",
	"engagement",
];

// ─── Tier 3: Context-Dependent ──────────────────────────
// Common words flagged only at high density.

const TIER_3_ID = [
	"penting",
	"terpenting",
	"kepentingan",
	"menarik",
	"ketertarikan",
	"utama",
	"terutama",
	"mengutamakan",
	"signifikan",
	"signifikansi",
	"besar",
	"terbesar",
	"membesar",
	"berdampak",
	"dampak",
	"efektif",
	"efektivitas",
	"efisien",
	"berkualitas",
	"kualitas",
	"bernilai",
	"nilai",
	"relevan",
	"relevansi",
	"konsisten",
	"konsistensi",
	"ideal",
	"kompleks",
	"kompleksitas",
	"dinamis",
	"antusias",
	"antusiasme",
	"kreatif",
	"kreativitas",
	"inovatif",
	"berani",
	"tepat",
	"ketepatan",
	"cepat",
	"mudah",
	"kemudahan",
	"luas",
	"keluasan",
	"mendalam",
	"berimbang",
	"terukur",
	"objektif",
	"kompetitif",
	"berkelanjutan",
	"terpadu",
	"menyeluruh",
	"seimbang",
];

// ─── AI Phrases (Indonesian) ───────────────────────────
// Multi-word phrases with regex and fix suggestions.

const AI_PHRASES_ID = [
	// Pembukaan chatbot
	{
		pattern: /^berikut adalah (.*?)(:|\.)/gim,
		tier: 1,
		fix: "(hapus — mulai langsung dengan konten)",
	},
	{ pattern: /^tentu,?\s*/gim, tier: 1, fix: "(hapus)" },
	{ pattern: /^tentu saja!\s*/gim, tier: 1, fix: "(hapus)" },
	{ pattern: /^dengan senang hati\s*/gim, tier: 1, fix: "(hapus)" },
	{
		pattern: /^pertanyaan (yang )?bagus!/gim,
		tier: 1,
		fix: "(hapus — jawab langsung)",
	},
	{ pattern: /^pertanyaan yang menarik!/gim, tier: 1, fix: "(hapus)" },

	// Penutup formulaik
	{ pattern: /\bsemoga membantu\b/gi, tier: 1, fix: "(hapus)" },
	{
		pattern: /\b(jika ada yang ingin|ada yang bisa saya bantu lagi)\b/gi,
		tier: 1,
		fix: "(hapus)",
	},
	{
		pattern: /\bjangan ragu untuk (bertanya|menghubungi)\b/gi,
		tier: 1,
		fix: "(hapus)",
	},
	{ pattern: /\bapakah ada yang (lain|lagi)\b/gi, tier: 1, fix: "(hapus)" },
	{
		pattern: /\bsemoga (penjelasan|informasi) ini (membantu|bermanfaat)\b/gi,
		tier: 1,
		fix: "(hapus)",
	},

	// Frasa AI umum
	{
		pattern: /\bdi (era|zaman) (digital|modern|sekarang|globalisasi)\b/gi,
		tier: 1,
		fix: "(hapus atau spesifik)",
	},
	{
		pattern: /\bdi dunia yang (serba|sangat) (cepat|dinamis|kompleks)\b/gi,
		tier: 1,
		fix: "(hapus atau spesifik)",
	},
	{
		pattern: /\btidak (hanya|sekedar) .{3,50} tetapi (juga )?\b/gi,
		tier: 1,
		fix: "sederhanakan — langsung ke intinya",
	},
	{
		pattern: /\bbukan hanya .{3,50} melainkan juga\b/gi,
		tier: 1,
		fix: "sederhanakan",
	},
	{
		pattern: /\bperlu (dicatat|diingat|dipahami) bahwa\b/gi,
		tier: 1,
		fix: "(hapus — langsung sampaikan fakta)",
	},
	{
		pattern: /\bhal (ini|tersebut) perlu (diperhatikan|dipertimbangkan)\b/gi,
		tier: 1,
		fix: "(hapus — langsung sampaikan)",
	},
	{
		pattern: /\byang perlu (diperhatikan|diingat) adalah\b/gi,
		tier: 1,
		fix: "(hapus)",
	},
	{ pattern: /\bdapat disimpulkan\b/gi, tier: 2, fix: "jadi / intinya" },
	{
		pattern: /\bsebagai (kesimpulan|penutup)\b/gi,
		tier: 2,
		fix: "(hapus — langsung ke inti)",
	},
	{
		pattern: /\bpada (dasarnya|hakikatnya|prinsipnya)\b/gi,
		tier: 2,
		fix: "(hapus atau sederhanakan)",
	},

	// Hedging berlebihan
	{
		pattern: /\bdapat (dipastikan|diperkirakan|diasumsikan)\b/gi,
		tier: 1,
		fix: "yakin / perkiraan / asumsi — pilih satu",
	},
	{ pattern: /\bmungkin bisa (jadi|saja)\b/gi, tier: 2, fix: "mungkin" },
	{ pattern: /\bbisa jadi akan\b/gi, tier: 2, fix: "bisa / akan — pilih satu" },
	{
		pattern: /\bdapat dikatakan bahwa\b/gi,
		tier: 1,
		fix: "(hapus — langsung katakan)",
	},
	{
		pattern: /\b(pada intinya|intinya) (adalah|ialah)\b/gi,
		tier: 2,
		fix: "(hapus)",
	},

	// Penanda ketidakpastian sistematis
	{ pattern: /\bdalam (rangka|upaya) (untuk )?\b/gi, tier: 2, fix: "untuk" },
	{ pattern: /\bsehubungan dengan\b/gi, tier: 2, fix: "tentang / mengenai" },
	{ pattern: /\bberkenaan dengan\b/gi, tier: 2, fix: "tentang" },
	{ pattern: /\bdengan demikian\b/gi, tier: 2, fix: "jadi / karena itu" },
	{ pattern: /\boleh karena itu\b/gi, tier: 2, fix: "jadi / karena itu" },
	{
		pattern: /\blebih lanjut\b/gi,
		tier: 2,
		fix: "(hapus atau ganti transisi)",
	},
	{
		pattern: /\bselain itu\b/gi,
		tier: 3,
		fix: "juga / dan / (variasi transisi)",
	},
	{ pattern: /\btambahan pula\b/gi, tier: 2, fix: "juga" },
	{ pattern: /\bdemikian pula\b/gi, tier: 2, fix: "juga" },

	// Promosi & puffery
	{
		pattern: /\bmenjadi (salah satu|bagian dari) (yang )?ter\w+\b/gi,
		tier: 1,
		fix: "(spesifik — apa yang membuatnya? beri data)",
	},
	{
		pattern: /\bmenawarkan (berbagai|segudang)\b/gi,
		tier: 1,
		fix: "(spesifik — apa saja?)",
	},
	{
		pattern: /\bterletak di jantung kota\b/gi,
		tier: 1,
		fix: "di pusat kota / di [nama daerah]",
	},
	{
		pattern: /\bdikenal sebagai\b/gi,
		tier: 2,
		fix: "(sebut buktinya — dikenal oleh siapa?)",
	},
	{
		pattern: /\bdengan bangga (mempersembahkan|menyajikan)\b/gi,
		tier: 1,
		fix: "(hapus — langsung sajikan)",
	},

	// Kesimpulan generik
	{
		pattern:
			/\b(masa depan|ke depannya) (terlihat|tampak) (cerah|menjanjikan)\b/gi,
		tier: 1,
		fix: "(akhiri dengan fakta spesifik)",
	},
	{
		pattern: /\bmasa depan yang (cerah|lebih baik|gemilang)\b/gi,
		tier: 1,
		fix: "(akhiri dengan fakta spesifik)",
	},
	{
		pattern: /\bseiring (berjalannya|dengan) waktu\b/gi,
		tier: 2,
		fix: "(spesifik — seiring apa?)",
	},
	{
		pattern: /\btantangan ke depan\b/gi,
		tier: 2,
		fix: "(sebut tantangan spesifik)",
	},
	{
		pattern: /\bpeluang (dan )?tantangan\b/gi,
		tier: 2,
		fix: "(sebut secara spesifik)",
	},
];

// ─── Function Words (Indonesian) ────────────────────────
// For stylometric function-word analysis.

const FUNCTION_WORDS_ID = [
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
	"tentang",
	"seperti",
	"antara",
	"oleh",
	"setelah",
	"sebelum",
	"hanya",
	"masih",
	"sudah",
	"pernah",
	"belum",
	"bukan",
	"namun",
	"tetapi",
	"sedangkan",
	"sementara",
	"meskipun",
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
];

// ─── Exports ─────────────────────────────────────────────

module.exports = {
	TIER_1_ID,
	TIER_2_ID,
	TIER_3_ID,
	AI_PHRASES_ID,
	FUNCTION_WORDS_ID,
};
