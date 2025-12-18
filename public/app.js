/**
 * Harpswell Neck Fire & Rescue - Equipment Finder
 * Voice-enabled search for HNFD ambulance equipment locations
 *
 * CRITICAL: This application is used by EMTs in life-threatening situations
 * All data is verified from official HNFD training materials
 *
 * Architecture (per Planningdoc.md):
 * - Speech-to-Text: Web Speech API (native) with Whisper fallback planned
 * - Vector Search: Client-side fuzzy matching (Ruvector for server-side)
 * - Text-to-Speech: Native SpeechSynthesis API (100% offline)
 * - Storage: IndexedDB for model caching, embedded JSON for inventory
 */

// ============================================================================
// COMPLETE INVENTORY DATABASE - EMBEDDED FOR 100% OFFLINE OPERATION
// Source: HNFD Training Video - "Where Everything Is In The Ambulance"
// ============================================================================
const INVENTORY_DATABASE = {
  items: [
    {
      id: "trauma_bag_adult",
      name: "Adult Trauma Bag",
      aliases: ["trauma back", "first-in bag", "first end bag", "trauma bag", "adult trauma", "red bag", "trauma"],
      searchText: "adult trauma bag trauma back first in first end bag red orange",
      location: "Cabinet K - Middle Drawer (FRONT)",
      compartment: "K",
      color: "Red/Orange",
      critical: true,
      criticalRank: 1,
      description: "Contains all trauma supplies for adult patients",
      notes: "Red tag = inventory tracking. If seal unbroken, contents unchanged.",
      image: "/images/trauma_bag_adult.jpg"
    },
    {
      id: "oxygen_kit_adult",
      name: "Adult Oxygen Kit",
      aliases: ["green oxygen bag", "O2 kit", "respiratory kit", "adult oxygen", "oxygen kit", "oxygen", "O2", "adult O2"],
      searchText: "adult oxygen kit O2 green bag respiratory oral nasal airways masks tank",
      location: "Cabinet K - Middle Drawer (BEHIND trauma bag)",
      compartment: "K",
      color: "GREEN bag",
      critical: true,
      criticalRank: 2,
      description: "Complete respiratory treatment kit with oxygen tank inside",
      contents: "Oral airways, nasal airways, oxygen masks, oxygen tank",
      image: "/images/cabinet_k_overview.jpg"
    },
    {
      id: "oxygen_kit_pediatric",
      name: "Pediatric Oxygen Kit",
      aliases: ["peds oxygen", "child oxygen kit", "pediatric O2", "kids oxygen", "peds O2", "child O2", "pediatric oxygen"],
      searchText: "pediatric peds child kids oxygen O2 kit blue respiratory",
      location: "Cabinet K - Lower Drawer (FRONT - oxygen first for kids!)",
      compartment: "K",
      color: "BLUE bag",
      critical: true,
      criticalRank: 3,
      description: "Pediatric respiratory kit - placed FIRST because children primarily have respiratory emergencies",
      notes: "Kids rarely have cardiac problems - respiratory is primary concern. Oxygen for children is PRIMARY importance.",
      image: "/images/pediatric_bags.jpg"
    },
    {
      id: "trauma_bag_pediatric",
      name: "Pediatric Trauma Bag",
      aliases: ["peds trauma", "pediatric first-in bag", "child trauma bag", "kids trauma", "peds bag", "pediatric trauma"],
      searchText: "pediatric peds child kids trauma bag first in blue ferno",
      location: "Cabinet K - Lower Drawer (BEHIND oxygen kit)",
      compartment: "K",
      color: "BLUE (FERNO brand)",
      critical: true,
      criticalRank: 4,
      description: "Pediatric trauma supplies",
      image: "/images/pediatric_bags.jpg"
    },
    {
      id: "intubation_kit",
      name: "Intubation Kit",
      aliases: ["airway kit", "intubation bag", "intubation", "tube kit", "airway"],
      searchText: "intubation kit airway bag tube advanced airway labeled",
      location: "Cabinet K - Top Shelf",
      compartment: "K",
      color: "Large bag - LABELED",
      critical: true,
      criticalRank: 5,
      description: "Complete intubation equipment for advanced airway management",
      image: "/images/intubation_kit.jpg"
    },
    {
      id: "iv_bag",
      name: "IV Kit",
      aliases: ["IV access kit", "IV supplies", "IV bag", "intravenous kit", "IV access"],
      searchText: "IV kit intravenous access supplies bag medication drug administration",
      location: "Cabinet K - Top Shelf",
      compartment: "K",
      critical: true,
      criticalRank: 6,
      description: "Everything to establish IV access - primarily for paramedic drug administration",
      notes: "Does NOT contain saline bags",
      image: "/images/cabinet_k_overview.jpg"
    },
    {
      id: "portable_aed",
      name: "Portable AED",
      aliases: ["AED", "defibrillator", "defib", "automated external defibrillator", "heart", "cardiac arrest"],
      searchText: "AED defibrillator defib automated external portable cardiac arrest heart black yellow green",
      location: "Cabinet K - Top Shelf (further back)",
      compartment: "K",
      color: "BLACK bag with RED 'AED' lettering, YELLOW-GREEN reflective strip",
      critical: true,
      criticalRank: 7,
      description: "Automated External Defibrillator for cardiac emergencies",
      notes: "Check for GREEN FLASH every 8-10 seconds = charged and ready",
      image: "/images/cabinet_d_aed.jpg"
    },
    {
      id: "drug_box",
      name: "Drug Box",
      aliases: ["orange box", "medication box", "orange drug box", "meds box", "drugs", "medications", "meds"],
      searchText: "drug box orange medication meds acetaminophen magnesium sulfate non-controlled",
      location: "Cabinet J (above Cabinet K, inside ambulance)",
      compartment: "J",
      color: "ORANGE - very distinctive",
      critical: true,
      criticalRank: 8,
      description: "Contains non-controlled drugs: acetaminophen, magnesium sulfate, etc.",
      driverNote: "ORANGE BOX = DRUG BOX. That's all you need to know.",
      notes: "Blue tags track drug accountability",
      image: "/images/drug_box.jpg"
    },
    {
      id: "portable_suction",
      name: "Portable Suction",
      aliases: ["suction", "portable suction unit", "battery suction", "suction unit", "suctioning"],
      searchText: "portable suction battery scene suctioning unit",
      location: "Cabinet J",
      compartment: "J",
      critical: true,
      criticalRank: 9,
      description: "Battery-operated suction for on-scene use",
      warning: "CRITICAL: Cord plugged into cigarette lighter at back of cabinet. MUST UNPLUG before removing! Does NOT detach at unit. Like pulling away from gas pump with nozzle in tank!",
      notes: "One of THREE suction types on board",
      image: "/images/suction.jpg"
    },
    {
      id: "glucometer",
      name: "Glucometer",
      aliases: ["glucose meter", "blood sugar meter", "diabetic meter", "blood glucose", "sugar", "diabetes", "diabetic"],
      searchText: "glucometer glucose meter blood sugar diabetic diabetes black pouch",
      location: "Drawer N - Always in exact same spot",
      compartment: "N",
      color: "Small BLACK box/pouch",
      critical: true,
      criticalRank: 10,
      description: "Checks blood glucose levels in diabetic patients",
      driverNote: "Little black box, little black pouch - always in same spot",
      image: "/images/glucometer.jpg"
    },
    {
      id: "narcan",
      name: "Narcan",
      aliases: ["naloxone", "opioid reversal", "overdose medication", "narcan spray", "overdose", "opioid"],
      searchText: "narcan naloxone opioid overdose reversal medication nasal atomizer syringe",
      location: "Drawer N - readily accessible, 3 on board",
      compartment: "N",
      critical: true,
      criticalRank: 11,
      description: "Opioid overdose reversal medication - delivered intranasally",
      warning: "CRITICAL: Nasal ATOMIZER must come with syringe - they are TAPED TOGETHER. Syringe alone is useless! Atomizer screws onto syringe tip.",
      notes: "Old packaging: orange container. New packaging: clear tube (can see syringe). Additional Narcan in Drug Box but Drawer N is fastest.",
      image: "/images/narcan.jpg"
    },
    {
      id: "spare_oxygen_tanks",
      name: "Spare Oxygen Tanks",
      aliases: ["O2 tanks", "spare O2", "backup oxygen", "oxygen cylinders", "oxygen bottles", "spare tanks", "extra oxygen"],
      searchText: "spare oxygen O2 tanks bottles cylinders backup extra matheson green aluminum",
      location: "Next to steps on side entry of ambulance",
      compartment: "oxygen_storage",
      critical: true,
      criticalRank: 12,
      description: "2 spare tanks in holder, plus 1 each in adult and pediatric oxygen kits (4 total)",
      warning: "SQUEEZE brackets together to release tank (counterintuitive). At 15 L/min, tank only lasts few minutes.",
      notes: "New Matheson tanks: green top, aluminum, single valve operation. Old steel tanks: two-step process - open valve first, then set flow.",
      image: "/images/oxygen_tanks.jpg"
    },
    {
      id: "lifepak_15",
      name: "LifePak 15",
      aliases: ["life pack", "monitor", "cardiac monitor", "lifepak", "life pak", "heart monitor", "vitals"],
      searchText: "lifepak life pack 15 monitor cardiac vitals EKG pulse ox blood pressure expensive",
      location: "Mounted position in patient compartment - obvious location",
      compartment: "lifepak_mount",
      critical: true,
      criticalRank: 13,
      description: "Cardiac monitor/defibrillator - $42,000-$62,000 - HANDLE WITH CARE",
      driverNote: "Press GREEN button ONCE briefly when requested to turn on. Do NOT shut off after hospital - EMT needs code summary printout.",
      notes: "Carry with sensitive side (screen) against body. Has extra BP cuffs and batteries on other side. Must press AND HOLD to shut off (prevents accidental shutdown).",
      image: "/images/lifepak_mounted.jpg"
    },
    {
      id: "lucas_device",
      name: "LUCAS Device",
      aliases: ["LUCAS", "CPR machine", "mechanical CPR", "automatic CPR", "lucas cpr", "chest compressions"],
      searchText: "lucas device CPR machine mechanical automatic chest compressions MC2",
      location: "MC2 back seat - secured with seatbelt only",
      compartment: "mc2",
      critical: true,
      criticalRank: 13,
      description: "Mechanical CPR device - delivers consistent chest compressions",
      notes: "Hit seatbelt release to access. Purchased by Town of Harpswell. MC2 carries it because they're usually first on scene (OBI is 23 minutes away).",
      image: "/images/lucas_device.jpg"
    },
    {
      id: "saline_bags",
      name: "Saline Bags",
      aliases: ["IV saline", "normal saline", "NS", "saline solution", "IV fluid", "saline", "fluids", "IV fluids"],
      searchText: "saline bags IV fluid normal NS solution hydration warm heated",
      location: "Cabinet D - 6 bags available",
      compartment: "D",
      description: "IV fluid for hydration - moved from K for easier access",
      warning: "MUST grab PRIMARY SET (IV tubing) with saline bag - bag is USELESS without tubing!",
      notes: "Warm saline in heated IV warmer during winter for hypothermic patients. Cabinet doors fold DOWN for easier access.",
      image: "/images/saline_bags.jpg"
    },
    {
      id: "primary_sets",
      name: "Primary Sets",
      aliases: ["IV tubing", "IV administration set", "drip set", "IV line", "tubing"],
      searchText: "primary sets IV tubing administration drip line saline",
      location: "Cabinet D - right next to saline bags",
      compartment: "D",
      description: "IV tubing with needle for saline bags - required to administer saline",
      image: "/images/primary_sets.jpg"
    },
    {
      id: "onboard_suction",
      name: "Onboard Suction",
      aliases: ["main suction", "built-in suction", "vacuum suction", "stretcher suction"],
      searchText: "onboard main built-in vacuum suction stretcher transport",
      location: "Built into patient compartment",
      compartment: "onboard",
      description: "Vacuum pump driven suction for patients on stretcher during transport"
    }
  ],
  compartments: {
    "K": {
      name: "Cabinet K",
      description: "Main critical equipment - 7 of 12 critical items",
      access: "OUTSIDE door on ambulance side (primary on-scene access) or glass doors from inside"
    },
    "J": {
      name: "Cabinet J",
      description: "Above Cabinet K inside ambulance",
      access: "Inside patient compartment"
    },
    "N": {
      name: "Drawer N",
      description: "EMT medications and diagnostic equipment",
      access: "Inside patient compartment"
    },
    "D": {
      name: "Cabinet D",
      description: "Saline and IV supplies",
      access: "Inside - walk around foot of stretcher. Doors fold DOWN for easier access."
    },
    "oxygen_storage": {
      name: "Oxygen Tank Storage",
      description: "Spare oxygen tanks",
      access: "Next to steps on side entry"
    },
    "lifepak_mount": {
      name: "LifePak Mount",
      description: "Cardiac monitor station",
      access: "Mounted in patient compartment - obvious position"
    },
    "mc2": {
      name: "MC2 Vehicle",
      description: "Chase vehicle",
      access: "Back/passenger seat"
    }
  }
};

