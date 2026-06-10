# Detailed Workflow

## Step 1: Fetch Transcripts

Use `youtube-transcript-api`. The new API (≥1.2.0) uses instance method, not class method:

```python
from youtube_transcript_api import YouTubeTranscriptApi
api = YouTubeTranscriptApi()
transcript = api.fetch(video_id, languages=['id', 'en'])
# transcript.snippets is list of FetchedTranscriptSnippet
# each snippet has .text, .start, .duration
```

**Install**: `pip install --break-system-packages youtube-transcript-api`
Ensure `yt-dlp` is installed for fallback support.

**Troubleshooting**:
- "Private video" → user must make it unlisted or provide cookies
- No Indonesian subs → fallback to English with `languages=['id', 'en']`
- Manual subtitles disabled → script automatically falls back to `yt-dlp --write-auto-subs --sub-langs id,en --sub-format json3`

## Step 2: Merge & Remove Overlap

When 2+ videos share overlapping content, detect the overlap by normalizing text (lowercase, remove filler words like `eh/ee/e/ah`), then find longest suffix-prefix word match.

Use `scripts/merge_transcripts.py`.

## Step 3: Analyze Transcript

Read full merged text. Extract:

1. **Session context** — title, purpose, structure
2. **Key concepts** — models, frameworks, definitions (e.g., 7 Cs, communication forms)
3. **Practical examples** — case studies, real scenarios
4. **Speaker stories** — personal experiences shared
5. **Participant interaction** — Q&A, live practice
6. **Closing message** — key takeaways

## Step 4: Write Abstract

Target: **≥500 words** Bahasa Indonesia.

**Do**:
- Open with engaging hook (scene, question, relatable moment)
- Write in narrative flow — like telling someone what happened
- Use `Kak [nama]` for speaker introduction, `beliau` for subsequent references
- Include specific details (names, percentages, concrete examples)
- End naturally with closing scene or Q&A wrap

**Don't**:
- Don't use numbered/bullet lists in body (keep only for short enumeration)
- Don't start paragraphs with "Selain itu", "Lebih lanjut"
- Don't end with generic positive conclusion ("relevan untuk masa depan")
- Don't pad with filler — every sentence carries meaning
