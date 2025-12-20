# HNFD Rescue Equipment Finder - Admin Guide

**Version 2.8.0** | Last Updated: December 19, 2025

This guide explains how to use the Admin features to manage equipment inventory, add images, set location guides, and add medical reference notes.

---

## Table of Contents

1. [Accessing Admin Mode](#accessing-admin-mode)
2. [Equipment Management](#equipment-management)
3. [Location Guide Editor](#location-guide-editor)
4. [Adding Usage Notes & Dosage Info](#adding-usage-notes--dosage-info)
5. [Image Management](#image-management)
6. [Export & Import](#export--import)
7. [Best Practices](#best-practices)

---

## Accessing Admin Mode

### For Regular Users (Settings Menu)
1. Tap the **gear icon** (⚙️) in the top-right corner
2. The Settings menu shows:
   - Current version and update status
   - What's New changelog
   - **Check for Updates** button
   - **Share App with EMTs** button
   - **Admin Access** button (for authorized users)

### For Admin Users
1. Tap the **gear icon** (⚙️)
2. Tap **Admin Access**
3. Enter the admin password
4. The Equipment Management panel opens

**Note:** Once authenticated, tapping the gear icon goes directly to the admin panel for the rest of that session.

---

## Equipment Management

### Viewing Equipment
The admin panel shows all equipment items with:
- **Item Name** (e.g., "Adult Trauma Bag")
- **Location** (e.g., "Cabinet K - Middle Drawer")
- **Badges**: CRITICAL (red), Compartment letter (green)

### Adding New Equipment
1. Tap **➕ Add Equipment**
2. Fill in the required fields:
   - **Item Name*** (required)
   - **Location*** (required)
3. Fill in optional fields as needed
4. Tap **💾 Save**

### Editing Equipment
1. Tap on any equipment item in the list
2. Edit any field
3. Tap **💾 Save**

### Deleting Equipment
1. Tap on the equipment item
2. Tap **🗑️ Delete** (red button)
3. Confirm the deletion

### Equipment Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Item Name** | Official name of the equipment | "Adult Trauma Bag" |
| **Aliases** | Alternative names (comma-separated) | "trauma back, first-in bag, red bag" |
| **Location** | Where to find it | "Cabinet K - Middle Drawer (FRONT)" |
| **Compartment** | Cabinet/drawer letter | "K" |
| **Color** | Color description | "Red/Orange" |
| **Description** | What it contains/does | "Contains all trauma supplies for adult patients" |
| **Contents** | List of items inside | "Bandages, gauze, trauma shears..." |
| **Warning** | Critical safety info | "CRITICAL: Check expiration dates" |
| **Driver Note** | Info for driver | "Can be restocked at station" |
| **Usage Notes** | Medical/dosage info | See section below |
| **Image Path** | Path to image | "/images/trauma_bag_adult.jpg" |
| **Critical Item** | Checkbox for priority items | ✓ |
| **Critical Rank** | Priority order (1=highest) | 1 |

---

## Location Guide Editor

The Location Guide Editor allows you to create 3-image visual guides that help EMTs find equipment quickly.

### Opening the Location Guide Editor
1. In the admin panel, find the equipment item
2. Tap **🎯 Edit Location Guide**

### The 3-Step Visual Guide

| Step | Purpose | Example |
|------|---------|---------|
| **Step 1: Ambulance** | Show where on the ambulance | Side view with Cabinet K highlighted |
| **Step 2: Cabinet** | Show the open cabinet/drawer | Cabinet K with middle drawer open |
| **Step 3: Equipment** | Show the actual equipment | Close-up of the trauma bag |

### Setting Images

For each step:
1. Tap the **step tab** (Step 1, Step 2, or Step 3)
2. Choose an image:
   - **📁 Image Library** - Select from existing photos
   - **📤 Upload New** - Take or upload a new photo
   - **🗑️ Clear** - Remove the current image

### Positioning the Gold Dot

Steps 1 and 2 have a **gold dot** that shows EMTs exactly where to look:

1. Select Step 1 or Step 2
2. The gold dot appears on the image
3. **Drag the dot** to the correct position
4. Enter a **label** (e.g., "Cabinet K", "Middle Drawer")
5. The position shows as percentages (e.g., "Position: 45%, 60%")

**Note:** Step 3 (Equipment) does not have a dot since it shows the actual equipment.

### Rotation Preview

The **Rotation Preview** section shows how users will see the guide:
- Tap **▶️ Play Preview** to see the 3-image rotation
- Tap **⏸️ Pause** to stop
- The dots at the bottom indicate which image is showing

### Saving Changes

1. Tap **💾 Save Location Guide**
2. The guide is saved and will appear when users search for this item

---

## Adding Usage Notes & Dosage Info

The **Usage Notes** field allows authorized EMTs to add medical reference information that appears when users look up equipment.

### When to Use Usage Notes

- **Dosage information** (for medications)
- **Age-specific instructions** (adult vs. pediatric)
- **Critical reminders** (contraindications, allergies)
- **Step-by-step usage** (for complex equipment)
- **Local protocols** (department-specific procedures)

### Example: Narcan

```
DOSAGE GUIDELINES:
- Adult: 0.4-2mg IV/IM/SC, repeat every 2-3 min if needed
- Pediatric: 0.01mg/kg IV/IM/SC
- Elderly: Start with lower dose

IMPORTANT:
- Monitor for recurrence of respiratory depression
- Duration of naloxone may be shorter than opioid
- Be prepared for potential agitation upon reversal
```

### Example: AED

```
USAGE:
1. Power ON - green button
2. Attach pads as shown on package
3. Stand clear during analysis
4. Follow voice prompts

PEDIATRIC: Use pediatric pads if available
- Under 8 years: Use pediatric pads
- Over 8 years: Standard adult pads OK
```

### Adding Usage Notes

1. Edit the equipment item
2. Scroll to **Usage Notes / Dosage Info**
3. Enter the information
4. Tap **💾 Save**

**IMPORTANT:** Only authorized EMTs should add medical information. This is reference material only - always follow your department's protocols.

---

## Image Management

### Replacing an Item's Main Image

1. In the admin panel, find the item
2. Tap **📷 Replace Image**
3. Take a photo or select from gallery
4. Tap **✓ Save Image**

### Image Guidelines

**Good Images:**
- Clear, well-lit photos
- Show the equipment clearly
- No faces or personal information
- Consistent orientation
- Appropriate file size (under 2MB)

**Image Dimensions:**
- Recommended: 4:3 aspect ratio
- Minimum: 640x480 pixels
- Maximum: 2048x1536 pixels

### Using the Image Library

The Image Library contains all existing equipment photos:
- `/images/` - Main equipment photos
- `/images/locations/` - Location guide photos

Available images include:
- Cabinet overviews (labeled and unlabeled)
- Drawer contents
- Equipment close-ups
- Ambulance exterior/interior views

---

## Export & Import

### Exporting Inventory

1. Tap **📥 Export JSON**
2. A file downloads containing all equipment data
3. Use this for backup or sharing with other departments

### Importing Inventory

1. Tap **📤 Import JSON**
2. Select a previously exported JSON file
3. Confirm the import
4. The inventory is replaced with the imported data

**Warning:** Importing replaces ALL existing inventory data. Export first as a backup!

---

## Best Practices

### For Equipment Data

1. **Use consistent naming** - "Adult Trauma Bag" not "trauma bag adult"
2. **Add multiple aliases** - Include common misspellings and abbreviations
3. **Be specific about location** - Include drawer position (FRONT, BACK, LEFT, RIGHT)
4. **Mark critical items** - Helps with search prioritization

### For Location Guides

1. **Step 1** should show the ambulance exterior or interior with the general area highlighted
2. **Step 2** should show the open cabinet/drawer with contents visible
3. **Step 3** should be a clear close-up of the actual equipment
4. **Position dots accurately** - Test by showing to another EMT

### For Usage Notes

1. **Keep it concise** - EMTs need quick reference, not textbooks
2. **Highlight critical info** - Use CAPS or bullet points for important items
3. **Include age groups** - Adult, pediatric, elderly when applicable
4. **Cite protocols** - Reference department protocols when possible
5. **Review regularly** - Update when protocols change

### For Maintenance

1. **Check for updates** regularly (Settings → Check for Updates)
2. **Export backups** weekly or after major changes
3. **Verify images** - Ensure photos are clear and current
4. **Test voice search** - Say equipment names to verify recognition

---

## Troubleshooting

### Images Not Showing

1. Check the image path is correct
2. Ensure the image file exists
3. Try clearing the image and re-uploading

### Location Guide Not Saving

1. Ensure at least one image is set
2. Check for unsaved changes in other fields
3. Try closing and reopening the editor

### Changes Not Appearing for Users

1. Users need to check for updates (Settings → Check for Updates)
2. Changes are saved to local storage, not server
3. Export and share the JSON file to sync across devices

---

## Quick Reference

| Action | How To |
|--------|--------|
| Add equipment | ➕ Add Equipment |
| Edit equipment | Tap item → Edit fields → 💾 Save |
| Delete equipment | Tap item → 🗑️ Delete |
| Edit location guide | 🎯 Edit Location Guide |
| Replace image | 📷 Replace Image |
| Add dosage info | Edit → Usage Notes field → 💾 Save |
| Export data | 📥 Export JSON |
| Import data | 📤 Import JSON |
| Check for updates | ⚙️ → Check for Updates |
| Share app | ⚙️ → Share App with EMTs |

---

**Need Help?**

Contact your department's technology coordinator or the app administrator.

*This documentation is for HNFD Rescue Equipment Finder v2.8.0*
