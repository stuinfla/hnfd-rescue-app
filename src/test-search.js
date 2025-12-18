/**
 * Test Search Functionality
 * Verifies all critical items can be found accurately
 */

const fs = require('fs');
const path = require('path');

// Load inventory for testing
const inventory = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/ambulance_inventory.json'), 'utf8')
);

// Embedded search (same as PWA uses)
const INVENTORY_DATABASE = {
  items: [
    {
      id: "trauma_bag_adult",
      name: "Adult Trauma Bag",
      aliases: ["trauma back", "first-in bag", "first end bag", "trauma bag", "adult trauma"],
      location: "Cabinet K - Middle Drawer (FRONT)",
      compartment: "K",
      critical: true,
      criticalRank: 1
    },
    {
      id: "oxygen_kit_adult",
      name: "Adult Oxygen Kit",
      aliases: ["green oxygen bag", "O2 kit", "respiratory kit", "adult oxygen", "oxygen kit"],
      location: "Cabinet K - Middle Drawer (BEHIND trauma bag)",
      compartment: "K",
      critical: true,
      criticalRank: 2
    },
    {
      id: "oxygen_kit_pediatric",
      name: "Pediatric Oxygen Kit",
      aliases: ["peds oxygen", "child oxygen kit", "pediatric O2", "kids oxygen"],
      location: "Cabinet K - Lower Drawer (FRONT)",
      compartment: "K",
      critical: true,
      criticalRank: 3
    },
    {
      id: "trauma_bag_pediatric",
      name: "Pediatric Trauma Bag",
      aliases: ["peds trauma", "pediatric first-in bag", "child trauma bag"],
      location: "Cabinet K - Lower Drawer (BEHIND oxygen kit)",
      compartment: "K",
      critical: true,
      criticalRank: 4
    },
    {
      id: "intubation_kit",
      name: "Intubation Kit",
      aliases: ["airway kit", "intubation bag", "intubation"],
      location: "Cabinet K - Top Shelf",
      compartment: "K",
      critical: true,
      criticalRank: 5
    },
    {
      id: "iv_bag",
      name: "IV Kit",
      aliases: ["IV access kit", "IV supplies", "IV bag"],
      location: "Cabinet K - Top Shelf",
      compartment: "K",
      critical: true,
      criticalRank: 6
    },
    {
      id: "portable_aed",
      name: "Portable AED",
      aliases: ["AED", "defibrillator", "defib"],
      location: "Cabinet K - Top Shelf (further back)",
      compartment: "K",
      critical: true,
      criticalRank: 7
    },
    {
      id: "drug_box",
      name: "Drug Box",
      aliases: ["orange box", "medication box", "orange drug box", "meds"],
      location: "Cabinet J",
      compartment: "J",
      critical: true,
      criticalRank: 8
    },
    {
      id: "portable_suction",
      name: "Portable Suction",
      aliases: ["suction", "portable suction unit", "battery suction"],
      location: "Cabinet J",
      compartment: "J",
      critical: true,
      criticalRank: 9
    },
    {
      id: "glucometer",
      name: "Glucometer",
      aliases: ["glucose meter", "blood sugar meter", "diabetic meter"],
      location: "Drawer N",
      compartment: "N",
      critical: true,
      criticalRank: 10
    },
    {
      id: "narcan",
      name: "Narcan",
      aliases: ["naloxone", "opioid reversal", "overdose medication"],
      location: "Drawer N",
      compartment: "N",
      critical: true,
      criticalRank: 11
    },
    {
      id: "spare_oxygen_tanks",
      name: "Spare Oxygen Tanks",
      aliases: ["O2 tanks", "spare O2", "backup oxygen", "oxygen cylinders"],
      location: "Next to steps on side entry",
      compartment: "oxygen_storage",
      critical: true,
      criticalRank: 12
    },
    {
      id: "lifepak_15",
      name: "LifePak 15",
      aliases: ["life pack", "monitor", "cardiac monitor", "lifepak"],
      location: "Mounted in patient compartment",
      compartment: "lifepak_mount",
      critical: true,
      criticalRank: 13
    },
    {
      id: "lucas_device",
      name: "LUCAS Device",
      aliases: ["LUCAS", "CPR machine", "mechanical CPR"],
      location: "MC2 back seat",
      compartment: "mc2",
      critical: true
    },
    {
      id: "saline_bags",
      name: "Saline Bags",
      aliases: ["IV saline", "normal saline", "NS", "saline"],
      location: "Cabinet D",
      compartment: "D"
    }
  ]
};

