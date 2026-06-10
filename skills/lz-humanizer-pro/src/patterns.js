/**
 * patterns.js — AI writing pattern detectors (English).
 *
 * 29 pattern detectors for English AI-generated text.
 * Based on Wikipedia:Signs of AI writing and Copyleaks research.
 *
 * Each pattern has:
 *   { id, name, category, description, weight(1-5), detect(text) }
 *
 * detect() returns [{ match, index, line, column, suggestion, confidence }]
 */

const { TIER_1, TIER_2, TIER_3, AI_PHRASES } = require("./vocabulary");

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
			`${suggestionPrefix}: "${word}". Use a simpler alternative.`,
			confidence,
		);
		results.push(...matches);
	}
	return results;
}

// ─── Pattern Lists ───────────────────────────────────────

const SIGNIFICANCE_PHRASES = [
	/marking a pivotal/gi,
	/pivotal moment/gi,
	/pivotal role/gi,
	/key role/gi,
	/crucial role/gi,
	/vital role/gi,
	/significant role/gi,
	/is a testament/gi,
	/stands as a testament/gi,
	/serves as a testament/gi,
	/serves as a reminder/gi,
	/reflects broader/gi,
	/broader trends/gi,
	/broader movement/gi,
	/evolving landscape/gi,
	/evolving world/gi,
	/setting the stage for/gi,
	/marking a shift/gi,
	/key turning point/gi,
	/indelible mark/gi,
	/deeply rooted/gi,
	/focal point/gi,
	/symbolizing its ongoing/gi,
	/enduring legacy/gi,
	/lasting impact/gi,
	/contributing to the/gi,
	/underscores the importance/gi,
	/highlights the significance/gi,
	/represents a shift/gi,
	/shaping the future/gi,
	/the evolution of/gi,
	/rich tapestry/gi,
	/rich heritage/gi,
	/stands as a beacon/gi,
	/marks a milestone/gi,
	/paving the way/gi,
	/charting a course/gi,
];

const PROMOTIONAL_WORDS = [
	/\bnestled\b/gi,
	/\bin the heart of\b/gi,
	/\bbreathtaking\b/gi,
	/\bmust-visit\b/gi,
	/\bstunning\b/gi,
	/\brenowned\b/gi,
	/\bnatural beauty\b/gi,
	/\brich cultural heritage\b/gi,
	/\brich history\b/gi,
	/\bcommitment to\b/gi,
	/\bexemplifies\b/gi,
	/\bworld-class\b/gi,
	/\bstate-of-the-art\b/gi,
	/\bgame-changing\b/gi,
	/\bunparalleled\b/gi,
	/\bprofound\b/gi,
	/\bbest-in-class\b/gi,
	/\btrailblazing\b/gi,
	/\bvisionary\b/gi,
	/\bcutting-edge\b/gi,
];

const VAGUE_ATTRIBUTION = [
	/\bexperts (believe|argue|say|suggest|note|agree|contend|have noted)\b/gi,
	/\bindustry (reports|observers|experts|analysts|leaders|insiders)\b/gi,
	/\bobservers have (cited|noted|pointed out)\b/gi,
	/\bsome critics argue\b/gi,
	/\bsome experts (say|believe|suggest)\b/gi,
	/\bseveral sources\b/gi,
	/\baccording to reports\b/gi,
	/\bwidely (regarded|considered|recognized|acknowledged)\b/gi,
	/\bit is widely (known|believed|accepted)\b/gi,
	/\bmany (experts|scholars|researchers|analysts) (believe|argue|suggest)\b/gi,
	/\bstudies (show|suggest|indicate|have shown)\b/gi,
	/\bresearch (shows|suggests|indicates|has shown)\b/gi,
];

const CHALLENGES_PHRASES = [
	/despite (its|these|the|their) (challenges|setbacks|obstacles|difficulties|limitations)/gi,
	/faces (several|many|numerous|various) challenges/gi,
	/continues to thrive/gi,
	/continues to grow/gi,
	/future (outlook|prospects) (remain|look|appear)/gi,
	/challenges and (future|legacy|opportunities)/gi,
	/despite these (challenges|hurdles|obstacles)/gi,
	/overcoming (obstacles|challenges|adversity)/gi,
	/weather(ing|ed) the storm/gi,
];

