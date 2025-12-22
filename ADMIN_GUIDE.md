# Admin Portal Guide - v2.15.0

## Quick Access

**Admin Portal URL:** https://hnfd-rescue.vercel.app/admin.html
**Admin Password:** `hnfd2026admin`

---

## Accessing Admin Mode

1. Go to https://hnfd-rescue.vercel.app/admin.html
2. Enter password: `hnfd2026admin`
3. Admin portal opens with 6 tabs:
   - **Equipment** - Add, edit, delete equipment items
   - **Images** - Manage equipment photos
   - **Drivers** - Driver zone phone numbers
   - **Roster** - Member management
   - **Settings** - PIN management (Roster & Admin)
   - **Deploy** - Deployment tools

---

## Admin Portal Tabs

### Equipment Tab
Full CRUD (Create, Read, Update, Delete) for equipment:

**Add New Equipment:**
1. Click **"+ Add Equipment"** button
2. Fill in required fields:
   - Item Name (required)
   - Location (required)
3. Optional fields: Aliases, Compartment, Color, Description, Warning, Image
4. Click **"Save"**

**Edit Equipment:**
1. Find the equipment card
2. Click **"Edit"** button
3. Modify fields as needed
4. Click **"Save"**

**Delete Equipment:**
1. Find the equipment card
2. Click **"Delete"** button
3. Confirm deletion

### Images Tab
- Upload new equipment images
- View image gallery
- Images displayed without cropping (full image visible)

### Drivers Tab
- Add/edit driver zones
- Each zone includes phone number
- Click to call functionality

### Roster Tab
- View all members
- Add new members
- Edit member details
- Leadership sorted by number

### Settings Tab
**Manage security PINs separately:**

| Setting | Purpose | Current |
|---------|---------|---------|
| **Roster PIN** | Access roster on mobile app | `1426` |
| **Admin PIN** | Access admin portal | `hnfd2026admin` |

**To update a PIN:**
1. Go to Settings tab
2. Enter new PIN in the input field
3. Click "Update Roster PIN" or "Update Admin PIN"

### Deploy Tab
- Deployment status
- Version information
- Update controls

---

## Security

### PIN Structure (v2.14+)
The system now uses **separate PINs**:

| Access | PIN | Where Used |
|--------|-----|------------|
| Roster | `1426` | Mobile app roster access |
| Admin | `hnfd2026admin` | Admin portal login |

This prevents roster users from accessing admin functions.

---

## Equipment Data Structure

```json
{
  "id": "trauma_bag_adult",
  "name": "Adult Trauma Bag",
  "aliases": ["trauma back", "first-in bag"],
  "location": "Cabinet K - Middle Drawer (FRONT)",
  "compartment": "K",
  "color": "Red/Orange",
  "critical": true,
  "criticalRank": 1,
  "description": "Contains all trauma supplies",
  "warning": "Check seal before use",
  "driverNote": "Grab this first for trauma calls",
  "image": "/images/trauma_bag_adult.jpg"
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Password not working | Use `hnfd2026admin` (case-sensitive) |
| Changes not saving | Check browser console, ensure localStorage enabled |
| Images cropped | Update to v2.14+ (images now show in full) |
| Can't find Settings | Settings is the 5th tab (gear icon) |

---

## Version History

| Version | Changes |
|---------|---------|
| 2.15.0 | Test reliability improvements |
| 2.14.x | Separate admin/roster PINs, Settings tab |
| 2.13.x | Full CRUD for equipment |
| 2.12.x | Image cropping fixed |
| 2.11.x | Driver zones with phone numbers |

---

**Repository:** https://github.com/stuinfla/hnfd-rescue-app
