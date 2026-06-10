---
name: lz-create-youtube-abstracts
description: Create academic abstract or summary from YouTube video transcript(s). Use when user asks to summarize YouTube videos, create abstract from video, make summary of Dicoding ILT/video content, or generate Bahasa Indonesia abstract from video source.
---

# lz-create-youtube-abstracts

Extract transcript from YouTube videos, merge overlapping content, write structured abstract in Bahasa Indonesia (min 500 words).

## When to Use

User mentions: abstract dari video YouTube, summary video, rangkuman YouTube, transkrip jadi abstrak, transcript to abstract, ILT summary.

## Workflow

```
[1] Fetch transcripts ──> [2] Merge & dedup ──> [3] Compile content ──> [4] Write draft (≥500 kata)
```

## Quick Start

1. **Fetch**: Run `python3.14 scripts/get_transcript.py <VIDEO_ID> [VIDEO_ID2 ...]`
   - Install dep: `pip install --break-system-packages youtube-transcript-api`
   - Auto-saves to `/tmp/transcript_{id}.txt` and `_plain.txt`

2. **Merge**: Use `scripts/merge_transcripts.py` to combine parts, auto-detect & remove overlap

3. **Read & analyze**: Read merged transcript. Extract key topics, sections, speaker stories.

4. **Write abstract**:
   - Minimum 500 kata Bahasa Indonesia
   - Cover: opening context, main topics, key concepts, practical examples, speaker stories
   - Use narrative flow, not bullet-list structure

## Abstract Structure Template

```
# Abstrak [JUDUL] [TOPIC]

Opening hook (pertanyaan retoris / scene dari sesi)

Body paragraphs:
  - Konteks sesi & topik utama
  - Konsep kunci (dijelaskan natural, bukan daftar)
  - Contoh praktis / studi kasus
  - Cerita pembicara / pengalaman pribadi
  - Interaksi peserta (jika ada)
  - Closing message / kesimpulan alami
```

## References

- **Detailed workflow**: See [references/workflow.md](references/workflow.md)
- **Scripts**: Use `scripts/get_transcript.py` and `scripts/merge_transcripts.py`
