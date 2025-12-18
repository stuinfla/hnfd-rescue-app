#!/usr/bin/env python3
"""
Extract frames from training video for better equipment image matching
Extracts 600 frames evenly distributed across the video
"""

import cv2
import os
import sys

video_path = "Ambulance_training_data/Where Everything Is In The Ambulance.mp4"
output_dir = "video_analysis/frames_v2"
target_frames = 600

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
print(f"Duration: {duration:.2f} seconds")
print(f"Extracting: {target_frames} frames")
print(f"Output: {output_dir}/")

# Calculate frame interval
frame_interval = total_frames / target_frames

frame_count = 0
saved_count = 0

while True:
    # Read frame
    ret, frame = cap.read()
    if not ret:
        break

    # Save frame at intervals
    if frame_count % int(frame_interval) == 0 and saved_count < target_frames:
        timestamp = frame_count / fps
        filename = f"{output_dir}/frame_{saved_count:04d}_t{timestamp:.2f}s.jpg"
        cv2.imwrite(filename, frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        saved_count += 1

        if saved_count % 50 == 0:
            print(f"  Extracted {saved_count}/{target_frames} frames...")

    frame_count += 1

cap.release()
print(f"\n✓ Complete! Extracted {saved_count} frames to {output_dir}/")
print(f"  Frame interval: every {frame_interval:.1f} frames ({frame_interval/fps:.2f}s)")
