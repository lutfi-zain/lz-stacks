#!/usr/bin/env python3.14
"""
Fetch YouTube transcript(s) and save to /tmp/transcript_{id}.txt (with timestamps)
and /tmp/transcript_{id}_plain.txt (plain text).

Usage:
    python3.14 scripts/get_transcript.py VIDEO_ID [VIDEO_ID2 ...]

Install dep:
    pip install --break-system-packages youtube-transcript-api
    yt-dlp must be installed and in PATH
"""

import sys
import os
import subprocess
import glob
import json
from youtube_transcript_api import YouTubeTranscriptApi

def fetch_fallback(video_id):
    url = f"https://www.youtube.com/watch?v={video_id}"
    cmd = [
        "yt-dlp",
        "--write-auto-subs",
        "--sub-langs", "id,en",
        "--skip-download",
        "--sub-format", "json3",
        "-o", f"/tmp/transcript_{video_id}",
        url
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"yt-dlp fallback failed: {res.stderr}")
    
    files = glob.glob(f"/tmp/transcript_{video_id}.*.json3")
    if not files:
        raise RuntimeError("No auto-subtitles downloaded by yt-dlp fallback")
    
    # Prioritize id over en if available
    sub_file = files[0]
    for f in files:
        if '.id.' in f:
            sub_file = f
            break

    with open(sub_file, 'r', encoding='utf-8') as f:
        sub_data = json.load(f)
        
    snippets = []
    for event in sub_data.get('events', []):
        if 'segs' in event:
            text = "".join(seg.get('utf8', '') for seg in event['segs']).replace('\n', ' ').strip()
            if text:
                start_ms = event.get('tStartMs', 0)
                snippets.append((start_ms / 1000.0, text))
                
    if not snippets:
        raise RuntimeError("Parsed subtitle JSON is empty")

    with open(f'/tmp/transcript_{video_id}.txt', 'w', encoding='utf-8') as f:
        for start, text in snippets:
            f.write(f"[{start:.1f}s] {text}\n")
            
    texts = " ".join(text for _, text in snippets)
    with open(f'/tmp/transcript_{video_id}_plain.txt', 'w', encoding='utf-8') as f:
        f.write(texts)
        
    return len(snippets), len(texts.split())

def fetch_one(video_id):
    try:
        api = YouTubeTranscriptApi()
        transcript = api.fetch(video_id, languages=['id', 'en'])
        
        # With timestamps
        with open(f'/tmp/transcript_{video_id}.txt', 'w', encoding='utf-8') as f:
            for snippet in transcript.snippets:
                text = snippet.text.replace('\n', ' ')
                f.write(f"[{snippet.start:.1f}s] {text}\n")
        
        # Plain text
        texts = " ".join(s.text.replace('\n', ' ') for s in transcript.snippets)
        with open(f'/tmp/transcript_{video_id}_plain.txt', 'w', encoding='utf-8') as f:
            f.write(texts)
        
        return len(transcript.snippets), len(texts.split())
    except Exception as e:
        print(f"youtube-transcript-api failed for {video_id}: {e}. Falling back to yt-dlp...")
        return fetch_fallback(video_id)

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