// ============================================================================
// INTELLIGENT VOICE MATCHING - Restrict to valid equipment only
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching voice input to equipment names
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Build list of ALL valid search terms from inventory
 * Returns array of {term, itemId, type} objects
 */
function buildValidSearchTerms() {
  const validTerms = [];

  for (const item of INVENTORY_DATABASE.items) {
    // Add the official name
    validTerms.push({
      term: item.name.toLowerCase(),
      itemId: item.id,
      type: 'name',
      priority: 100
    });

    // Add all aliases
    for (const alias of item.aliases || []) {
      validTerms.push({
        term: alias.toLowerCase(),
        itemId: item.id,
        type: 'alias',
        priority: 90
      });
    }

    // Add individual words from searchText for multi-word queries
    if (item.searchText) {
      const words = item.searchText.toLowerCase().split(/\s+/)
        .filter(w => w.length > 2); // Only words longer than 2 chars

      for (const word of words) {
        validTerms.push({
          term: word,
          itemId: item.id,
          type: 'keyword',
          priority: 50
        });
      }
    }
  }

  return validTerms;
}

// Build search terms once at startup
const VALID_SEARCH_TERMS = buildValidSearchTerms();

/**
 * Smart voice matcher - Find closest valid equipment term
 * Prevents misheard words like "sailing" instead of "saline"
 *
 * @param {string} spokenText - Raw text from speech recognition
 * @returns {string} - Best matching equipment term or original text
 */
