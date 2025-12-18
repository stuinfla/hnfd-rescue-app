# Admin Mode - Quick Reference

## Accessing Admin Mode

1. **Open the app**: https://hnfd-rescue.vercel.app
2. **Click the ⚙️ gear icon** in the top-right header
3. **Enter password**: `hnfd2024`
4. Admin panel opens

## Changing the Admin Password

**File:** `public/app.js`
**Line:** 1228

```javascript
const ADMIN_PASSWORD = 'hnfd2024'; // Change this for production
```

Change `'hnfd2024'` to your secure password, save, and redeploy.

## Managing Equipment

### Add New Equipment
1. Click **"➕ Add Equipment"**
2. Fill in required fields:
   - **Item Name** (required)
   - **Location** (required)
3. Optional fields:
   - Aliases (comma-separated, e.g., "AED, defibrillator, defib")
   - Compartment (K, J, N, D, etc.)
   - Color (Red/Orange, GREEN, etc.)
   - Description
   - Contents
   - Warning message
   - Driver notes
   - Image path (e.g., `/images/item.jpg`)
   - Critical item checkbox
   - Critical rank (1-10, lower = more important)
4. Click **"💾 Save"**

### Edit Equipment
1. Click on any equipment item in the list
2. Modify fields as needed
3. Click **"💾 Save"**

### Delete Equipment
1. Click on the equipment item
2. Click **"🗑️ Delete"** button
3. Confirm deletion

### Search Equipment
Use the search box at the top to filter items by name, location, or alias.

## Backup & Restore

### Export Database
1. Click **"📥 Export JSON"**
2. Downloads file: `hnfd-equipment-YYYY-MM-DD.json`
3. Save this file for backup

### Import Database
1. Click **"📤 Import JSON"**
2. Select your backup `.json` file
3. Confirm replacement
4. All equipment updated

## Where Data is Stored

| Storage | Location | Purpose |
|---------|----------|---------|
| **Default Database** | `app.js` lines 19-279 | Built-in equipment list |
| **Custom Changes** | Browser localStorage | User edits/additions |
| **Exports** | Downloaded JSON files | Backups |

**Key:** `hnfd_equipment_custom` in localStorage

## Equipment Data Structure

Each item has these fields:

```json
{
  "id": "trauma_bag_adult",
  "name": "Adult Trauma Bag",
  "aliases": ["trauma back", "first-in bag"],
  "searchText": "adult trauma bag trauma back first in",
  "location": "Cabinet K - Middle Drawer (FRONT)",
  "compartment": "K",
  "color": "Red/Orange",
  "critical": true,
  "criticalRank": 1,
  "description": "Contains all trauma supplies for adult patients",
  "contents": "Bandages, gauze, tourniquets, etc.",
  "warning": "CRITICAL: Check seal before use",
  "driverNote": "Grab this first for trauma calls",
  "image": "/images/trauma_bag_adult.jpg"
}
```

## Quick Edits Without Admin Mode

### Edit Equipment Directly in Code

**File:** `public/app.js`
**Lines:** 19-279 (INVENTORY_DATABASE)

Example:
```javascript
{
  id: "trauma_bag_adult",
  name: "Adult Trauma Bag",
  aliases: ["trauma back", "first-in bag"],
  location: "Cabinet K - Middle Drawer (FRONT)",
  // ... add or change fields
}
```

After editing:
1. Save `app.js`
2. Git commit
3. Git push
4. Vercel auto-deploys

### Change Admin Password

**File:** `public/app.js`
**Line:** 1228

```javascript
const ADMIN_PASSWORD = 'your-new-password';
```

### Change Images

**File:** `public/app.js`
Find the item and update `image` field:

```javascript
image: "/images/new_image_name.jpg"
```

Then add the new image to `/public/images/` folder.

## Troubleshooting

**Admin button not visible?**
- Check you're on v2.2.0 or later (footer shows version)
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

**Password not working?**
- Default is `hnfd2024` (case-sensitive)
- Check line 1228 in `app.js` for current password

**Changes not saving?**
- Check browser console for errors
- Ensure localStorage is enabled
- Try export/import to force save

**Lost changes?**
- Export database regularly as backup
- Check localStorage: `hnfd_equipment_custom`
- Clear localStorage to restore defaults

## Version History

| Version | Changes |
|---------|---------|
| 2.2.0 | Added admin mode |
| 2.1.2 | Fixed audio on Android/iOS |
| 2.1.1 | Fixed offline icon caching |
| 2.1.0 | Auto-updates, versioning |

---

**Need help?** Check the code at: https://github.com/stuinfla/hnfd-rescue-app
