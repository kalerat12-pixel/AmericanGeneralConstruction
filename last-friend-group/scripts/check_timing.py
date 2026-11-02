#!/usr/bin/env python3
"""
Check the dialogue timing slots against the actual voice clip lengths.
Warns when a clip runs into the next line or past the end of its scene.

Usage: python3 scripts/check_timing.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = json.load(open(os.path.join(ROOT, "src/config/dialogue.json")))
manifest = json.load(open(os.path.join(ROOT, "src/config/voice-manifest.json")))

problems = 0
total = 0.0
for scene in data["scenes"]:
    voiced = [l for l in scene["lines"] if not l.get("kind")]
    for i, line in enumerate(voiced):
        dur = manifest.get(line["id"], {}).get("duration")
        if dur is None:
            print(f"  [silent]  {line['id']}: no audio file (slot {line['hold']}s)")
            continue
        end = line["at"] + dur
        nxt = voiced[i + 1] if i + 1 < len(voiced) else None
        if nxt and end > nxt["at"]:
            problems += 1
            print(f"  OVERLAP   {line['id']} ends at {end:.2f}s but {nxt['id']} starts at {nxt['at']:.2f}s ({end - nxt['at']:.2f}s too long)")
        if end > scene["duration"]:
            problems += 1
            print(f"  OVERRUN   {line['id']} ends at {end:.2f}s, scene {scene['id']} is {scene['duration']}s")
    total += scene["duration"]
    print(f"{scene['id']} {scene['name']:<12} {scene['duration']:6.2f}s  {len(scene['lines'])} lines")
print(f"\nTotal runtime: {int(total // 60)}:{total % 60:05.2f}  ({problems} problem(s))")
