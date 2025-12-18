# Admin Mode & Image Selection Guide

## 📍 Where is the Admin Functionality?

### Quick Access
1. **Live App**: https://hnfd-rescue.vercel.app
2. **Click ⚙️ gear icon** (top-right, next to 🌙 moon icon)
3. **Password**: `hnfd2024`

### Files Locations
```
public/
├── app.js              # Lines 1228-1590: Admin code
├── index.html          # Lines 813: Admin button
│                       # Lines 933-1023: Admin UI modals
├── ADMIN_GUIDE.md      # Complete admin documentation
└── images/             # Equipment images folder
```

## 🎯 Admin Features

### What You Can Do
- ✏️ Edit equipment names, locations, descriptions
- ➕ Add new equipment items
- 🗑️ Delete equipment
- 🔤 Update aliases (search terms)
- 🖼️ Change image paths
- 📥 Export database as JSON (backup)
- 📤 Import database from JSON (restore)
- 🔍 Search/filter equipment list

### How to Edit Equipment

**Option 1: Via Admin Panel (Easy)**
1. Click ⚙️ → Enter password
2. Click on any equipment item
3. Edit fields
4. Click 💾 Save

**Option 2: Direct Code Edit (Faster for bulk changes)**
File: `public/app.js` lines 19-279

```javascript
{
  id: "trauma_bag_adult",
  name: "Adult Trauma Bag",
  aliases: ["trauma back", "first-in bag", "first end bag"],
  location: "Cabinet K - Middle Drawer (FRONT)",
  compartment: "K",
  color: "Red/Orange",
  image: "/images/trauma_bag_adult.jpg",  // ← Change this
  critical: true,
  criticalRank: 1,
  description: "Contains all trauma supplies for adult patients",
  // ... more fields
}
```

## 🖼️ Finding Better Images

### Problem
Some equipment images don't match well with the items described.

### Solution: Frame Browser Tool

**I've created a visual frame browser** to help you select better images:

**Location**: `video_analysis/frame_browser.html`

**How to Use**:
1. **Open in browser**:
   ```bash
   cd /Users/stuartkerr/Code/AMBUILANCE_INVENTORY/video_analysis
   open frame_browser.html
   ```

2. **Browse 600 frames** extracted from the training video

3. **Click frames** you want to use for equipment

4. **Copy frame names** - click "Copy Frame Names" button

5. **Update images** (two ways):

   **Way 1: Via Admin Panel**
   - Open admin panel (⚙️)
   - Click equipment item
   - Paste frame filename in "Image Path" field
   - Example: `/images/frame_0234_t680.45s.jpg`
   - Click Save

   **Way 2: Edit Code Directly**
   - Edit `public/app.js`
   - Find equipment item
   - Update `image: "/images/new_frame.jpg"`
   - Save, commit, deploy

### Better Frame Coverage

**New frames location**: `video_analysis/frames_v2/`
- **600 frames** total (vs 348 original)
- **1 frame every ~2.9 seconds**
- **Better coverage** of all equipment demonstrations

**Frame naming**: `frame_XXXX_tYYY.YYs.jpg`
- Example: `frame_0234_t680.45s.jpg`
  - Frame #234
  - Timestamp: 11 minutes 20 seconds (680.45s)

### Copy Frames to Public Images

Once you've selected better frames in the browser:

```bash
# Copy selected frames to public/images/
cp video_analysis/frames_v2/frame_0234_t680.45s.jpg public/images/

# Or rename while copying
cp video_analysis/frames_v2/frame_0234_t680.45s.jpg public/images/trauma_bag_adult.jpg
```

## 🔧 Quick Equipment Image Fix

### Current Equipment & Images

| Equipment | Current Image | Location in Database |
|-----------|---------------|---------------------|
| Adult Trauma Bag | trauma_bag_adult.jpg | Line 33 |
| Adult Oxygen Kit | cabinet_k_overview.jpg | Line 47 |
| Pediatric Oxygen Kit | pediatric_bags.jpg | Line 61 |
| Pediatric Trauma Bag | pediatric_bags.jpg | Line 74 |
| Intubation Kit | intubation_kit.jpg | Line 87 |
| IV Bag | cabinet_k_overview.jpg | Line 100 |
| Portable AED | cabinet_d_aed.jpg | Line 114 |
| Drug Box | drug_box.jpg | Line 129 |
| Portable Suction | drug_box.jpg | Line 143 |
| Glucometer | drawer_n_labeled.jpg | Line 157 |
| Narcan | drawer_n.jpg | Line 171 |
| Spare Oxygen Tanks | oxygen_tanks.jpg | Line 185 |
| Lifepak 15 | lifepak_mounted.jpg | Line 199 |
| LUCAS Device | (no image) | Line 213 |
| Saline Bags | (no image) | Line 225 |
| Primary Sets | (no image) | Line 234 |
| Onboard Suction | (no image) | Line 243 |

### Fast Fix Process

1. **Open frame browser**: `video_analysis/frame_browser.html`

2. **Find equipment in video**:
   - Look through frames for specific equipment
   - Cabinet K: frames ~50-150
   - Drug Box: frames ~200-250
   - AED: frames ~300-350
   - etc.

3. **Select frames** by clicking

4. **Copy to images folder**:
   ```bash
   cp video_analysis/frames_v2/frame_XXXX.jpg public/images/equipment_name.jpg
   ```

5. **Update database** (choose one):
   - **Admin panel**: ⚙️ → Edit item → Update "Image Path"
   - **Code**: Edit `app.js` line number from table above

6. **Deploy**:
   ```bash
   git add public/
   git commit -m "fix: update equipment images for better accuracy"
   git push
   ```

## 🔐 Change Admin Password

**File**: `public/app.js` **Line**: 1228

```javascript
const ADMIN_PASSWORD = 'hnfd2024'; // ← Change this
```

Replace with your secure password, save, and deploy.

## 📤 Backup & Restore

### Export Equipment Database
1. Admin panel → Click "📥 Export JSON"
2. Saves: `hnfd-equipment-YYYY-MM-DD.json`
3. Keep this file as backup

### Import Equipment Database
1. Admin panel → Click "📤 Import JSON"
2. Select your backup file
3. Confirm replacement

## 🚀 Deploy Changes

After making changes:

```bash
# If you edited code
git add public/
git commit -m "update: equipment images and descriptions"
git push

# Vercel auto-deploys from GitHub
# Live in 30-60 seconds at https://hnfd-rescue.vercel.app
```

## 📊 Current Database Stats

- **Total Equipment**: 17 items
- **Critical Items**: 9 items
- **Images Available**: 11 unique images
- **Items Without Images**: 4 items

## ⚡ Quick Tasks

### Add Missing Images
Items without images:
- LUCAS Device (line 213)
- Saline Bags (line 225)
- Primary Sets (line 234)
- Onboard Suction (line 243)

### Fix Duplicate Images
These items share images (might need unique ones):
- Adult Oxygen Kit & IV Bag both use `cabinet_k_overview.jpg`
- Pediatric Oxygen Kit & Pediatric Trauma Bag both use `pediatric_bags.jpg`
- Drug Box & Portable Suction both use `drug_box.jpg`

---

**Questions?** Check `ADMIN_GUIDE.md` for detailed documentation.
