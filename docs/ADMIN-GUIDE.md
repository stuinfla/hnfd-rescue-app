# HNFD Rescue Equipment Finder - Admin Guide

**Version 2.14.10** | Last Updated: December 22, 2025

This guide explains how to use the Admin Portal to manage equipment inventory, roster, driver zones, images, and security settings.

---

## Table of Contents

1. [Accessing the Admin Portal](#accessing-the-admin-portal)
2. [Admin Portal Overview](#admin-portal-overview)
3. [Equipment Management](#equipment-management)
4. [Images Tab](#images-tab)
5. [Driver Zones Management](#driver-zones-management)
6. [Roster Management](#roster-management)
7. [Settings (PIN Management)](#settings-pin-management)
8. [Deployment](#deployment)
9. [Best Practices](#best-practices)

---

## Accessing the Admin Portal

### Direct URL
Navigate to: `https://hnfd-rescue.vercel.app/admin-portal.html`

### Admin Password
- **Admin PIN:** `hnfd2026admin`
- This is separate from the Roster PIN (1426)
- Can be changed in Settings tab

---

## Admin Portal Overview

The Admin Portal has **6 tabs**:

| Tab | Purpose |
|-----|---------|
| **Equipment** | Add, edit, delete equipment inventory |
| **Images** | Manage equipment photos and location guides |
| **Drivers** | Manage driver zones and phone numbers |
| **Roster** | Manage HNFD member contact list |
| **Deploy** | Review and push changes live |
| **Settings** | Change Roster PIN and Admin PIN |

---

## Equipment Management

### Viewing Equipment
The Equipment tab shows all inventory items with:
- Item name and location
- Compartment badge
- CRITICAL badge (if applicable)
- **Edit** button
- **Delete** button (🗑️)

### Adding New Equipment
1. Click **+ Add Equipment**
2. Follow the guided prompts:
   - Equipment name (required)
   - Location (e.g., "Cabinet K, middle shelf")
   - Compartment letter (e.g., "K")
   - Description
   - Quick find tip (optional)
   - Is it critical? (Yes/No)
3. Equipment is added to the list

### Editing Equipment
1. Click **Edit** on any equipment card
2. Modify fields in the modal
3. Click **Save Changes**

### Deleting Equipment
1. Click the **🗑️** delete button
2. Confirm the deletion
3. Equipment is removed

### Equipment Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Official name | "Adult Trauma Bag" |
| **Location** | Where to find it | "Cabinet K - Middle Drawer" |
| **Compartment** | Cabinet letter | "K" |
| **Description** | What it is/does | "Contains trauma supplies" |
| **Quick Find** | Search tip | "red bag, trauma" |
| **Critical** | Priority item | Yes/No |
| **Image** | Photo path | Auto-managed |

---

## Images Tab

### Managing Equipment Images
- Upload new photos for equipment
- Set location guide images (3-step visual guide)
- Position gold dots on images
- All images display with `object-fit: contain` (never cropped)

### Image Guidelines
- Clear, well-lit photos
- No faces or personal information
- 4:3 aspect ratio recommended
- Under 2MB file size

---

## Driver Zones Management

### Viewing Driver Zones
Each zone shows:
- Zone number (e.g., Zone 750)
- Driver name
- Phone number
- Quick tip for drivers

### Adding a Driver Zone
1. Click **+ Add Zone**
2. Enter zone number
3. Enter driver name
4. Enter phone number (optional)

### Editing a Driver Zone
1. Click **Edit** on the zone
2. Modify driver name or phone
3. Save changes

### Deleting a Driver Zone
1. Click the delete button
2. Confirm deletion

---

## Roster Management

### Member Information
Each member entry includes:
- Name
- Member number
- Certification (EMT, AEMT, etc.)
- Office/Title (if applicable)
- Phone number
- Email

### Adding a Member
1. Click **+ Add Member**
2. Enter first name, last name
3. Enter phone number
4. Enter member number (optional)
5. Enter certification
6. Enter office/title (optional)
7. Enter email (optional)

### Editing a Member
1. Click **Edit** on the member card
2. Modify any field
3. Save changes

### Deleting a Member
1. Click **🗑️** delete button
2. Confirm deletion

### Leadership Section
- Leadership members are displayed separately
- Sorted by member number
- Chief (701) appears first

---

## Settings (PIN Management)

### Roster PIN
- **Current:** 1426
- Used by EMTs to access the member roster in the main app
- To change:
  1. Enter new 4+ character PIN
  2. Click **Update Roster PIN**

### Admin PIN
- **Current:** hnfd2026admin
- Used to access this Admin Portal
- To change:
  1. Enter new 4+ character PIN
  2. Click **Update Admin PIN**

**Important:** Remember your new PINs before deploying!

---

## Deployment

### Pending Changes
The Deploy tab shows all changes made since last deployment:
- Added equipment
- Deleted members
- Updated driver zones
- PIN changes

### Deploying Changes
1. Review all pending changes
2. Click **Deploy Changes**
3. Changes are saved and pushed live

**Note:** Changes are not visible to users until deployed.

---

## Best Practices

### Equipment Management
1. Use consistent naming conventions
2. Add multiple search aliases
3. Be specific about locations (include drawer position)
4. Mark critical items appropriately

### Security
1. Keep Admin PIN separate from Roster PIN
2. Change PINs periodically
3. Don't share Admin PIN widely
4. Export backups regularly

### Images
1. Use clear, well-lit photos
2. Ensure images are current
3. Test location guides with actual EMTs
4. Position gold dots accurately

### Roster
1. Keep contact info current
2. Remove inactive members
3. Update certifications when they change
4. Verify phone numbers work

---

## Troubleshooting

### Changes Not Appearing
1. Make sure you clicked **Deploy**
2. Users may need to refresh the app
3. Check for any error messages

### Cannot Access Admin Portal
1. Verify the Admin PIN is correct
2. Check the URL is correct
3. Clear browser cache and try again

### Images Not Displaying
1. Verify image file exists
2. Check file format (JPG, PNG)
3. Re-upload the image

---

## Quick Reference

| Action | How To |
|--------|--------|
| Add equipment | Equipment tab → + Add Equipment |
| Delete equipment | Equipment tab → 🗑️ on card |
| Add member | Roster tab → + Add Member |
| Change Roster PIN | Settings tab → Update Roster PIN |
| Change Admin PIN | Settings tab → Update Admin PIN |
| Deploy changes | Deploy tab → Deploy Changes |

---

## Access Information

| Resource | URL/Value |
|----------|-----------|
| Main App | https://hnfd-rescue.vercel.app |
| Admin Portal | https://hnfd-rescue.vercel.app/admin-portal.html |
| Roster PIN | 1426 |
| Admin PIN | hnfd2026admin |

---

**Need Help?**

Contact your department's technology coordinator or the app administrator.

*This documentation is for HNFD Rescue Equipment Finder v2.14.10*