function matchToValidEquipment(spokenText) {
  const cleaned = spokenText.toLowerCase().trim()
    .replace(/^(where is the |where's the |i need |get me |find |where is |where's |the )/gi, '')
    .trim();

  if (!cleaned) return spokenText;

  console.log('[Voice Match] Input:', cleaned);

  // Split into words for multi-word matching
  const spokenWords = cleaned.split(/\s+/);
  let bestMatches = [];

  // For each spoken word, find best match in valid terms
  for (const spokenWord of spokenWords) {
    if (spokenWord.length < 2) continue; // Skip very short words

    let bestMatch = null;
    let bestScore = Infinity;

    for (const validTerm of VALID_SEARCH_TERMS) {
      // Calculate similarity score (lower is better)
      const distance = levenshteinDistance(spokenWord, validTerm.term);
      const lengthDiff = Math.abs(spokenWord.length - validTerm.term.length);

      // Penalize large length differences
      const score = distance + (lengthDiff * 0.5);

      // Bonus for exact matches
      const exactMatch = validTerm.term === spokenWord ? -100 : 0;
      const finalScore = score + exactMatch;

      // Only consider matches within reasonable distance
      const maxAllowedDistance = Math.max(2, Math.floor(spokenWord.length * 0.4));

      if (distance <= maxAllowedDistance && finalScore < bestScore) {
        bestScore = finalScore;
        bestMatch = {
          original: spokenWord,
          matched: validTerm.term,
          itemId: validTerm.itemId,
          type: validTerm.type,
          priority: validTerm.priority,
          distance: distance,
          score: finalScore
        };
      }
    }

    if (bestMatch) {
      bestMatches.push(bestMatch);
    }
  }

  if (bestMatches.length === 0) {
    console.log('[Voice Match] No valid matches found');
    return cleaned; // Return cleaned original if no matches
  }

  // Sort by priority and score
  bestMatches.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return a.score - b.score;
  });

  // Use the best match
  const topMatch = bestMatches[0];

  console.log('[Voice Match] Best match:', {
    spoken: topMatch.original,
    matched: topMatch.matched,
    type: topMatch.type,
    distance: topMatch.distance
  });

  // If we have a very close match, use it
  if (topMatch.distance <= 2) {
    return topMatch.matched;
  }

  // For slightly fuzzy matches, combine all matched terms
  const matchedTerms = bestMatches
    .filter(m => m.distance <= 3)
    .map(m => m.matched)
    .join(' ');

  console.log('[Voice Match] Final query:', matchedTerms || topMatch.matched);
  return matchedTerms || topMatch.matched;
}

// ============================================================================
// VERSION & AUTO-UPDATE SYSTEM
// ============================================================================
const APP_VERSION = '2.3.0';
const VERSION_CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour when online

// Check for updates automatically
async function checkForUpdates(showIfCurrent = false) {
  if (!navigator.onLine) return;

  try {
    // Add cache-busting parameter
    const response = await fetch(`/version.json?t=${Date.now()}`);
    if (!response.ok) return;

    const data = await response.json();
    const serverVersion = data.version;
    const currentVersion = APP_VERSION;

    if (serverVersion !== currentVersion) {
      // New version available
      showUpdateNotification(serverVersion, data.changelog);
    } else if (showIfCurrent) {
      showVersionInfo('App is up to date!');
    }
  } catch (e) {
    console.log('[Update] Check failed (offline?):', e.message);
  }
}

