/**
 * preprocess.js — Text preprocessing.
 *
 * Masks code blocks and quoted sections while preserving line numbers.
 */

const NON_NEWLINE = /[^\n]/g;
const FENCED_CODE_BLOCKS = /```[\s\S]*?```|~~~[\s\S]*?~~~/g;
const INLINE_CODE_SPANS = /`[^`\n]+`/g;
const MARKDOWN_BLOCKQUOTE_LINES = /^[ \t]*>.*$/gm;

function maskSnippet(snippet) {
	return snippet.replace(NON_NEWLINE, " ");
}

function prepareText(text, opts = {}) {
	if (!text || typeof text !== "string") return "";
	const { ignoreCode = false, ignoreQuotes = false } = opts;
	let processed = text;

	if (ignoreCode) {
		processed = processed.replace(FENCED_CODE_BLOCKS, (m) => maskSnippet(m));
		processed = processed.replace(INLINE_CODE_SPANS, (m) => maskSnippet(m));
	}
	if (ignoreQuotes) {
		processed = processed.replace(MARKDOWN_BLOCKQUOTE_LINES, (m) =>
			maskSnippet(m),
		);
	}

	return processed;
}

module.exports = { prepareText };
