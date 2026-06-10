#!/usr/bin/env python3.14
"""
Merge 2+ YouTube transcript plain-text files, detect and remove overlap.

Overlap detection: normalize text (lowercase, strip punctuation, remove
filler words), find longest suffix-prefix match between file N and N+1.

Usage:
    python3.14 scripts/merge_transcripts.py /tmp/transcript_FILE1_plain.txt /tmp/transcript_FILE2_plain.txt [-o output.txt]

Default output: /tmp/transcript_merged.txt
"""

import sys
import re
import os

FILLERS = {'eh', 'ee', 'e', 'ah', 'oh', 'sih', 'deh', 'kok', 'loh',
           'nih', 'tuh', 'dong', 'kan', 'ya', 'yah', 'a', 'hah'}

def normalize(word):
    """Lowercase, strip punctuation, remove filler words."""
    w = word.lower().strip('.,!?;:"\'()[]{}')
    if w in FILLERS or not w:
        return ''
    return w

def word_overlap(words_a, words_b, min_match=10):
    """Find longest suffix of list A matching prefix of list B."""
    best_len = 0
    best_pos = len(words_a)
    for i in range(len(words_a) - 3, 0, -1):
        match = 0
        for j in range(min(len(words_a) - i, len(words_b))):
            na = normalize(words_a[i + j])
            nb = normalize(words_b[j])
            if na and nb and na == nb:
                match += 1
            else:
                break
        if match >= min_match and match > best_len:
            best_len = match
            best_pos = i
    return best_pos, best_len

def main():
    args = sys.argv[1:]
    files = [a for a in args if not a.startswith('-')]
    out = '/tmp/transcript_merged.txt'
    if '-o' in args:
        idx = args.index('-o')
        out = args[idx + 1]
    
    if len(files) < 1:
        print("Usage: merge_transcripts.py FILE1 [FILE2 ...] [-o output.txt]")
        sys.exit(1)
    
    # Read all files
    texts = []
    for f in files:
        with open(f) as fh:
            texts.append(fh.read().strip())
    
    # Merge sequentially with overlap detection
    merged = texts[0]
    total_words = len(merged.split())
    
    for i in range(1, len(texts)):
        curr_words = merged.split()
        next_words = texts[i].split()
        
        cut, overlap = word_overlap(curr_words, next_words)
        merged = " ".join(curr_words[:cut]) + " " + texts[i]
        total_words = len(merged.split())
        print(f"  + file {i+1}: overlap {overlap} words at pos {cut}, total {total_words} words")
    
    with open(out, 'w') as f:
        f.write(merged)
    
    print(f"Merged: {out} ({total_words} words)")

if __name__ == '__main__':
    main()