function showUpdateNotification(newVersion, changelog) {
  // Remove any existing notification
  const existing = document.getElementById('update-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.innerHTML = `
    <div class="update-content">
      <div class="update-header">
        <span class="update-icon">🔄</span>
        <strong>Update Available: v${newVersion}</strong>
      </div>
      <div class="update-changes">
        ${changelog ? changelog.slice(0, 3).map(c => `• ${c}`).join('<br>') : ''}
      </div>
      <div class="update-buttons">
        <button class="update-btn update-now" onclick="applyUpdate()">Update Now</button>
        <button class="update-btn update-later" onclick="dismissUpdate()">Later</button>
      </div>
    </div>
  `;
  document.body.appendChild(notification);

  // Auto-show
  setTimeout(() => notification.classList.add('visible'), 100);
}

function showVersionInfo(message) {
  const statusText = document.getElementById('status-text');
  const originalText = statusText.textContent;
  statusText.textContent = message;
  setTimeout(() => {
    statusText.textContent = originalText;
  }, 3000);
}

async function applyUpdate() {
  const notification = document.getElementById('update-notification');
  if (notification) {
    notification.querySelector('.update-content').innerHTML = `
      <div class="update-header">
        <span class="update-icon">⏳</span>
        <strong>Updating...</strong>
      </div>
    `;
  }

  try {
    // Clear the service worker cache
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage('skipWaiting');
      }

      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // Reload the page
    window.location.reload(true);
  } catch (e) {
    console.error('[Update] Failed:', e);
    window.location.reload(true);
  }
}

function dismissUpdate() {
  const notification = document.getElementById('update-notification');
  if (notification) {
    notification.classList.remove('visible');
    setTimeout(() => notification.remove(), 300);
  }
  // Remember dismissal for this session
  sessionStorage.setItem('hnfd_update_dismissed', 'true');
}

// Schedule periodic update checks
function startUpdateChecker() {
  // Check on startup (after 5 seconds)
  setTimeout(() => {
    if (!sessionStorage.getItem('hnfd_update_dismissed')) {
      checkForUpdates();
    }
  }, 5000);

  // Check periodically
  setInterval(() => {
    if (!sessionStorage.getItem('hnfd_update_dismissed')) {
      checkForUpdates();
    }
  }, VERSION_CHECK_INTERVAL);
}

// ============================================================================
// APPLICATION STATE
// ============================================================================
let currentResult = null;
let isListening = false;
let lastSearchWasVoice = false; // Track if search came from voice
let recognition = null;
let synthesis = window.speechSynthesis;
let modelLoaded = false;
let recentSearches = JSON.parse(localStorage.getItem('hnfd_recent_searches') || '[]');
let nightMode = localStorage.getItem('hnfd_night_mode') === 'true';
let audioInitialized = false;
let micPermissionRequested = localStorage.getItem('hnfd_mic_permission_requested') === 'true';

// ============================================================================
// HAPTIC FEEDBACK - Better tactile confirmation in stressful situations
// ============================================================================
function hapticFeedback(type = 'light') {
  if ('vibrate' in navigator) {
    switch(type) {
      case 'light': navigator.vibrate(10); break;
      case 'medium': navigator.vibrate(25); break;
      case 'heavy': navigator.vibrate([50, 30, 50]); break;
      case 'success': navigator.vibrate([10, 50, 10]); break;
    }
  }
}

// ============================================================================
// RECENT SEARCHES - Quick re-access to previous queries
// ============================================================================
function addToRecentSearches(query) {
  query = query.trim().toLowerCase();
  if (!query || query.length < 2) return;

  // Remove if already exists, add to front
  recentSearches = recentSearches.filter(s => s.toLowerCase() !== query);
  recentSearches.unshift(query);

  // Keep only last 5
  recentSearches = recentSearches.slice(0, 5);
  localStorage.setItem('hnfd_recent_searches', JSON.stringify(recentSearches));
  updateRecentSearchesUI();
}

function updateRecentSearchesUI() {
  const container = document.getElementById('recent-searches');
  if (!container) return;

  if (recentSearches.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = `
    <div class="recent-label">Recent:</div>
    ${recentSearches.map(s => `<button class="recent-btn" data-search="${s}">${s}</button>`).join('')}
  `;

  // Add click handlers
  container.querySelectorAll('.recent-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      hapticFeedback('light');
      const query = btn.dataset.search;
      searchInput.value = query;
      search(query);
    });
  });
}

// ============================================================================
// NIGHT MODE - Reduce eye strain in dark ambulance
// ============================================================================
function toggleNightMode() {
  nightMode = !nightMode;
  localStorage.setItem('hnfd_night_mode', nightMode);
  applyNightMode();
  hapticFeedback('light');
}

function applyNightMode() {
  if (nightMode) {
    document.body.classList.add('night-mode');
  } else {
    document.body.classList.remove('night-mode');
  }

  const toggle = document.getElementById('night-toggle');
  if (toggle) {
    toggle.textContent = nightMode ? '☀️' : '🌙';
    toggle.title = nightMode ? 'Switch to day mode' : 'Switch to night mode';
  }
}

// ============================================================================
// EMERGENCY MODE - Show all critical items at once
// ============================================================================
function showEmergencyMode() {
  hapticFeedback('heavy');
  const criticalItems = INVENTORY_DATABASE.items
    .filter(item => item.critical)
    .sort((a, b) => (a.criticalRank || 99) - (b.criticalRank || 99));

  displayResults(criticalItems, 'EMERGENCY - All Critical Items');

  // Scroll to results
  document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================================
// DOM ELEMENTS
// ============================================================================
const voiceBtn = document.getElementById('voiceBtn');
const voiceCancelBtn = document.getElementById('voiceCancelBtn');
const voiceIcon = document.getElementById('voiceIcon');
const voiceLabel = document.getElementById('voiceLabel');
const transcript = document.getElementById('transcript');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('results');
const speakBtn = document.getElementById('speakBtn');
const statusText = document.getElementById('status-text');

// ============================================================================
// SPEECH RECOGNITION (Web Speech API - works offline on iOS/Android)
// ============================================================================
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceBtn.style.display = 'none';
    voiceLabel.textContent = 'Voice not supported - use text search';
    console.log('[Speech] Web Speech API not available');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 3;

  recognition.onstart = () => {
    isListening = true;
    voiceBtn.classList.add('listening');
    voiceIcon.textContent = '🔴';
    voiceLabel.textContent = 'Listening... speak now';
    transcript.textContent = '';
    statusText.textContent = 'Listening';
    // Show cancel button when listening
    voiceCancelBtn.style.display = 'flex';
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    transcript.textContent = finalTranscript || interimTranscript;

    if (finalTranscript) {
      console.log('[Speech] Raw input:', finalTranscript);

      // CRITICAL: Match spoken text to valid equipment ONLY
      // Prevents misheard words like "sailing" instead of "saline"
      const matchedEquipment = matchToValidEquipment(finalTranscript);
      console.log('[Speech] Matched to:', matchedEquipment);

      lastSearchWasVoice = true; // Mark this as voice search
      search(matchedEquipment);
    }
  };

  recognition.onerror = (event) => {
    console.error('[Speech] Recognition error:', event.error);
    stopListening();

    if (event.error === 'no-speech') {
      transcript.textContent = 'No speech detected. Tap to try again.';
    } else if (event.error === 'not-allowed') {
      transcript.textContent = 'Microphone access denied. Please enable in settings.';
    } else if (event.error === 'network') {
      // Offline - this is expected
      transcript.textContent = 'Voice requires network. Use text search offline.';
    }
  };

  recognition.onend = () => {
    stopListening();
  };

  console.log('[Speech] Web Speech API initialized');
}

function startListening() {
  if (!recognition) return;

  try {
    recognition.start();
  } catch (e) {
    console.error('[Speech] Could not start recognition:', e);
  }
}

function stopListening() {
  isListening = false;
  voiceBtn.classList.remove('listening');
  voiceIcon.textContent = '🎤';
  voiceLabel.textContent = 'Tap to ask where something is';
  statusText.textContent = 'Ready';
  // Hide cancel button when not listening
  voiceCancelBtn.style.display = 'none';
}

function cancelListening() {
  console.log('[Speech] Cancelled by user');
  if (recognition && isListening) {
    recognition.stop(); // This will trigger onend which calls stopListening()
  }
  transcript.textContent = 'Cancelled';
  setTimeout(() => {
    transcript.textContent = '';
  }, 1500);
  hapticFeedback('light');
}

// ============================================================================
// SEARCH FUNCTION - Enhanced with fuzzy matching and synonyms
// ============================================================================
function search(query) {
  query = query.toLowerCase().trim();

  // Remove common filler words from speech
  query = query.replace(/^(where is the |where's the |i need |get me |find |where is |where's |the )/gi, '').trim();

  if (!query) {
    resultsSection.innerHTML = '';
    return;
  }

  console.log('[Search] Query:', query);

  // Score each item based on match quality
  const scoredResults = INVENTORY_DATABASE.items.map(item => {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Exact name match (highest priority)
    if (item.name.toLowerCase() === queryLower) {
      score += 200;
    } else if (item.name.toLowerCase().includes(queryLower)) {
      score += 100;
    }

    // Exact alias match
    for (const alias of item.aliases || []) {
      const aliasLower = alias.toLowerCase();
      if (aliasLower === queryLower) {
        score += 150;
      } else if (aliasLower.includes(queryLower) || queryLower.includes(aliasLower)) {
        score += 80;
      }
    }

    // Search text matching (includes expanded terms)
    if (item.searchText) {
      const searchWords = item.searchText.toLowerCase().split(/\s+/);
      const queryWords = queryLower.split(/\s+/);

      for (const qw of queryWords) {
        if (qw.length < 2) continue;
        for (const sw of searchWords) {
          if (sw === qw) {
            score += 40;
          } else if (sw.includes(qw) || qw.includes(sw)) {
            score += 20;
          }
        }
      }
    }

    // Word-by-word matching against name and aliases
    const queryWords = queryLower.split(/\s+/);
    const itemWords = [
      item.name.toLowerCase(),
      ...(item.aliases || []).map(a => a.toLowerCase()),
      (item.description || '').toLowerCase()
    ].join(' ').split(/\s+/);

    for (const qw of queryWords) {
      if (qw.length < 2) continue;
      for (const iw of itemWords) {
        if (iw === qw) {
          score += 25;
        } else if (iw.includes(qw) || qw.includes(iw)) {
          score += 10;
        }
      }
    }

    // Boost critical items slightly
    if (item.critical) {
      score += 5;
    }

    return { item, score };
  });

  // Filter and sort by score
  const results = scoredResults
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => r.item);

  console.log('[Search] Results:', results.map(r => `${r.name} (${r.id})`));

  // Track successful searches
  if (results.length > 0) {
    addToRecentSearches(query);
    hapticFeedback('success');
  }

  displayResults(results, query);
}

// ============================================================================
// DISPLAY RESULTS
// ============================================================================
function displayResults(results, query) {
  if (results.length === 0) {
    resultsSection.innerHTML = `
      <div class="result-card">
        <div class="result-name">No matches found</div>
        <div class="result-details">
          Could not find "${query}". Try different words or ask the EMT for help.
          <br><br>
          <strong>Common searches:</strong> AED, narcan, oxygen, trauma bag, drug box, suction, glucometer, saline
        </div>
      </div>
    `;
    currentResult = null;
    speakBtn.classList.remove('visible');
    return;
  }

  currentResult = results[0];
  speakBtn.classList.add('visible');

  resultsSection.innerHTML = results.map((item, index) => {
    const compartment = INVENTORY_DATABASE.compartments[item.compartment] || {};

    return `
      <div class="result-card ${item.critical ? 'critical' : ''}" ${index === 0 ? 'id="topResult"' : ''}>
        <div class="result-header">
          <div class="result-name">${item.name}</div>
          ${item.critical ? `<span class="result-badge badge-critical">Critical #${item.criticalRank}</span>` : ''}
        </div>

        ${item.image ? `
          <div class="result-image-container">
            <img src="${item.image}" alt="${item.name}" class="result-image" onclick="toggleImageZoom(this)" />
            <div class="image-hint">Tap image to enlarge</div>
          </div>
        ` : ''}

        <div class="result-location">
          <span class="location-icon">📍</span>
          <span>${item.location}</span>
        </div>

        ${item.color ? `<div class="result-color">Color: ${item.color}</div>` : ''}

        <div class="result-details">
          ${item.description || ''}
          ${item.driverNote ? `<br><br><strong>Driver Note:</strong> ${item.driverNote}` : ''}
          ${item.notes ? `<br><br>${item.notes}` : ''}
        </div>

        ${item.warning ? `<div class="result-warning">⚠️ ${item.warning}</div>` : ''}

        ${compartment.access ? `
          <div class="result-details" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
            <strong>Access:</strong> ${compartment.access}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  // Highlight corresponding compartment
  document.querySelectorAll('.map-item').forEach(el => {
    el.classList.remove('highlighted');
    if (el.dataset.compartment === currentResult.compartment) {
      el.classList.add('highlighted');
    }
  });

  // Auto-speak result if search came from voice input
  // IMPORTANT: Always speak results after voice search (life-threatening situations)
  if (lastSearchWasVoice && currentResult) {
    lastSearchWasVoice = false; // Reset flag
    // Small delay to ensure UI is updated and isListening is false
    setTimeout(() => {
      if (currentResult) { // Double-check result still exists
        initializeAudio(); // Ensure audio is unlocked
        speakResult();
      }
    }, 100);
  }
}

// ============================================================================
// TEXT-TO-SPEECH (100% Offline via native SpeechSynthesis)
// ============================================================================
let voicesLoaded = false;
let voiceLoadAttempts = 0;

function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    const voices = synthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      console.log('[TTS] Voices available:', voices.length);
      resolve(voices);
      return;
    }

    // Android Chrome requires waiting for voiceschanged event
    if (voiceLoadAttempts < 3) {
      voiceLoadAttempts++;
      console.log('[TTS] Waiting for voices... attempt', voiceLoadAttempts);

      const timeout = setTimeout(() => {
        synthesis.removeEventListener('voiceschanged', voicesHandler);
        resolve(synthesis.getVoices());
      }, 1000);

      const voicesHandler = () => {
        clearTimeout(timeout);
        voicesLoaded = true;
        console.log('[TTS] Voices loaded:', synthesis.getVoices().length);
        resolve(synthesis.getVoices());
      };

      synthesis.addEventListener('voiceschanged', voicesHandler, { once: true });
    } else {
      resolve(voices);
    }
  });
}

async function speakResult() {
  if (!currentResult || !synthesis) {
    console.error('[TTS] Missing synthesis or result');
    return;
  }

  // Cancel any ongoing speech
  synthesis.cancel();

  // Ensure voices are loaded (critical for Android)
  const voices = await ensureVoicesLoaded();

  if (voices.length === 0) {
    console.error('[TTS] No voices available');
    statusText.textContent = 'Audio unavailable';
    setTimeout(() => statusText.textContent = 'Ready', 2000);
    return;
  }

  const item = currentResult;
  let text = `${item.name}. `;
  text += `Located in ${item.location}. `;

  if (item.color) {
    text += `It is ${item.color}. `;
  }

  if (item.warning) {
    text += `Warning: ${item.warning.replace(/CRITICAL:|!/g, '')}. `;
  }

  if (item.driverNote) {
    text += item.driverNote;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1;
  utterance.volume = 1;

  // Select best available voice
  const preferredVoice = voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Enhanced') || v.name.includes('Premium'))
  ) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];

  if (preferredVoice) {
    utterance.voice = preferredVoice;
    console.log('[TTS] Using voice:', preferredVoice.name);
  }

  utterance.onstart = () => {
    speakBtn.classList.add('speaking');
    statusText.textContent = 'Speaking';
    console.log('[TTS] Speaking started');
  };

  utterance.onend = () => {
    speakBtn.classList.remove('speaking');
    statusText.textContent = 'Ready';
    console.log('[TTS] Speaking ended');
  };

  utterance.onerror = (e) => {
    console.error('[TTS] Error:', e.error, e);
    speakBtn.classList.remove('speaking');
    statusText.textContent = 'Audio failed - tap speaker to retry';
    setTimeout(() => statusText.textContent = 'Ready', 3000);
  };

  try {
    synthesis.speak(utterance);
  } catch (e) {
    console.error('[TTS] Exception:', e);
    statusText.textContent = 'Audio failed';
    setTimeout(() => statusText.textContent = 'Ready', 2000);
  }
}

// ============================================================================
// IMAGE ZOOM FUNCTION
// ============================================================================
function toggleImageZoom(imgElement) {
  // Create or get overlay
  let overlay = document.getElementById('image-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'image-overlay';
    overlay.innerHTML = `
      <div class="overlay-content">
        <img src="" alt="Enlarged view" />
        <button class="close-overlay">✕ Close</button>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('close-overlay')) {
        overlay.classList.remove('visible');
      }
    });
    document.body.appendChild(overlay);
  }

  const overlayImg = overlay.querySelector('img');
  overlayImg.src = imgElement.src;
  overlayImg.alt = imgElement.alt;
  overlay.classList.add('visible');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================
