# HNFD Rescue Equipment Finder

**A life-critical Progressive Web App for Harpswell Neck Fire & Rescue ambulance technicians**

**Live App:** https://hnfd-rescue.vercel.app

---

## What Is This?

The HNFD Rescue Equipment Finder is an offline-capable mobile application that helps Emergency Medical Technicians (EMTs) and ambulance drivers quickly locate critical equipment inside the Harpswell Neck Fire Department ambulance.

In emergency situations where seconds matter, this app provides:
- **Voice-activated search** - Speak "Where's the AED?" and get instant location info
- **Visual references** - Actual photos from the ambulance showing what equipment looks like
- **Audible responses** - The app speaks the location back to you, hands-free
- **100% offline operation** - Works in areas with no cell service

---

## Why This Exists

EMTs responding to emergencies need to find equipment instantly. New personnel or drivers unfamiliar with the ambulance layout can lose precious seconds searching for critical items. This app was built from official HNFD training materials to provide:

1. **Instant recall** - Every piece of equipment, exactly where it is
2. **Visual confirmation** - Photos showing what to look for
3. **Hands-free operation** - Voice in, voice out
4. **Zero network dependency** - Works anywhere, even with no signal

---

## How It Was Built

### Data Source
The entire knowledge base was extracted from the official HNFD training video "Where Everything Is In The Ambulance" - a 29-minute walkthrough of the ambulance by experienced EMTs.

### Extraction Process
1. **Audio transcription** - Whisper AI transcribed all spoken content
2. **Frame extraction** - 348 frames captured (1 every 5 seconds)
3. **Visual analysis** - Key frames identified showing equipment and locations
4. **Manual verification** - All data cross-referenced with training content

### Technology Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks = faster loading)
- **Voice Recognition**: Web Speech API (native to iOS/Android browsers)
- **Text-to-Speech**: SpeechSynthesis API (100% offline)
- **Offline Support**: Service Worker with cache-first strategy
- **Hosting**: Vercel static deployment

---

## Architecture

```
+------------------------------------------------------------------+
|                      HNFD RESCUE APP                              |
+------------------------------------------------------------------+
|                                                                   |
|   +-------------+     +-------------+     +-----------------+     |
|   |   Voice     |---->|   Search    |---->|    Results      |     |
|   |   Input     |     |   Engine    |     |   + Images      |     |
|   +-------------+     +-------------+     +-----------------+     |
|        |                                          |               |
|        |              +-------------+             |               |
|        +------------->| Text-to-    |<------------+               |
|                       | Speech      |                             |
|                       +-------------+                             |
|                                                                   |
+------------------------------------------------------------------+
|  SERVICE WORKER - Caches all assets for 100% offline operation    |
+------------------------------------------------------------------+
|  EMBEDDED DATABASE - 18 items with locations, images, warnings    |
+------------------------------------------------------------------+
```

### Key Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Voice Input | Web Speech API | Speech-to-text recognition |
| Search Engine | Client-side fuzzy matching | Find equipment by any term |
| Text-to-Speech | SpeechSynthesis API | Speak locations hands-free |
| Visual Reference | JPEG images | Show what equipment looks like |
| Offline Cache | Service Worker | Cache all assets locally |
| Database | Embedded JSON | Zero network dependencies |

---

## Intended Use

### Primary Users
- **EMTs** - Finding equipment during emergency calls
- **Ambulance Drivers** - Locating items requested by EMTs
- **New Personnel** - Learning the ambulance layout

### Usage Scenarios

1. **On-Scene Emergency**
   - EMT needs AED immediately
   - Tap microphone, say "AED"
   - App shows location + photo + speaks directions

2. **Training New Staff**
   - Browse compartments using the visual map
   - Tap each compartment to see all contents
   - Review photos to learn equipment appearance

3. **Driver Assistance**
   - EMT in back calls out "Get me the orange drug box"
   - Driver uses quick search to find Cabinet J location
   - Retrieves item without leaving the ambulance

### Quick Access Buttons
The app provides one-tap access to the most critical items:
- AED
- Narcan
- Trauma Bag
- Oxygen
- Drug Box
- Suction

---

## File Structure

