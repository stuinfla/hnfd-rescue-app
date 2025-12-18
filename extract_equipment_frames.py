#!/usr/bin/env python3
"""
Extract frames at exact timestamps where equipment is mentioned in transcript
"""

import cv2
import os
import re

video_path = "Ambulance_training_data/Where Everything Is In The Ambulance.mp4"
srt_path = "video_analysis/audio/audio.srt"
output_dir = "public/images"

# Equipment keywords to search for (with output filenames)
equipment_keywords = {
    "lucas": "lucas_device",
    "trauma bag": "trauma_bag",
    "oxygen": "oxygen_kit",
    "AED|defibrillator": "aed",
    "drug box": "drug_box",
    "suction": "suction",
    "glucometer": "glucometer",
    "narcan": "narcan",
    "saline": "saline_bags",
    "primary set": "primary_sets",
    "lifepak": "lifepak",
    "intubation": "intubation_kit",
}

def parse_srt_timestamp(timestamp_str):
    """Convert SRT timestamp to seconds"""
    # Format: 00:27:18,360
    match = re.match(r'(\d+):(\d+):(\d+),(\d+)', timestamp_str)
    if match:
        hours, minutes, seconds, milliseconds = map(int, match.groups())
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000
    return 0

def find_equipment_timestamps(srt_path, equipment_keywords):
    """Find first mention timestamp for each equipment"""
    timestamps = {}

    with open(srt_path, 'r') as f:
        lines = f.readlines()

    current_timestamp = None
    for i, line in enumerate(lines):
        # Check if this is a timestamp line
        if '-->' in line:
            start_time = line.split('-->')[0].strip()
            current_timestamp = parse_srt_timestamp(start_time)

        # Check if this line mentions equipment
        line_lower = line.lower()
        for keyword, filename in equipment_keywords.items():
            if re.search(keyword, line_lower) and filename not in timestamps:
                timestamps[filename] = current_timestamp
                print(f"Found '{keyword}' at {current_timestamp:.2f}s ({int(current_timestamp//60)}:{int(current_timestamp%60):02d})")

    return timestamps

def extract_frame_at_timestamp(video_path, timestamp, output_path):
    """Extract a single frame at the given timestamp"""
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)

    # Seek to timestamp
    frame_number = int(timestamp * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    ret, frame = cap.read()
    if ret:
        cv2.imwrite(output_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
        print(f"  ✓ Saved: {output_path}")
        return True
    else:
        print(f"  ✗ Failed to extract frame at {timestamp}s")
        return False

    cap.release()

# Main execution
print("Scanning transcript for equipment mentions...")
timestamps = find_equipment_timestamps(srt_path, equipment_keywords)

print(f"\nFound {len(timestamps)} equipment items")
print("\nExtracting frames...")

cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)

for equipment_name, timestamp in sorted(timestamps.items(), key=lambda x: x[1]):
    output_path = f"{output_dir}/{equipment_name}.jpg"
    frame_number = int(timestamp * fps)

    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
    ret, frame = cap.read()

    if ret:
        cv2.imwrite(output_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
        print(f"✓ {equipment_name}.jpg (at {int(timestamp//60)}:{int(timestamp%60):02d})")
    else:
        print(f"✗ Failed: {equipment_name}")

cap.release()
print(f"\n✓ Complete! Extracted {len(timestamps)} equipment images to {output_dir}/")
