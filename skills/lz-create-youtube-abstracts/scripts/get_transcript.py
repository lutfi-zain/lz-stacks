#!/usr/bin/env python3.14
"""
Fetch YouTube transcript(s) and save to /tmp/transcript_{id}.txt (with timestamps)
and /tmp/transcript_{id}_plain.txt (plain text).

Usage:
    python3.14 scripts/get_transcript.py VIDEO_ID [VIDEO_ID2 ...]

Install dep:
    pip install --break-system-packages youtube-transcript-api
"""

import sys
import os
from youtube_transcript_api import YouTubeTranscriptApi

def fetch_one(video_id):
    api = YouTubeTranscriptApi()
    transcript = api.fetch(video_id, languages=['id', 'en'])
    
    # With timestamps
    with open(f'/tmp/transcript_{video_id}.txt', 'w') as f:
        for snippet in transcript.snippets:
            f.write(f"[{snippet.start:.1f}s] {snippet.text}\n")
    
    # Plain text
    texts = " ".join(s.text for s in transcript.snippets)
    with open(f'/tmp/transcript_{video_id}_plain.txt', 'w') as f:
        f.write(texts)
    
    return len(transcript.snippets), len(texts.split())

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3.14 get_transcript.py VIDEO_ID [VIDEO_ID2 ...]")
        sys.exit(1)
    
    for vid in sys.argv[1:]:
        try:
            lines, words = fetch_one(vid)
            print(f"OK {vid}: {lines} lines, {words} words")
        except Exception as e:
            print(f"FAIL {vid}: {type(e).__name__}: {e}")
