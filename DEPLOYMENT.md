# HNFD Rescue Equipment Finder - Deployment Guide

**Version 2.15.0** | **Primary Hosting:** Vercel

## How The App Works

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    HNFD RESCUE APP                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────┐    ┌───────────┐    ┌───────────────┐       │
│  │   Voice   │───▶│  Search   │───▶│    Results    │       │
│  │   Input   │    │  Engine   │    │  + Images     │       │
│  └───────────┘    └───────────┘    └───────────────┘       │
│       │                                    │                │
│       │           ┌───────────┐           │                │
│       └──────────▶│  Text-to  │◀──────────┘                │
│                   │  Speech   │                            │
│                   └───────────┘                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  SERVICE WORKER - Caches everything for 100% offline       │
├─────────────────────────────────────────────────────────────┤
│  EMBEDDED DATABASE - All inventory data in app.js          │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Voice Recognition** - Web Speech API (built into iOS/Android browsers)
   - Works offline on most devices
   - Falls back to text search if unavailable

2. **Search Engine** - Client-side fuzzy matching
   - Searches item names, aliases, descriptions
   - Ranks by relevance, boosts critical items
   - Sub-millisecond response time

3. **Text-to-Speech** - Native SpeechSynthesis API
   - 100% offline
   - Speaks location, color, warnings

4. **Visual Reference** - Actual photos from training video
   - Shows exactly what each item looks like
   - Tap to enlarge for detail

5. **Service Worker** - Caches all assets
   - First load downloads everything
   - Subsequent loads work 100% offline

---

## Deployment Options

### Option 1: Vercel (Production - Recommended)

This project uses Vercel for production hosting with automatic GitHub deployments.

```bash
# Deploy to Vercel production
cd /Users/stuartkerr/Code/AMBUILANCE_INVENTORY
vercel --prod
```

**Live URLs:**
- Main App: https://hnfd-rescue.vercel.app
- Admin Portal: https://hnfd-rescue.vercel.app/admin.html

**Automatic Deployments:**
- Push to `main` branch triggers automatic deployment
- Preview deployments on pull requests

#### GitHub Pages
1. Push to GitHub repository
2. Go to Settings > Pages
3. Set source to `main` branch, `/public` folder
4. Access at `https://yourusername.github.io/repo-name`

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # Select public directory: public
firebase deploy
```

### Option 2: Local Development Server
```bash
cd /Users/stuartkerr/Code/AMBUILANCE_INVENTORY
npm start
# Opens at http://localhost:3000
```

### Option 3: Simple Python Server
```bash
cd /Users/stuartkerr/Code/AMBUILANCE_INVENTORY/public
python3 -m http.server 8000
# Opens at http://localhost:8000
```

---

## Installing as PWA on Mobile Devices

### iOS (Safari)
1. Open the deployed URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right
5. App icon appears on home screen

### Android (Chrome)
1. Open the deployed URL in Chrome
2. Tap the 3-dot menu
3. Tap "Add to Home Screen" or "Install App"
4. Confirm installation
5. App icon appears on home screen

### After Installation
- App works completely offline
- Opens like a native app (no browser UI)
- Can be used in areas with no cell service

---

## Testing Offline Functionality

### Browser DevTools Method
1. Open the app in Chrome
2. Open DevTools (F12)
3. Go to Network tab
4. Check "Offline" checkbox
5. Refresh page - should still work

### Airplane Mode Test
1. Install PWA on phone
2. Enable Airplane Mode
3. Open the app
4. Test voice search, text search, images

---

## File Structure
```
AMBUILANCE_INVENTORY/
├── public/                  # All deployable files
│   ├── index.html          # Main HTML + CSS
│   ├── app.js              # All app logic + embedded database
│   ├── sw.js               # Service worker for offline
│   ├── manifest.json       # PWA manifest
│   ├── icons/              # App icons
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── images/             # Equipment photos
│       ├── trauma_bag_adult.jpg
│       ├── cabinet_k_overview.jpg
│       ├── intubation_kit.jpg
│       ├── pediatric_bags.jpg
│       ├── drug_box.jpg
│       ├── lifepak_mounted.jpg
│       ├── drawer_n.jpg
│       ├── drawer_n_labeled.jpg
│       ├── oxygen_tanks.jpg
│       └── cabinet_d_aed.jpg
├── data/                   # Source data files
│   └── ambulance_inventory.json
├── server.js               # Local dev server
└── package.json            # Node.js config
```

---

## Updating the Inventory

### To Add/Modify Items
1. Edit the `INVENTORY_DATABASE` object in `public/app.js`
2. Each item has:
   - `id` - Unique identifier
   - `name` - Display name
   - `aliases` - Alternative search terms
   - `location` - Exact location description
   - `compartment` - Cabinet/drawer code
   - `color` - Visual identifier
   - `critical` - Is it critical?
   - `criticalRank` - 1-13 for critical items
   - `description` - What it does
   - `warning` - Critical safety info
   - `driverNote` - Driver-specific instructions
   - `image` - Path to photo

### To Add New Images
1. Take clear photo of item in context
2. Save to `public/images/` as JPG
3. Add `image: "/images/filename.jpg"` to item in `app.js`
4. Add path to `ASSETS_TO_CACHE` in `sw.js`
5. Update cache version in `sw.js`

### After Updates
- Increment version in `sw.js` (e.g., `v1.1.0` → `v1.2.0`)
- Redeploy
- Users need to refresh to get updates

---

## Troubleshooting

### Voice Not Working
- Check microphone permissions in browser settings
- Some browsers require HTTPS for microphone access
- Try text search as fallback

### Images Not Loading Offline
- Make sure images are in `ASSETS_TO_CACHE` in `sw.js`
- Clear cache and reload: DevTools > Application > Clear Storage

### App Not Updating
- Increment version in `sw.js`
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Or clear site data in browser settings

### PWA Not Installing
- Must be served over HTTPS (or localhost)
- Check manifest.json is valid
- Check all icon files exist

---

## Performance

- **First Load**: ~2MB (including all images)
- **Subsequent Loads**: Instant (from cache)
- **Search Speed**: <1ms
- **Offline**: 100% functional

---

## Security Notes

- No external API calls
- No data leaves the device
- No user tracking
- All data embedded in app
- Works completely air-gapped

---

## Support

For issues or updates:
- Source: Harpswell Neck Fire Department training materials
- Video: "Where Everything Is In The Ambulance"
- Data verified against official training content
