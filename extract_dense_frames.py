#!/usr/bin/env python3
"""
Extract DENSE frames from training video - 5x more than previous extraction
For comprehensive equipment location images:
- Ambulance exterior shots
- Cabinet/drawer locations
- Equipment close-ups

Target: Extract frame every 1 second (approx 1740 frames for 29 min video)
"""

import cv2
import os
import sys

video_path = "Ambulance_training_data/Where Everything Is In The Ambulance.mp4"
output_dir = "video_analysis/frames_dense"
target_interval_seconds = 1.0  # Extract 1 frame per second

# Create output directory
os.makedirs(output_dir, exist_ok=True)

# Open video
cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print(f"Error: Could not open video {video_path}")
    sys.exit(1)

# Get video properties
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
duration = total_frames / fps

print(f"Video: {video_path}")
print(f"Total frames: {total_frames}")
print(f"FPS: {fps}")
print(f"Duration: {duration:.2f} seconds ({duration/60:.1f} minutes)")
print(f"Extracting: 1 frame every {target_interval_seconds} second(s)")
print(f"Expected frames: ~{int(duration/target_interval_seconds)}")
print(f"Output: {output_dir}/")
print("-" * 50)

# Calculate frame interval
frame_interval = int(fps * target_interval_seconds)

frame_count = 0
saved_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Save frame at intervals
    if frame_count % frame_interval == 0:
        timestamp = frame_count / fps
        minutes = int(timestamp // 60)
        seconds = int(timestamp % 60)

        # Include timestamp in filename for easy identification
        filename = f"{output_dir}/frame_{saved_count:04d}_m{minutes:02d}s{seconds:02d}.jpg"
        cv2.imwrite(filename, frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
        saved_count += 1

        if saved_count % 100 == 0:
            print(f"  Extracted {saved_count} frames... (at {minutes}:{seconds:02d})")

    frame_count += 1

cap.release()
print("-" * 50)
print(f"COMPLETE! Extracted {saved_count} frames to {output_dir}/")
print(f"  Frame interval: every {frame_interval} frames ({target_interval_seconds}s)")
print(f"  Files named: frame_XXXX_mMMsSSS.jpg (minutes/seconds timestamp)")