voiceBtn.addEventListener('click', () => {
  hapticFeedback('medium');
  if (isListening) {
    recognition?.stop();
  } else {
    startListening();
  }
});

// Cancel button - stop listening and clear transcript
voiceCancelBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent triggering voice section click
  hapticFeedback('light');
  cancelListening();
});

// Large tap zone - anywhere on voice section starts listening
document.querySelector('.voice-section')?.addEventListener('click', (e) => {
  // Don't trigger if clicking the buttons directly
  if (e.target !== voiceBtn && e.target !== voiceCancelBtn && !isListening) {
    startListening();
  }
});

searchBtn.addEventListener('click', () => {
  search(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    search(searchInput.value);
  }
});

// Real-time search as user types
searchInput.addEventListener('input', (e) => {
  if (e.target.value.length >= 2) {
    search(e.target.value);
  }
});

speakBtn.addEventListener('click', () => {
  initializeAudio();  // Ensure audio is unlocked on iOS
  speakResult();
});

// Quick access buttons
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    hapticFeedback('light');
    const query = btn.dataset.search;
    searchInput.value = query;
    search(query);
  });
});

// Emergency mode button
document.getElementById('emergency-btn')?.addEventListener('click', showEmergencyMode);

// Night mode toggle
document.getElementById('night-toggle')?.addEventListener('click', toggleNightMode);

