# Admin Portal - Quick Reference (v2.15.0)

## Accessing the Admin Portal

1. **Go to:** https://hnfd-rescue.vercel.app/admin.html
2. **Enter password:** `hnfd2026admin`
3. Admin portal opens with 6 tabs

## Security (v2.14+)

The system uses **separate PINs**:

| Access | PIN | Purpose |
|--------|-----|---------|
| **Roster** | `1426` | Mobile app roster access |
| **Admin** | `hnfd2026admin` | Admin portal login |

### Changing PINs
1. Go to **Settings** tab
2. Enter new PIN
3. Click **Update Roster PIN** or **Update Admin PIN**

---

## Admin Portal Tabs

### Equipment Tab
Full CRUD for equipment:
- **+ Add Equipment** - Create new items
- **Edit** button - Modify existing items
- **Delete** button - Remove items

### Images Tab
- Upload equipment photos
- Manage location guide images
- Images display without cropping

### Drivers Tab
- Add/edit driver zones
- Phone numbers for each zone
- Tap-to-call functionality

### Roster Tab
- View/add/edit members
- Leadership sorted by number
- Contact information

### Settings Tab
- **Roster PIN** - Controls mobile roster access
- **Admin PIN** - Controls admin portal access

### Deploy Tab
- Review pending changes
- Deploy to production

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
| Can't find Settings | Settings is the 5th tab (gear icon) |
| Changes not saving | Check browser console for errors |
| Images cropped | Update to v2.14+ |

---

## Version History

| Version | Changes |
|---------|---------|
| 2.15.0 | Test reliability improvements |
| 2.14.x | Separate admin/roster PINs, Settings tab |
| 2.13.x | Full CRUD for equipment |
| 2.12.x | Image cropping fixed |

---

**Repository:** https://github.com/stuinfla/hnfd-rescue-app