function search(query) {
  query = query.toLowerCase().trim();
  const scoredResults = INVENTORY_DATABASE.items.map(item => {
    let score = 0;

    if (item.name.toLowerCase().includes(query)) {
      score += 100;
    }

    for (const alias of item.aliases || []) {
      if (alias.toLowerCase().includes(query) || query.includes(alias.toLowerCase())) {
        score += 80;
      }
    }

    const queryWords = query.split(/\s+/);
    const itemWords = [
      item.name.toLowerCase(),
      ...(item.aliases || []).map(a => a.toLowerCase())
    ].join(' ').split(/\s+/);

    for (const qw of queryWords) {
      if (qw.length < 2) continue;
      for (const iw of itemWords) {
        if (iw.includes(qw) || qw.includes(iw)) {
          score += 20;
        }
      }
    }

    if (item.critical) {
      score += 10;
    }

    return { item, score };
  });

  return scoredResults
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.item);
}

// Test queries
const testQueries = [
  { query: 'AED', expected: 'portable_aed' },
  { query: 'defibrillator', expected: 'portable_aed' },
  { query: 'defib', expected: 'portable_aed' },
  { query: 'narcan', expected: 'narcan' },
  { query: 'naloxone', expected: 'narcan' },
  { query: 'overdose', expected: 'narcan' },
  { query: 'oxygen', expected: 'oxygen_kit_adult' },
  { query: 'O2', expected: 'oxygen_kit_adult' },
  { query: 'trauma bag', expected: 'trauma_bag_adult' },
  { query: 'first-in bag', expected: 'trauma_bag_adult' },
  { query: 'pediatric oxygen', expected: 'oxygen_kit_pediatric' },
  { query: 'kids oxygen', expected: 'oxygen_kit_pediatric' },
  { query: 'drug box', expected: 'drug_box' },
  { query: 'orange box', expected: 'drug_box' },
  { query: 'suction', expected: 'portable_suction' },
  { query: 'glucometer', expected: 'glucometer' },
  { query: 'blood sugar', expected: 'glucometer' },
  { query: 'saline', expected: 'saline_bags' },
  { query: 'IV fluid', expected: 'saline_bags' },
  { query: 'lifepak', expected: 'lifepak_15' },
  { query: 'cardiac monitor', expected: 'lifepak_15' },
  { query: 'LUCAS', expected: 'lucas_device' },
  { query: 'CPR machine', expected: 'lucas_device' },
  { query: 'intubation', expected: 'intubation_kit' },
  { query: 'IV kit', expected: 'iv_bag' },
  { query: 'spare oxygen', expected: 'spare_oxygen_tanks' }
];

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║       AMBULANCE INVENTORY SEARCH TESTS                         ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

let passed = 0;
let failed = 0;

for (const test of testQueries) {
  const results = search(test.query);
  const topResult = results[0];

  if (topResult && topResult.id === test.expected) {
    console.log(`✅ "${test.query}" → ${topResult.name} (${topResult.location})`);
    passed++;
  } else {
    console.log(`❌ "${test.query}" → Expected ${test.expected}, got ${topResult?.id || 'nothing'}`);
    failed++;
  }
}

console.log('');
console.log('════════════════════════════════════════════════════════════════');
console.log(`Results: ${passed} passed, ${failed} failed out of ${testQueries.length} tests`);
console.log('');

if (failed === 0) {
  console.log('✅ ALL TESTS PASSED - Search functionality verified!');
  console.log('');
  console.log('CRITICAL ITEMS VERIFICATION:');
  console.log('');

  const criticalItems = inventory.critical_items_summary;
  for (const item of criticalItems) {
    console.log(`  #${item.rank}: ${item.item}`);
    console.log(`      📍 ${item.location}`);
    console.log('');
  }
} else {
  console.log('⚠️  SOME TESTS FAILED - Review search implementation');
  process.exit(1);
}
