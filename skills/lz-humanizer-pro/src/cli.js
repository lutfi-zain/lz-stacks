#!/usr/bin/env node

/**
 * cli.js — Bilingual CLI for lz-humanizer-pro.
 *
 * Usage:
 *   lz-humanizer analyze <file>        # Full analysis
 *   lz-humanizer score <file>          # Just score
 *   lz-humanizer humanize <file>       # Suggestions + optional auto-fix
 *   lz-humanizer suggest <file>        # Issues by priority
 *   lz-humanizer stats <file>          # Statistical analysis
 *   lz-humanizer scan <dir>            # Batch scan directory
 *
 * Options:
 *   --lang en|id      Force language (default: auto-detect)
 *   --json            JSON output
 *   --autofix         Apply safe fixes
 *   --verbose, -v     Show all matches
 *   --ignore-code     Skip code blocks
 *   --ignore-quotes   Skip quoted blocks
 *   -f <file>         Read from file
 */

const fs = require("fs");
const path = require("path");
const { analyze, score, formatReport, formatJSON } = require("./analyzer");
const { humanize, formatSuggestions } = require("./humanizer");
const { humanizeId, formatSuggestionsId } = require("./humanizer-id");
const { computeStats } = require("./stats");
const { detectLanguage } = require("./language");

// ─── Color Helpers ───────────────────────────────────────

const color =
	process.stdout.isTTY && !process.env.NO_COLOR
		? {
				red: (s) => `\x1b[31m${s}\x1b[0m`,
				green: (s) => `\x1b[32m${s}\x1b[0m`,
				yellow: (s) => `\x1b[33m${s}\x1b[0m`,
				cyan: (s) => `\x1b[36m${s}\x1b[0m`,
				gray: (s) => `\x1b[90m${s}\x1b[0m`,
				bold: (s) => `\x1b[1m${s}\x1b[0m`,
				dim: (s) => `\x1b[2m${s}\x1b[0m`,
			}
		: {
				red: (s) => s,
				green: (s) => s,
				yellow: (s) => s,
				cyan: (s) => s,
				gray: (s) => s,
				bold: (s) => s,
				dim: (s) => s,
			};

function scoreBadge(s) {
	if (s <= 25) return color.green(`\u{1F7E2} ${s}/100`);
	if (s <= 50) return color.yellow(`\u{1F7E1} ${s}/100`);
	if (s <= 75)
		return color.magenta ? `\u{1F7E0} ${s}/100` : `\u{1F7E0} ${s}/100`;
	return color.red(`\u{1F534} ${s}/100`);
}

// ─── Parse Args ─────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];

const flags = {};
flags.json = args.includes("--json");
flags.verbose = args.includes("--verbose") || args.includes("-v");
flags.autofix = args.includes("--autofix");
flags.help = args.includes("--help") || args.includes("-h");
flags.ignoreCode = args.includes("--ignore-code");
flags.ignoreQuotes = args.includes("--ignore-quotes");

// --lang
const langIdx = args.indexOf("--lang");
if (langIdx !== -1 && args[langIdx + 1]) {
	const l = args[langIdx + 1].toLowerCase();
	flags.lang = l === "id" ? "id" : "en";
}

// -f / --file
const fileIdx =
	args.indexOf("-f") !== -1 ? args.indexOf("-f") : args.indexOf("--file");
if (fileIdx !== -1 && args[fileIdx + 1]) flags.file = args[fileIdx + 1];

// Positional file
if (!flags.file && args[1] && !args[1].startsWith("-")) {
	const commands = ["analyze", "score", "humanize", "suggest", "stats", "scan"];
	if (!commands.includes(args[1])) flags.file = args[1];
}

// ─── Help ─────────────────────────────────────────────────

function showHelp() {
	console.log(`
${color.bold("lz-humanizer-pro")} — Bilingual AI Text Humanizer (EN + ID)

${color.bold("Usage:")}
  lz-humanizer <command> [file] [options]

${color.bold("Commands:")}
  ${color.cyan("analyze")}      Full analysis with pattern matches
  ${color.cyan("score")}        Quick score (0-100)
  ${color.cyan("humanize")}     Rewrite suggestions (with --autofix)
  ${color.cyan("suggest")}      Issues grouped by priority
  ${color.cyan("stats")}        Statistical analysis only
  ${color.cyan("scan")}         Batch scan directory

${color.bold("Options:")}
  --lang en|id        Force language (auto-detect default)
  --json              JSON output
  --verbose, -v       Show all matches
  --autofix           Apply safe mechanical fixes
  --ignore-code       Skip code blocks
  --ignore-quotes     Skip quoted blocks
  -f, --file <path>   Read from file (else stdin)
  --help, -h          Show this

${color.bold("Examples:")}
  echo "Your text" | lz-humanizer score
  lz-humanizer analyze article.txt --lang id
  lz-humanizer humanize --autofix -f draft.md --lang id
  lz-humanizer scan docs --ext md
`);
}

// ─── Read Input ──────────────────────────────────────────