const COPULA_AVOIDANCE = [
	/\bserves as( a)?\b/gi,
	/\bstands as( a)?\b/gi,
	/\bmarks a\b/gi,
	/\brepresents a\b/gi,
	/\bboasts (a|an|over|more)\b/gi,
	/\bfeatures (a|an|over|more)\b/gi,
	/\boffers (a|an)\b/gi,
	/\bfunctions as\b/gi,
	/\bacts as( a)?\b/gi,
	/\boperates as( a)?\b/gi,
];

// ─── Pattern Definitions ─────────────────────────────────

const patterns = [
	// ── CONTENT (1-6) ──────────────────────────────────
	{
		id: 1,
		name: "Significance inflation",
		category: "content",
		description:
			"Inflated claims about significance, legacy, or broader trends.",
		weight: 4,
		detect(text) {
			const results = [];
			for (const regex of SIGNIFICANCE_PHRASES) {
				results.push(
					...findMatches(
						text,
						regex,
						"Remove inflated significance claim. State concrete facts.",
						"high",
					),
				);
			}
			return results;
		},
	},
	{
		id: 2,
		name: "Notability name-dropping",
		category: "content",
		description:
			"Listing media outlets to claim notability without specific claims.",
		weight: 3,
		detect(text) {
			const mediaList =
				/\b(cited|featured|covered|mentioned|reported|published|recognized|highlighted) (in|by) .{0,20}(The New York Times|BBC|CNN|The Washington Post|The Guardian|Wired|Forbes|Reuters|Bloomberg|Financial Times|The Verge|TechCrunch|The Hindu|Al Jazeera|Time|Newsweek|The Economist|Nature|Science).{0,100}(,\s*(and\s+)?(The New York Times|BBC|CNN|The Washington Post|The Guardian|Wired|Forbes|Reuters|Bloomberg|Financial Times|The Verge|TechCrunch|The Hindu|Al Jazeera|Time|Newsweek|The Economist|Nature|Science))+/gi;
			const results = findMatches(
				text,
				mediaList,
				"Cite one specific claim from one source.",
				"high",
			);
			results.push(
				...findMatches(
					text,
					/\bactive social media presence\b/gi,
					"Not meaningful without context.",
					"high",
				),
			);
			results.push(
				...findMatches(
					text,
					/\bhas been (featured|recognized|acknowledged) (by|in)\b/gi,
					"Cite specific feature.",
					"medium",
				),
			);
			return results;
		},
	},
	{
		id: 3,
		name: "Superficial -ing analyses",
		category: "content",
		description:
			'Tacking "-ing" participial phrases onto sentences to fake depth.',
		weight: 4,
		detect(text) {
			const ingPhrases =
				/,\s*(highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|contributing to|cultivating|fostering|encompassing|showcasing|demonstrating|illustrating|representing|signaling|indicating|solidifying|reinforcing|cementing|bolstering|reaffirming|illuminating|epitomizing)\b[^.]{5,}/gi;
			return findMatches(
				text,
				ingPhrases,
				"Remove trailing -ing phrase. Give its own sentence.",
				"high",
			);
		},
	},
	{
		id: 4,
		name: "Promotional language",
		category: "content",
		description: "Ad-copy language like tourism brochure or press release.",
		weight: 3,
		detect(text) {
			const results = [];
			for (const regex of PROMOTIONAL_WORDS) {
				results.push(
					...findMatches(
						text,
						regex,
						"Replace promotional language with factual description.",
						"high",
					),
				);
			}
			return results;
		},
	},
	{
		id: 5,
		name: "Vague attributions",
		category: "content",
		description: "Claims attributed to unnamed experts or vague authorities.",
		weight: 4,
		detect(text) {
			const results = [];
			for (const regex of VAGUE_ATTRIBUTION) {
				results.push(
					...findMatches(
						text,
						regex,
						"Name the specific source or remove the claim.",
						"high",
					),
				);
			}
			return results;
		},
	},
	{
		id: 6,
		name: "Formulaic challenges",
		category: "content",
		description: '"Despite challenges... continues to thrive" boilerplate.',
		weight: 3,
		detect(text) {
			const results = [];
			for (const regex of CHALLENGES_PHRASES) {
				results.push(
					...findMatches(
						text,
						regex,
						"Replace with specific challenges and outcomes.",
						"high",
					),
				);
			}
			return results;
		},
	},

	// ── LANGUAGE (7-12) ─────────────────────────────────
	{
		id: 7,
		name: "AI vocabulary",
		category: "language",
		description: "Overused AI vocabulary across 3 tiers. 500+ tracked terms.",
		weight: 5,
		detect(text) {
			const results = [];
			const words = wordCount(text);

			results.push(...scanWordList(text, TIER_1, "Tier 1 AI word", "high"));
			const tier2Matches = scanWordList(
				text,
				TIER_2,
				"Tier 2 AI word",
				"medium",
			);
			if (tier2Matches.length >= 2) results.push(...tier2Matches);

			if (words > 50) {
				const tier3Count = TIER_3.reduce(
					(count, word) => count + countMatches(text, wordRegex(word)),
					0,
				);
				if (tier3Count / words > 0.03) {
					results.push(
						...scanWordList(
							text,
							TIER_3,
							"Tier 3 AI word (high density)",
							"low",
						),
					);
				}
			}

			results.push(...scanPhrases(text, AI_PHRASES));
			return results;
		},
	},
	{
		id: 8,
		name: "Copula avoidance",
		category: "language",
		description: '"Serves as", "boasts" instead of "is", "has".',
		weight: 3,
		detect(text) {
			const results = [];
			for (const regex of COPULA_AVOIDANCE) {
				results.push(
					...findMatches(
						text,
						regex,
						'Use simple "is", "are", or "has".',
						"high",
					),
				);
			}
			return results;
		},
	},
	{
		id: 9,
		name: "Negative parallelisms",
		category: "language",
		description: '"Not just X, but Y" constructions overused by LLMs.',
		weight: 3,
		detect(text) {
			const negParallel =
				/\b(it'?s|this is) not (just|merely|only|simply) .{3,60}(,|;|—)\s*(it'?s|this is|but)\b/gi;
			const notOnly = /\bnot only .{3,60} but (also )?\b/gi;
			return [
				...findMatches(
					text,
					negParallel,
					'State what it IS, not what it "isn\'t".',
					"high",
				),
				...findMatches(
					text,
					notOnly,
					'Simplify. Remove "not only...but also".',
					"medium",
				),
			];
		},
	},
	{
		id: 10,
		name: "Rule of three",
		category: "language",
		description: "Ideas forced into groups of three. LLMs love triads.",
		weight: 2,
		detect(text) {
			const buzzyTriad =
				/\b(\w+tion|\w+ity|\w+ment|\w+ness|\w+ance|\w+ence),\s+(\w+tion|\w+ity|\w+ment|\w+ness|\w+ance|\w+ence),\s+and\s+(\w+tion|\w+ity|\w+ment|\w+ness|\w+ance|\w+ence)\b/gi;
			return findMatches(
				text,
				buzzyTriad,
				"Rule of three with abstract nouns. Pick one or two that matter.",
				"medium",
			);
		},
	},
	{
		id: 11,
		name: "Synonym cycling",
		category: "language",
		description: "Different names for same thing in consecutive sentences.",
		weight: 2,
		detect(text) {
			const results = [];
			const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
			const synonymSets = [
				[
					"protagonist",
					"main character",
					"central figure",
					"hero",
					"lead character",
				],
				[
					"company",
					"firm",
					"organization",
					"enterprise",
					"corporation",
					"establishment",
					"entity",
				],
				["problem", "challenge", "issue", "obstacle", "hurdle", "difficulty"],
				[
					"solution",
					"approach",
					"methodology",
					"framework",
					"strategy",
					"paradigm",
				],
				["tool", "instrument", "mechanism", "apparatus", "device", "utility"],
				["city", "metropolis", "urban center", "municipality", "township"],
			];
			for (const synonyms of synonymSets) {
				for (let i = 0; i < sentences.length - 1; i++) {
					const found = [];
					for (let j = i; j < Math.min(i + 4, sentences.length); j++) {
						const lower = sentences[j].toLowerCase();
						for (const syn of synonyms) {
							if (lower.includes(syn) && !found.includes(syn)) found.push(syn);
						}
					}
					if (found.length >= 3) {
						results.push({
							match: `Synonym cycling: ${found.join(" → ")}`,
							index: text.indexOf(sentences[i]),
							line: text.substring(0, text.indexOf(sentences[i])).split("\n")
								.length,
							column: 1,
							suggestion: `Pick one term. Found "${found.join('", "')}" used as synonyms.`,
							confidence: "medium",
						});
						break;
					}
				}
			}
			return results;
		},
	},
	{
		id: 12,
		name: "False ranges",
		category: "language",
		description: '"From X to Y" where X and Y are on different scales.',
		weight: 2,
		detect(text) {
			const abstractRange =
				/\bfrom (the )?(dawn|birth|inception|beginning|advent|emergence|rise|earliest) .{3,60} to (the )?(modern|current|present|contemporary|latest|cutting-edge|digital|future)/gi;
			return findMatches(
				text,
				abstractRange,
				"Unnecessarily broad range. Be specific.",
				"medium",
			);
		},
	},

	// ── STYLE (13-18) ──────────────────────────────────
	{
		id: 13,
		name: "Em dash overuse",
		category: "style",
		description: "LLMs overuse em dashes as a crutch for punchy writing.",
		weight: 2,
		detect(text) {
			const emDashes = text.match(/—/g) || [];
			const words = wordCount(text);
			if (
				words > 0 &&
				emDashes.length / (words / 100) > 1.0 &&
				emDashes.length >= 2
			) {
				return findMatches(
					text,
					/—/g,
					`High em dash density (${emDashes.length} in ${words} words). Replace most with commas, periods.`,
					"medium",
				);
			}
			return [];
		},
	},
	{
		id: 14,
		name: "Boldface overuse",
		category: "style",
		description: "Mechanical emphasis with **bold**.",
		weight: 2,
		detect(text) {
			const boldMatches = text.match(/\*\*[^*]+\*\*/g) || [];
			if (boldMatches.length >= 3) {
				return findMatches(
					text,
					/\*\*[^*]+\*\*/g,
					"Excessive boldface. Let writing carry the weight.",
					"medium",
				);
			}
			return [];
		},
	},
	{
		id: 15,
		name: "Inline-header lists",
		category: "style",
		description: "List items starting with **bold header:**.",
		weight: 3,
		detect(text) {
			const inlineHeaders = /^[*-]\s+\*\*[^*]+:\*\*\s/gm;
			return (text.match(inlineHeaders) || []).length >= 2
				? findMatches(
						text,
						inlineHeaders,
						"Convert to paragraph or simpler list.",
						"high",
					)
				: [];
		},
	},
	{
		id: 16,
		name: "Title Case headings",
		category: "style",
		description: "Capitalizing Every Main Word In Headings.",
		weight: 1,
		detect(text) {
			const results = [];
			let m;
			while ((m = /^#{1,6}\s+(.+)$/gm.exec(text)) !== null) {
				const heading = m[1].trim();
				const words = heading.split(/\s+/);
				if (words.length >= 3) {
					const skipWords =
						/^(I|AI|API|CLI|URL|HTML|CSS|JS|TS|NPM|NYC|USA|UK|EU|LLM|GPT|SaaS|IoT|CEO|CTO|VP|PR|HR|IT|UI|UX)\b/;
					const capped = words.filter(
						(w) => /^[A-Z]/.test(w) && !skipWords.test(w),
					).length;
					if (capped / words.length > 0.7) {
						results.push({
							match: m[0],
							index: m.index,
							line: text.substring(0, m.index).split("\n").length,
							column: 1,
							suggestion:
								"Use sentence case (only first word and proper nouns capitalized).",
							confidence: "medium",
						});
					}
				}
			}
			return results;
		},
	},
	{
		id: 17,
		name: "Emoji overuse",
		category: "style",
		description: "Decorative emojis in professional/technical text.",
		weight: 2,
		detect(text) {
			const emojiCount = countMatches(
				text,
				/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu,
			);
			return emojiCount >= 3
				? findMatches(
						text,
						/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu,
						"Remove emoji decoration from professional text.",
						"high",
					)
				: [];
		},
	},
	{
		id: 18,
		name: "Curly quotes",
		category: "style",
		description: "Unicode curly quotes instead of straight quotes.",
		weight: 1,
		detect(text) {
			return findMatches(
				text,
				/[\u201C\u201D\u2018\u2019]/g,
				"Replace curly quotes with straight quotes.",
				"high",
			);
		},
	},

	// ── COMMUNICATION (19-21) ──────────────────────────
	{
		id: 19,
		name: "Chatbot artifacts",
		category: "communication",
		description: '"I hope this helps!", "Here is an overview"...',
		weight: 5,
		detect(text) {
			return scanPhrases(
				text,
				AI_PHRASES.filter((p) => p.fix === "(remove)"),
			);
		},
	},
	{
		id: 20,
		name: "Cutoff disclaimers",
		category: "communication",
		description: "Knowledge-cutoff disclaimers left in text.",
		weight: 4,
		detect(text) {
			return scanPhrases(
				text,
				AI_PHRASES.filter(
					(p) =>
						p.fix === "(remove)" &&
						(p.pattern.source.includes("training") ||
							p.pattern.source.includes("details are")),
				),
			);
		},
	},
	{
		id: 21,
		name: "Sycophantic tone",
		category: "communication",
		description: '"Great question!", "You\'re absolutely right!"',
		weight: 4,
		detect(text) {
			return scanPhrases(
				text,
				AI_PHRASES.filter(
					(p) =>
						p.fix &&
						p.fix.includes("remove") &&
						(p.pattern.source.includes("question") ||
							p.pattern.source.includes("right") ||
							p.pattern.source.includes("point")),
				),
			);
		},
	},

	// ── FILLER (22-24) ──────────────────────────────────
	{
		id: 22,
		name: "Filler phrases",
		category: "filler",
		description: 'Wordy filler: "in order to" → "to".',
		weight: 3,
		detect(text) {
			return scanPhrases(
				text,
				AI_PHRASES.filter(
					(p) =>
						p.fix &&
						!p.fix.startsWith("(") &&
						[
							"to",
							"because",
							"now",
							"if",
							"can",
							"to / for",
							"first",
							"finally",
							"for / regarding",
							"because / since",
						].includes(p.fix),
				),
			);
		},
	},
	{
		id: 23,
		name: "Excessive hedging",
		category: "filler",
		description: '"could potentially possibly", "might arguably perhaps".',
		weight: 3,
		detect(text) {
			return scanPhrases(
				text,
				AI_PHRASES.filter(
					(p) =>
						p.fix &&
						["could", "might", "may", "perhaps", "maybe"].some((w) =>
							p.fix.includes(w),
						),
				),
			);
		},
	},
	{
		id: 24,
		name: "Generic conclusions",
		category: "filler",
		description: '"The future looks bright", "Exciting times ahead".',
		weight: 3,
		detect(text) {
			return scanPhrases(
				text,
				AI_PHRASES.filter(
					(p) =>
						p.fix &&
						(p.fix.includes("specific") ||
							p.fix.includes("concrete") ||
							p.fix.includes("cite") ||
							p.fix.includes("what you know")),
				),
			);
		},
	},

	// ── EXTRA (25-29) ───────────────────────────────────
	{
		id: 25,
		name: "Reasoning chain artifacts",
		category: "communication",
		description: 'Exposed chain-of-thought: "Let me think...", "Step 1:".',
		weight: 4,
		detect(text) {
			const patterns = [
				/\blet me think( about this| through this| step by step)?\b/gi,
				/\blet's (think|reason|work) (about|through|this out)\b/gi,
				/\bbreaking (this|it) down\b/gi,
				/\bstep ([1-9]|one|two|three|four|five):/gi,
				/\bfirst,? let'?s consider\b/gi,
				/\bhere'?s my (thought process|reasoning|thinking)\b/gi,
			];
			const results = [];
			for (const regex of patterns) {
				results.push(
					...findMatches(
						text,
						regex,
						"Remove reasoning scaffolding. Just answer.",
						"high",
					),
				);
			}
			return results;
		},
	},
	{
		id: 26,
		name: "Excessive structure",
		category: "style",
		description: "Too many headers/bullets for simple content.",
		weight: 3,
		detect(text) {
			const words = wordCount(text);
			const headers = (text.match(/^#{1,6}\s+.+$/gm) || []).length;
			const bullets = (text.match(/^[\s]*[-*+]\s+/gm) || []).length;
			const numbered = (text.match(/^[\s]*\d+\.\s+/gm) || []).length;
			const results = [];

			if (words < 300 && headers >= 3) {
				results.push({
					match: `${headers} headers in ${words} words`,
					index: 0,
					line: 1,
					column: 1,
					suggestion: "Too many headers for short content. Use prose.",
					confidence: "medium",
				});
			}
			if (words < 200 && bullets + numbered >= 8) {
				results.push({
					match: `${bullets + numbered} list items in ${words} words`,
					index: 0,
					line: 1,
					column: 1,
					suggestion: "Excessive lists. Could use paragraphs?",
					confidence: "medium",
				});
			}

			const structureHeaders =
				/^#+\s*(overview|key (points|takeaways)|summary|conclusion|introduction|background)\s*:?\s*$/gim;
			results.push(
				...findMatches(
					text,
					structureHeaders,
					"Formulaic structure. Let content flow naturally.",
					"medium",
				),
			);
			return results;
		},
	},
	{
		id: 27,
		name: "Confidence calibration",
		category: "communication",
		description: '"I\'m confident that...", "It\'s worth noting..."',
		weight: 3,
		detect(text) {
			const patterns = [
				{
					regex: /\bI'?m confident (that|in)\b/gi,
					fix: "State fact without prefacing confidence",
				},
				{
					regex: /\bit'?s worth (noting|mentioning|pointing out) that\b/gi,
					fix: "Just say it",
				},
				{ regex: /\binterestingly (enough)?,?\b/gi, fix: "Let reader decide" },
				{ regex: /\bsurprisingly,?\s/gi, fix: "Surprise is implied" },
				{ regex: /\bimportantly,?\s/gi, fix: "Reader judges importance" },
				{ regex: /\bnotably,?\s/gi, fix: "Just state the notable thing" },
				{ regex: /\bundoubtedly,?\s/gi, fix: "Cite evidence or remove" },
			];
			const results = [];
			for (const { regex, fix } of patterns)
				results.push(...findMatches(text, regex, fix));
			return results;
		},
	},
	{
		id: 28,
		name: "Acknowledgment loops",
		category: "communication",
		description: "Restating question before answering.",
		weight: 4,
		detect(text) {
			const patterns = [
				/\byou'?re asking (about|whether|if|how|why|what)\b/gi,
				/\bthe question of (whether|how|why|what)\b/gi,
				/\bto (answer|address) your question\b/gi,
				/\byour question (about|regarding|concerning)\b/gi,
				/\bthat'?s a (great|good|interesting) question\. (the|it|so)\b/gi,
				/\bI understand you'?re (asking|wondering|curious)\b/gi,
			];
			const results = [];
			for (const regex of patterns)
				results.push(
					...findMatches(
						text,
						regex,
						"Just answer. Don't restate the question.",
						"high",
					),
				);
			return results;
		},
	},
	{
		id: 29,
		name: "Invisible unicode obfuscation",
		category: "style",
		description: "Zero-width chars, soft hyphens used to evade detectors.",
		weight: 4,
		detect(text) {
			const hidden = /(?:\u200B|\u200C|\u200D|\u2060|\uFEFF|\u00AD)/g;
			const results = findMatches(
				text,
				hidden,
				"Remove hidden unicode characters.",
				"high",
			);
			const nbspMatches = findMatches(
				text,
				/(?:\u00A0|\u202F)/g,
				"Replace non-breaking with regular spaces.",
				"medium",
			);
			if (nbspMatches.length >= 2) results.push(...nbspMatches);
			return results;
		},
	},
];

// ─── Phrase Scanner ─────────────────────────────────────

function scanPhrases(text, phrases) {
	const results = [];
	for (const { pattern, fix } of phrases) {
		const matches = findMatches(
			text,
			pattern,
			fix.startsWith("(") ? fix : `Replace with: ${fix}`,
		);
		results.push(...matches);
	}
	return results;
}

// ─── Exports ─────────────────────────────────────────────

module.exports = {
	patterns,
	findMatches,
	countMatches,
	wordCount,
	scanWordList,
	scanPhrases,
};
