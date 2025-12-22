# HNFD Rescue Equipment Finder

**Version 2.15.0** | **Live App:** https://hnfd-rescue.vercel.app

A life-critical Progressive Web App for Harpswell Neck Fire & Rescue ambulance technicians.

---

## What Is This?

The HNFD Rescue Equipment Finder is an offline-capable mobile application that helps Emergency Medical Technicians (EMTs) and ambulance drivers quickly locate critical equipment inside the Harpswell Neck Fire Department ambulance.

### Key Features

| Feature | Description |
|---------|-------------|
| **Voice Search** | Speak "Where's the AED?" and get instant location info |
| **Visual References** | Actual photos from the ambulance showing equipment |
| **Text-to-Speech** | App speaks the location back - hands-free operation |
| **100% Offline** | Works in areas with no cell service |
| **Roster Access** | PIN-protected member directory with tap-to-call |
| **Driver Zones** | Phone numbers for zone drivers with flip-card maps |
| **Admin Portal** | Full equipment management (Add/Edit/Delete) |
| **PIN Security** | Separate PINs for roster and admin access |

---

## Quick Start

### Mobile App (EMTs & Drivers)
1. Open https://hnfd-rescue.vercel.app on your phone
2. Tap the microphone and speak your search (e.g., "AED", "trauma bag")
3. Or type in the yellow search box
4. Results show location + photo + spoken directions

### Admin Portal (Equipment Management)
1. Go to https://hnfd-rescue.vercel.app/admin.html
2. Enter admin password: `hnfd2026admin`
3. Manage equipment, images, drivers, roster, and settings

---

## Application Structure

```
Mobile App (/)                    Admin Portal (/admin.html)
├── Voice Search                  ├── Equipment (CRUD)
├── Text Search                   ├── Images Management
├── Quick Access Buttons          ├── Driver Zones
│   ├── AED                       ├── Roster Management
│   ├── Narcan                    ├── Settings (PIN management)
│   ├── Oxygen                    │   ├── Roster PIN
│   ├── Trauma Bag                │   └── Admin PIN
│   ├── Drug Box                  └── Deploy
│   └── Suction
├── Compartment Browser
├── Roster (PIN: 1426)
├── Driver Zones
└── Settings
```

---

## Features in v2.15.0

### Mobile App
- **Voice Search** with auto-start (desktop) or tap-to-start (iOS)
- **Yellow search box** for high visibility
- **Microphone pulses** to prompt user interaction on iOS
- **Speaker toggle** - tap to start/stop speech (🔊/🔇)
- **Compartment browser** with Inside/Outside labels
- **Roster** - PIN-protected, tap name for details, tap-to-call
- **Driver Zones** - phone numbers, flip-card map view

### Admin Portal
- **Full CRUD** for equipment (Add, Edit, Delete buttons)
- **Image management** - no cropping, full image display
- **Settings tab** with separate PIN management:
  - Roster PIN (controls mobile roster access)
  - Admin PIN (controls admin portal access)
- **Driver zones** editing
- **Roster management**

---

## Installation as PWA

### iOS (Safari)
1. Open https://hnfd-rescue.vercel.app in Safari
2. Tap the Share button (box with arrow)
3. Scroll down, tap "Add to Home Screen"
4. Tap "Add" in the top right

### Android (Chrome)
1. Open https://hnfd-rescue.vercel.app in Chrome
2. Tap the 3-dot menu
3. Tap "Add to Home Screen" or "Install App"
4. Confirm installation

---

## Security

| Access Type | PIN/Password | Purpose |
|-------------|--------------|---------|
| **Roster** | `1426` | View member directory on mobile |
| **Admin Portal** | `hnfd2026admin` | Full equipment/settings management |

### Changing PINs
1. Login to Admin Portal
2. Go to Settings tab
3. Update Roster PIN or Admin PIN
4. Click "Update" button

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla HTML/CSS/JavaScript |
| Voice Recognition | Web Speech API |
| Text-to-Speech | SpeechSynthesis API |
| Offline Support | Service Worker |
| Hosting | Vercel |
| Testing | Playwright (158 tests) |

---

## Development

### Running Locally
```bash
# Install dependencies
npm install

# Start dev server
npm start

# Run tests
npm test
```

### Deployment
```bash
# Deploy to Vercel production
vercel --prod
```

### Test Suite
- **158 tests** covering mobile and admin functionality
- Mobile tests optimized for iPhone/Android viewports
- Admin tests for desktop browsers (Chromium, Firefox)

---

## File Structure

```
AMBUILANCE_INVENTORY/
├── index.html              # Mobile PWA
├── admin-portal.html       # Admin management interface
├── version.json            # Version info + changelog
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── images/                 # Equipment photos
├── icons/                  # App icons
├── tests/
│   └── e2e/
│       ├── mobile.spec.js  # Mobile app tests
│       └── admin.spec.js   # Admin portal tests
├── docs/                   # Documentation
└── README.md               # This file
```

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 2.15.0 | Dec 22, 2025 | Improved test reliability, version sync |
| 2.14.x | Dec 21, 2025 | Speaker toggle, iOS voice fix, admin PIN separation |
| 2.13.x | Dec 20, 2025 | Admin CRUD, image fixes |
| 2.12.x | Dec 19, 2025 | Roster features, driver zones |
| 2.11.x | Dec 18, 2025 | Yellow search box, microphone sizing |
| 2.10.x | Dec 17, 2025 | Compartment labels, speech fixes |

### Full Changelog (v2.15.0)
- TESTS: Improved Playwright test reliability
- UI: Speaker icon shows 🔇 when speaking (tap to stop)
- iOS: Auto-start listening on desktop, tap required on iOS
- iOS: Microphone pulses to prompt user to tap
- SECURITY: Admin PIN changed (separate from roster)
- ADMIN: Settings tab for PIN management
- FIX: Admin portal images no longer cropped
- ADMIN: Full CRUD for Equipment (Add, Edit, Delete)
- UI: Yellow box around search input for visibility
- Roster now requires PIN to access
- Driver zones now have phone numbers
- Flip card for driver zones map

---

## Support

- **Repository**: https://github.com/stuinfla/hnfd-rescue-app
- **Live App**: https://hnfd-rescue.vercel.app
- **Admin Portal**: https://hnfd-rescue.vercel.app/admin.html

---

*Built with care for the EMTs and first responders of Harpswell Neck Fire & Rescue*