// Compartment map clicks
document.querySelectorAll('.map-item').forEach(el => {
  el.addEventListener('click', () => {
    const compartmentId = el.dataset.compartment;
    const items = INVENTORY_DATABASE.items.filter(i => i.compartment === compartmentId);
    if (items.length > 0) {
      displayResults(items, `Compartment ${compartmentId}`);
    }
  });
});

// ============================================================================
// OFFLINE DETECTION
// ============================================================================
window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  statusText.textContent = 'Online';
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  statusText.textContent = 'Offline - All features available';
});

if (!navigator.onLine) {
  document.body.classList.add('offline');
  statusText.textContent = 'Offline';
}

// ============================================================================
// INITIALIZATION
// ============================================================================
initSpeechRecognition();

// Initialize audio on first user interaction (required for iOS)
function initializeAudio() {
  if (audioInitialized || !synthesis) return;

  try {
    // Create a silent utterance to "unlock" audio on iOS
    const utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0;
    synthesis.speak(utterance);
    audioInitialized = true;
    console.log('[TTS] Audio initialized');
  } catch (e) {
    console.error('[TTS] Audio init failed:', e);
  }
}

// Request microphone permission on first interaction (one-time setup)
function requestMicrophonePermission() {
  if (micPermissionRequested || !recognition) return;

  try {
    // Attempt to start and immediately stop recognition
    // This triggers the browser's permission prompt
    recognition.start();
    recognition.stop();
    localStorage.setItem('hnfd_mic_permission_requested', 'true');
    micPermissionRequested = true;
    console.log('[Mic] Permission requested');
  } catch (e) {
    console.error('[Mic] Permission request failed:', e);
  }
}

// Load voices (needed for some browsers)
if (synthesis) {
  synthesis.onvoiceschanged = () => {
    console.log('[TTS] Voices loaded:', synthesis.getVoices().length);
  };
  // Trigger voice loading
  synthesis.getVoices();

  // Initialize audio AND request mic permission on any user interaction
  const initEvents = ['click', 'touchstart', 'keydown'];
  initEvents.forEach(event => {
    document.addEventListener(event, () => {
      initializeAudio();
      requestMicrophonePermission();
    }, { once: true, passive: true });
  });
}

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[SW] Service Worker registered');

        // Check for updates
        reg.addEventListener('updatefound', () => {
          console.log('[SW] New version available');
        });
      })
      .catch(err => console.error('[SW] Registration failed:', err));
  });
}

// Initialize night mode
applyNightMode();

// Initialize recent searches UI
updateRecentSearchesUI();

// Start update checker
startUpdateChecker();

// Display version in UI
const versionDisplay = document.getElementById('version-display');
if (versionDisplay) {
  versionDisplay.textContent = `v${APP_VERSION}`;
  versionDisplay.addEventListener('click', () => checkForUpdates(true));
}

// ============================================================================
// PWA INSTALL PROMPT - Guide users to install as app
// ============================================================================
let deferredPrompt = null;

// Capture the install prompt event (Android Chrome)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install prompt after a short delay
  setTimeout(showInstallPrompt, 3000);
});