```
AMBUILANCE_INVENTORY/
├── public/                      # Deployable PWA
│   ├── index.html              # Main app (HTML + CSS)
│   ├── app.js                  # App logic + embedded database
│   ├── sw.js                   # Service Worker for offline
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # App icons (192x192, 512x512)
│   └── images/                 # Equipment photos + logo
│       ├── hnfr-logo.png       # Department logo
│       ├── trauma_bag_adult.jpg
│       ├── cabinet_k_overview.jpg
│       ├── intubation_kit.jpg
│       ├── pediatric_bags.jpg
│       ├── drug_box.jpg
│       ├── lifepak_bag.jpg
│       ├── lifepak_mounted.jpg
│       ├── drawer_n.jpg
│       ├── drawer_n_labeled.jpg
│       ├── oxygen_tanks.jpg
│       └── cabinet_d_aed.jpg
├── data/                        # Source data
│   └── ambulance_inventory.json
├── Ambulance_training_data/     # Extracted training materials
│   ├── audio/                   # Extracted audio
│   ├── frames/                  # Video frames
│   ├── transcripts/             # Whisper transcriptions
│   └── output/                  # Processed data
├── server.js                    # Local dev server
├── DEPLOYMENT.md               # Deployment guide
└── README.md                   # This file
```

---

## Database Schema

Each item in the database contains:

```javascript
{
  id: "unique_identifier",
  name: "Display Name",
  aliases: ["alternative", "search", "terms"],
  searchText: "expanded search terms for fuzzy matching",
  location: "Exact location description",
  compartment: "K",  // Cabinet/drawer code
  color: "Visual identifier",
  critical: true,    // Is this a critical item?
  criticalRank: 1,   // 1-13 priority ranking
  description: "What this item does",
  notes: "Additional information",
  warning: "CRITICAL safety information",
  driverNote: "Simplified info for drivers",
  image: "/images/photo.jpg"
}
```

### Current Inventory (18 items)

| # | Item | Location | Critical |
|---|------|----------|----------|
| 1 | Adult Trauma Bag | Cabinet K - Middle Drawer (FRONT) | Yes |
| 2 | Adult Oxygen Kit | Cabinet K - Middle Drawer (BEHIND trauma) | Yes |
| 3 | Pediatric Oxygen Kit | Cabinet K - Lower Drawer (FRONT) | Yes |
| 4 | Pediatric Trauma Bag | Cabinet K - Lower Drawer (BEHIND oxygen) | Yes |
| 5 | Intubation Kit | Cabinet K - Top Shelf | Yes |
| 6 | IV Kit | Cabinet K - Top Shelf | Yes |
| 7 | Portable AED | Cabinet K - Top Shelf (further back) | Yes |
| 8 | Drug Box | Cabinet J | Yes |
| 9 | Portable Suction | Cabinet J | Yes |
| 10 | Glucometer | Drawer N | Yes |
| 11 | Narcan | Drawer N | Yes |
| 12 | Spare Oxygen Tanks | Next to steps on side entry | Yes |
| 13 | LifePak 15 | Mounted in patient compartment | Yes |
| 14 | LUCAS Device | MC2 back seat | Yes |
| 15 | Saline Bags | Cabinet D | No |
| 16 | Primary Sets (IV tubing) | Cabinet D | No |
| 17 | Onboard Suction | Built into patient compartment | No |

---

## Installation as PWA

### iOS (Safari)
1. Open https://hnfd-rescue.vercel.app in Safari
2. Tap the Share button (box with arrow)
3. Scroll down, tap "Add to Home Screen"
4. Tap "Add" in the top right
5. App icon appears on home screen

### Android (Chrome)
1. Open https://hnfd-rescue.vercel.app in Chrome
2. Tap the 3-dot menu
3. Tap "Add to Home Screen" or "Install App"
4. Confirm installation
5. App icon appears on home screen

### After Installation
- Opens like a native app (no browser UI)
- Works completely offline
- All features available with no signal

---

## Updating the Inventory

### To Add/Modify Items
1. Edit `INVENTORY_DATABASE` in `public/app.js`
2. Add image to `public/images/` if needed
3. Add image path to `ASSETS_TO_CACHE` in `public/sw.js`
4. Increment cache version in `sw.js` (e.g., `v1.2.0` → `v1.3.0`)
5. Redeploy

### To Redeploy
```bash
cd public
vercel --prod --yes
```

---

## Security & Privacy

- **No external API calls** - All data embedded in app
- **No data collection** - Nothing leaves the device
- **No user tracking** - No analytics or telemetry
- **No network required** - Works completely air-gapped
- **Open source** - Full code transparency

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Voice not working | Check microphone permissions in browser settings |
| Images not loading offline | Clear cache, reload - make sure images are in sw.js |
| App not updating | Increment version in sw.js, hard refresh (Ctrl+Shift+R) |
| PWA not installing | Must be served over HTTPS (or localhost) |

---

## Support

- **Source**: Harpswell Neck Fire Department training materials
- **Video**: "Where Everything Is In The Ambulance"
- **Data Verification**: All locations verified against official training content

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2024 | Initial release with voice search |
| 1.1.0 | Dec 2024 | Added equipment images from training video |
| 1.2.0 | Dec 2024 | Added HNFR logo, improved header design |

---

*Built with care for the EMTs and first responders of Harpswell Neck Fire & Rescue*