function readInput() {
	return new Promise((resolve, reject) => {
		if (flags.file) {
			try {
				resolve(fs.readFileSync(flags.file, "utf-8"));
			} catch (err) {
				reject(new Error(`Can't read file: ${flags.file} (${err.message})`));
			}
			return;
		}
		if (process.stdin.isTTY) {
			reject(
				new Error(
					"No input. Pipe text or use -f <file>. Run --help for usage.",
				),
			);
			return;
		}
		let data = "";
		process.stdin.setEncoding("utf-8");
		process.stdin.on("data", (chunk) => {
			data += chunk;
		});
		process.stdin.on("end", () => resolve(data));
	});
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
	if (flags.help || !command) {
		showHelp();
		process.exit(command ? 0 : 1);
	}

	const textCommands = ["analyze", "score", "humanize", "suggest", "stats"];
	let text = null;

	if (textCommands.includes(command)) {
		try {
			text = await readInput();
		} catch (err) {
			console.error(color.red(`Error: ${err.message}`));
			process.exit(1);
		}
		if (!text.trim()) {
			console.error(color.red("Error: Empty input."));
			process.exit(1);
		}
	}

	const opts = {
		verbose: flags.verbose,
		ignoreCode: flags.ignoreCode,
		ignoreQuotes: flags.ignoreQuotes,
		lang: flags.lang || null,
	};

	switch (command) {
		case "analyze": {
			const result = analyze(text, opts);
			if (flags.json) console.log(formatJSON(result));
			else console.log(formatReport(result));
			break;
		}

		case "score": {
			const s = score(text, opts);
			if (flags.json) console.log(JSON.stringify({ score: s }));
			else console.log(scoreBadge(s));
			break;
		}

		case "humanize": {
			const lang = flags.lang || detectLanguage(text);
			if (lang === "id") {
				const result = humanizeId(text, {
					autofix: flags.autofix,
					ignoreCode: flags.ignoreCode,
					ignoreQuotes: flags.ignoreQuotes,
				});
				if (flags.json) console.log(JSON.stringify(result, null, 2));
				else console.log(formatSuggestionsId(result));
			} else {
				const result = humanize(text, {
					autofix: flags.autofix,
					ignoreCode: flags.ignoreCode,
					ignoreQuotes: flags.ignoreQuotes,
				});
				if (flags.json) console.log(JSON.stringify(result, null, 2));
				else console.log(formatSuggestions(result));
			}
			break;
		}

		case "suggest": {
			const lang = flags.lang || detectLanguage(text);
			const result = humanize(text, {
				lang,
				ignoreCode: flags.ignoreCode,
				ignoreQuotes: flags.ignoreQuotes,
			});
			if (flags.json) console.log(JSON.stringify(result, null, 2));
			else console.log(formatSuggestions(result));
			break;
		}

		case "stats": {
			const lang = flags.lang || detectLanguage(text);
			const s = computeStats(text, lang);
			if (flags.json) console.log(JSON.stringify(s, null, 2));
			else {
				console.log("");
				console.log("── Text Statistics ──────────────────────────────");
				console.log(`  Language: ${lang === "id" ? "Indonesian" : "English"}`);
				console.log(
					`  Words: ${s.wordCount}  |  Unique: ${s.uniqueWordCount}  |  TTR: ${s.typeTokenRatio}  |  MATTR: ${s.mattr}`,
				);
				console.log(
					`  Sentences: ${s.sentenceCount}  |  Avg: ${s.avgSentenceLength}w  |  σ: ${s.sentenceLengthStdDev}`,
				);
				console.log(
					`  Burstiness: ${s.burstiness}  |  Hapax: ${s.hapaxRatio}  |  Trigram rep: ${s.trigramRepetition}`,
				);
				console.log(
					`  Paragraphs: ${s.paragraphCount}  |  Conjunction start: ${(s.conjunctionStartRatio * 100).toFixed(1)}%`,
				);
				console.log(
					`  1st-person /100w: ${s.firstPersonDensity.toFixed(1)}  |  ?!/100w: ${s.punctDensity.toFixed(1)}`,
				);
				console.log(`  Readability: ${s.readability}`);
				console.log("");
			}
			break;
		}

		case "scan": {
			const target = flags.file || ".";
			const exts = [".md", ".txt", ".rst", ".html", ".adoc"];
			console.log(color.bold(`\nScanning: ${target}`));
			console.log(color.dim("─".repeat(40)));
			const files = [];
			walkDir(target, exts, files);
			files.sort();
			for (const f of files) {
				try {
					const content = fs.readFileSync(f, "utf-8");
					const s = score(content, { lang: flags.lang || null });
					console.log(`  ${scoreBadge(s)}  ${f}`);
				} catch {
					/* skip unreadable */
				}
			}
			console.log("");
			break;
		}

		default:
			console.error(color.red(`Unknown command: ${command}`));
			process.exit(1);
	}
}

// ─── Walk Dir ────────────────────────────────────────────

function walkDir(dir, exts, files, depth = 0) {
	if (depth > 8) return;
	const ignoreDirs = new Set([
		"node_modules",
		".git",
		"dist",
		"build",
		".next",
		"__pycache__",
		"vendor",
	]);
	try {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const e of entries) {
			const full = path.join(dir, e.name);
			if (e.isDirectory()) {
				if (!ignoreDirs.has(e.name)) walkDir(full, exts, files, depth + 1);
			} else if (
				e.isFile() &&
				exts.includes(path.extname(e.name).toLowerCase())
			) {
				files.push(full);
			}
		}
	} catch {
		/* skip inaccessible */
	}
}

main().catch((err) => {
	console.error(color.red(`Fatal: ${err.message}`));
	process.exit(1);
});