function showInstallPrompt() {
  // Don't show if already installed or dismissed
  if (localStorage.getItem('hnfd_install_dismissed')) return;
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (window.navigator.standalone === true) return; // iOS standalone

  // Detect platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  if (!isMobile) return; // Only show on mobile

  // Remove any existing prompt
  const existing = document.getElementById('install-prompt');
  if (existing) existing.remove();

  const prompt = document.createElement('div');
  prompt.id = 'install-prompt';

  if (isIOS) {
    prompt.innerHTML = `
      <div class="install-content">
        <div class="install-header">
          <span class="install-icon">📲</span>
          <strong>Install HNFD Rescue App</strong>
        </div>
        <div class="install-instructions">
          <p>For offline access anywhere:</p>
          <ol>
            <li>Tap the <strong>Share</strong> button <span class="ios-share">⬆️</span></li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Tap <strong>"Add"</strong> in the top right</li>
          </ol>
        </div>
        <div class="install-buttons">
          <button class="install-btn install-dismiss" onclick="dismissInstall()">Got It</button>
        </div>
      </div>
    `;
  } else {
    // Android / Chrome
    prompt.innerHTML = `
      <div class="install-content">
        <div class="install-header">
          <span class="install-icon">📲</span>
          <strong>Install HNFD Rescue App</strong>
        </div>
        <div class="install-instructions">
          <p>Install for offline access anywhere - works without cell service!</p>
        </div>
        <div class="install-buttons">
          <button class="install-btn install-now" onclick="installPWA()">Install App</button>
          <button class="install-btn install-dismiss" onclick="dismissInstall()">Not Now</button>
        </div>
      </div>
    `;
  }

  document.body.appendChild(prompt);
  setTimeout(() => prompt.classList.add('visible'), 100);
}

async function installPWA() {
  if (!deferredPrompt) {
    // Fallback - show manual instructions
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isAndroid) {
      alert('Tap the menu (⋮) in your browser and select "Add to Home Screen" or "Install App"');
    }
    dismissInstall();
    return;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log('[PWA] Install outcome:', outcome);
  deferredPrompt = null;
  dismissInstall();

  if (outcome === 'accepted') {
    localStorage.setItem('hnfd_install_dismissed', 'true');
  }
}

function dismissInstall() {
  const prompt = document.getElementById('install-prompt');
  if (prompt) {
    prompt.classList.remove('visible');
    setTimeout(() => prompt.remove(), 300);
  }
  localStorage.setItem('hnfd_install_dismissed', 'true');
}

// Check if running as installed app
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App was installed');
  localStorage.setItem('hnfd_install_dismissed', 'true');
});

// Show install prompt for iOS users after delay (no beforeinstallprompt event)
if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.navigator.standalone) {
  if (!localStorage.getItem('hnfd_install_dismissed')) {
    setTimeout(showInstallPrompt, 5000);
  }
}

// Log startup
console.log('[HNFD] Harpswell Neck Fire & Rescue - Equipment Finder initialized');
console.log('[HNFD] Version:', APP_VERSION);
console.log('[HNFD] Items in database:', INVENTORY_DATABASE.items.length);
console.log('[HNFD] Offline:', !navigator.onLine);
console.log('[HNFD] Night mode:', nightMode);
console.log('[HNFD] Recent searches:', recentSearches.length);
// ============================================================================
// ADMIN MODE - Equipment Management System
// ============================================================================

const ADMIN_PASSWORD = 'hnfd2026admin'; // Admin access password
const ADMIN_STORAGE_KEY = 'hnfd_equipment_custom';
let adminAuthenticated = false;
let customInventory = null;

// DOM Elements
const adminToggleBtn = document.getElementById('admin-toggle');
const adminLoginModal = document.getElementById('admin-login-modal');
const adminPanel = document.getElementById('admin-panel');
const adminEditModal = document.getElementById('admin-edit-modal');
const adminPasswordInput = document.getElementById('admin-password');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminCancelBtn = document.getElementById('admin-cancel-btn');
const adminCloseBtn = document.getElementById('admin-close-btn');
const adminLoginError = document.getElementById('admin-login-error');
const adminItemsList = document.getElementById('admin-items-list');
const adminSearchInput = document.getElementById('admin-search');
const adminAddBtn = document.getElementById('admin-add-btn');
const adminExportBtn = document.getElementById('admin-export-btn');
const adminImportBtn = document.getElementById('admin-import-btn');
const adminImportFile = document.getElementById('admin-import-file');
const adminSaveBtn = document.getElementById('admin-save-btn');
const adminDeleteBtn = document.getElementById('admin-delete-btn');
const adminEditCancelBtn = document.getElementById('admin-edit-cancel-btn');

// Load custom inventory from localStorage
function loadCustomInventory() {
  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (stored) {
    try {
      customInventory = JSON.parse(stored);
      console.log('[Admin] Loaded custom inventory:', customInventory.items.length, 'items');
      return customInventory;
    } catch (e) {
      console.error('[Admin] Failed to parse custom inventory:', e);
    }
  }
  // Clone default inventory
  customInventory = JSON.parse(JSON.stringify(INVENTORY_DATABASE));
  return customInventory;
}

// Save custom inventory to localStorage
function saveCustomInventory() {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(customInventory));
    console.log('[Admin] Saved custom inventory:', customInventory.items.length, 'items');
    // Update the global inventory for immediate effect
    INVENTORY_DATABASE.items = customInventory.items;
    return true;
  } catch (e) {
    console.error('[Admin] Failed to save inventory:', e);
    alert('Failed to save changes: ' + e.message);
    return false;
  }
}

// Admin toggle button
adminToggleBtn.addEventListener('click', () => {
  hapticFeedback('light');
  if (adminAuthenticated) {
    openAdminPanel();
  } else {
    adminLoginModal.classList.add('active');
    adminPasswordInput.focus();
  }
});

// Admin login
adminLoginBtn.addEventListener('click', () => {
  const password = adminPasswordInput.value;
  if (password === ADMIN_PASSWORD) {
    adminAuthenticated = true;
    adminLoginModal.classList.remove('active');
    adminPasswordInput.value = '';
    adminLoginError.style.display = 'none';
    hapticFeedback('success');
    openAdminPanel();
  } else {
    adminLoginError.textContent = 'Incorrect password';
    adminLoginError.style.display = 'block';
    hapticFeedback('error');
    adminPasswordInput.value = '';
    adminPasswordInput.focus();
  }
});

adminCancelBtn.addEventListener('click', () => {
  adminLoginModal.classList.remove('active');
  adminPasswordInput.value = '';
  adminLoginError.style.display = 'none';
});

// Allow Enter key for login
adminPasswordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    adminLoginBtn.click();
  }
});

// Open admin panel
function openAdminPanel() {
  loadCustomInventory();
  adminPanel.classList.add('active');
  renderAdminItemsList();
}

// Close admin panel
adminCloseBtn.addEventListener('click', () => {
  adminPanel.classList.remove('active');
  adminSearchInput.value = '';
});

// Render items list
function renderAdminItemsList(filter = '') {
  const items = customInventory.items.filter(item => {
    if (!filter) return true;
    const search = filter.toLowerCase();
    return item.name.toLowerCase().includes(search) ||
           item.location.toLowerCase().includes(search) ||
           (item.aliases && item.aliases.some(a => a.toLowerCase().includes(search)));
  });

  adminItemsList.innerHTML = items.map(item => `
    <div class="admin-item" data-item-id="${item.id}">
      <div class="admin-item-header">
        <div>
          <div class="admin-item-name">${item.name}</div>
          <div class="admin-item-location">📍 ${item.location}</div>
        </div>
        <div class="admin-item-badges">
          ${item.critical ? '<span class="admin-badge">CRITICAL</span>' : ''}
          ${item.compartment ? `<span class="admin-badge" style="background: var(--green-600);">${item.compartment}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.admin-item').forEach(el => {
    el.addEventListener('click', () => {
      const itemId = el.dataset.itemId;
      const item = customInventory.items.find(i => i.id === itemId);
      if (item) {
        editItem(item);
      }
    });
  });
}

// Admin search
adminSearchInput.addEventListener('input', (e) => {
  renderAdminItemsList(e.target.value);
});

// Add new item
adminAddBtn.addEventListener('click', () => {
  editItem(null); // null = new item
});

// Edit item
function editItem(item) {
  const isNew = !item;
  document.getElementById('admin-edit-title').textContent = isNew ? 'Add New Equipment' : 'Edit Equipment';

  if (isNew) {
    // Clear form for new item
    document.getElementById('edit-item-id').value = '';
    document.getElementById('edit-name').value = '';
    document.getElementById('edit-aliases').value = '';
    document.getElementById('edit-location').value = '';
    document.getElementById('edit-compartment').value = '';
    document.getElementById('edit-color').value = '';
    document.getElementById('edit-description').value = '';
    document.getElementById('edit-contents').value = '';
    document.getElementById('edit-warning').value = '';
    document.getElementById('edit-driver-note').value = '';
    document.getElementById('edit-image').value = '';
    document.getElementById('edit-critical').checked = false;
    document.getElementById('edit-critical-rank').value = '';
    adminDeleteBtn.style.display = 'none';
  } else {
    // Fill form with item data
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('edit-name').value = item.name || '';
    document.getElementById('edit-aliases').value = item.aliases ? item.aliases.join(', ') : '';
    document.getElementById('edit-location').value = item.location || '';
    document.getElementById('edit-compartment').value = item.compartment || '';
    document.getElementById('edit-color').value = item.color || '';
    document.getElementById('edit-description').value = item.description || '';
    document.getElementById('edit-contents').value = item.contents || '';
    document.getElementById('edit-warning').value = item.warning || '';
    document.getElementById('edit-driver-note').value = item.driverNote || '';
    document.getElementById('edit-image').value = item.image || '';
    document.getElementById('edit-critical').checked = item.critical || false;
    document.getElementById('edit-critical-rank').value = item.criticalRank || '';
    adminDeleteBtn.style.display = 'block';
  }

  adminEditModal.classList.add('active');
}

// Save item
adminSaveBtn.addEventListener('click', () => {
  const itemId = document.getElementById('edit-item-id').value;
  const name = document.getElementById('edit-name').value.trim();
  const location = document.getElementById('edit-location').value.trim();

  if (!name || !location) {
    alert('Name and Location are required');
    return;
  }

  const aliases = document.getElementById('edit-aliases').value
    .split(',')
    .map(a => a.trim())
    .filter(a => a);

  const itemData = {
    id: itemId || name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    name,
    aliases,
    searchText: `${name} ${aliases.join(' ')} ${location}`.toLowerCase(),
    location,
    compartment: document.getElementById('edit-compartment').value.trim(),
    color: document.getElementById('edit-color').value.trim(),
    critical: document.getElementById('edit-critical').checked,
    criticalRank: parseInt(document.getElementById('edit-critical-rank').value) || null,
    description: document.getElementById('edit-description').value.trim(),
    contents: document.getElementById('edit-contents').value.trim(),
    warning: document.getElementById('edit-warning').value.trim(),
    driverNote: document.getElementById('edit-driver-note').value.trim(),
    image: document.getElementById('edit-image').value.trim()
  };

  if (itemId) {
    // Update existing item
    const index = customInventory.items.findIndex(i => i.id === itemId);
    if (index >= 0) {
      customInventory.items[index] = itemData;
    }
  } else {
    // Add new item
    customInventory.items.push(itemData);
  }

  if (saveCustomInventory()) {
    adminEditModal.classList.remove('active');
    renderAdminItemsList(adminSearchInput.value);
    hapticFeedback('success');
  }
});

// Delete item
adminDeleteBtn.addEventListener('click', () => {
  if (!confirm('Are you sure you want to delete this item?')) return;

  const itemId = document.getElementById('edit-item-id').value;
  customInventory.items = customInventory.items.filter(i => i.id !== itemId);

  if (saveCustomInventory()) {
    adminEditModal.classList.remove('active');
    renderAdminItemsList(adminSearchInput.value);
    hapticFeedback('success');
  }
});

// Cancel edit
adminEditCancelBtn.addEventListener('click', () => {
  adminEditModal.classList.remove('active');
});

// Export JSON
adminExportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(customInventory, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hnfd-equipment-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  hapticFeedback('success');
});

// Import JSON
adminImportBtn.addEventListener('click', () => {
  adminImportFile.click();
});

adminImportFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.items || !Array.isArray(data.items)) {
        alert('Invalid JSON format. Must have "items" array.');
        return;
      }

      if (confirm(`Import ${data.items.length} items? This will replace all current equipment.`)) {
        customInventory = data;
        if (saveCustomInventory()) {
          renderAdminItemsList();
          hapticFeedback('success');
          alert('Import successful!');
        }
      }
    } catch (err) {
      alert('Failed to parse JSON: ' + err.message);
    }
  };
  reader.readAsText(file);

  // Reset file input
  e.target.value = '';
});

// Load custom inventory on startup if exists
if (localStorage.getItem(ADMIN_STORAGE_KEY)) {
  loadCustomInventory();
  INVENTORY_DATABASE.items = customInventory.items;
  console.log('[Admin] Using custom inventory');
}

console.log('[Admin] Module loaded');
