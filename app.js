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
      image: "/images/trauma_bag_adult.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_exterior_side.jpg",
        compartmentView: "/images/locations/cabinet_k_overview.jpg",
        equipmentPhoto: "/images/locations/adult_trauma_bag_closeup.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 45, y: 60, label: "Cabinet K" },
        compartmentView: { x: 50, y: 70, label: "Middle Drawer" },
        equipmentPhoto: null
      },
      locationSteps: [
        "Step 1: Go to OUTSIDE of ambulance (driver's side)",
        "Step 2: Find Cabinet K - main side compartment door",
        "Step 3: Open Middle Drawer - trauma bag is in FRONT",
        "Step 4: Grab RED/ORANGE bag - this is the adult trauma bag"
      ],
      quickFind: "Outside ambulance → Cabinet K (side door) → Middle drawer → RED bag in front"
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
      image: "/images/oxygen_kit_adult.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_exterior_side.jpg",
        compartmentView: "/images/locations/cabinet_k_overview.jpg",
        equipmentPhoto: "/images/oxygen_kit_adult.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 45, y: 60, label: "Cabinet K" },
        compartmentView: { x: 50, y: 55, label: "Middle Drawer" },
        equipmentPhoto: null
      }
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
      image: "/images/pediatric_oxygen.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_exterior_side.jpg",
        compartmentView: "/images/locations/cabinet_k_overview.jpg",
        equipmentPhoto: "/images/pediatric_oxygen.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 45, y: 60, label: "Cabinet K" },
        compartmentView: { x: 50, y: 70, label: "Lower Drawer" },
        equipmentPhoto: null
      }
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
      image: "/images/pediatric_trauma.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_exterior_side.jpg",
        compartmentView: "/images/locations/cabinet_k_overview.jpg",
        equipmentPhoto: "/images/pediatric_trauma.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 45, y: 60, label: "Cabinet K" },
        compartmentView: { x: 50, y: 70, label: "Lower Drawer" },
        equipmentPhoto: null
      }
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
      image: "/images/intubation_kit.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_exterior_side.jpg",
        compartmentView: "/images/locations/cabinet_k_overview.jpg",
        equipmentPhoto: "/images/locations/intubation_bag_blue.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 45, y: 60, label: "Cabinet K" },
        compartmentView: { x: 50, y: 30, label: "Top Shelf" },
        equipmentPhoto: null
      }
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
      image: "/images/iv_kit.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_exterior_side.jpg",
        compartmentView: "/images/locations/cabinet_k_overview.jpg",
        equipmentPhoto: "/images/locations/iv_kit_closeup.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 45, y: 60, label: "Cabinet K" },
        compartmentView: { x: 50, y: 30, label: "Top Shelf" },
        equipmentPhoto: null
      }
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
      image: "/images/cabinet_d_aed.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_exterior_side.jpg",
        compartmentView: "/images/locations/cabinet_k_overview.jpg",
        equipmentPhoto: "/images/locations/aed_closeup.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 45, y: 60, label: "Cabinet K" },
        compartmentView: { x: 50, y: 30, label: "Top Shelf" },
        equipmentPhoto: null
      },
      locationSteps: [
        "Step 1: Go to OUTSIDE of ambulance (driver's side)",
        "Step 2: Find Cabinet K - main side compartment door",
        "Step 3: Open cabinet - AED is on TOP SHELF (further back)",
        "Step 4: Look for BLACK bag with RED 'AED' lettering"
      ],
      quickFind: "Outside ambulance → Cabinet K (side door) → Top shelf (back) → BLACK bag with RED AED letters"
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
      image: "/images/drug_box.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_interior_overview.jpg",
        compartmentView: "/images/locations/drug_box_cabinet.jpg",
        equipmentPhoto: "/images/locations/drug_box_closeup.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 25, y: 50, label: "Cabinet J" },
        compartmentView: { x: 30, y: 50, label: "Orange Box" },
        equipmentPhoto: null
      },
      locationSteps: [
        "Step 1: Enter patient compartment through side door",
        "Step 2: Find Cabinet J - located ABOVE Cabinet K, inside",
        "Step 3: Open cabinet - look for ORANGE box",
        "Step 4: Grab the ORANGE BOX - that's the Drug Box"
      ],
      quickFind: "Inside ambulance → Cabinet J (above K) → ORANGE box"
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
      image: "/images/suction.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_interior_overview.jpg",
        compartmentView: "/images/locations/drug_box_cabinet.jpg",
        equipmentPhoto: "/images/suction.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 25, y: 50, label: "Cabinet J" },
        compartmentView: { x: 60, y: 50, label: "Suction Unit" },
        equipmentPhoto: null
      },
      locationSteps: [
        "Step 1: Enter patient compartment through side door",
        "Step 2: Find Cabinet J - located ABOVE Cabinet K, inside",
        "Step 3: BEFORE grabbing - locate power cord at back of cabinet",
        "Step 4: UNPLUG cord from cigarette lighter FIRST",
        "Step 5: Then remove suction unit"
      ],
      quickFind: "Inside ambulance → Cabinet J (above K) → UNPLUG FIRST, then grab unit"
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
      image: "/images/glucometer.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_interior_overview.jpg",
        compartmentView: "/images/locations/drawer_n_open.jpg",
        equipmentPhoto: "/images/glucometer.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 70, y: 45, label: "Drawer N" },
        compartmentView: { x: 40, y: 50, label: "Black Pouch" },
        equipmentPhoto: null
      },
      locationSteps: [
        "Step 1: Enter patient compartment through side door",
        "Step 2: Look for Drawer N - located on left wall",
        "Step 3: Open drawer - Glucometer always in SAME spot",
        "Step 4: Grab small BLACK box/pouch"
      ],
      quickFind: "Inside ambulance → Drawer N (left wall) → Small black box/pouch"
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
      image: "/images/locations/narcan_syringe_closeup.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_interior_overview.jpg",
        compartmentView: "/images/locations/drawer_n_contents.jpg",
        equipmentPhoto: "/images/locations/narcan_syringe_closeup.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 70, y: 45, label: "Drawer N" },
        compartmentView: { x: 55, y: 40, label: "Clear Tubes" },
        equipmentPhoto: null
      },
      locationSteps: [
        "Step 1: Enter patient compartment through side door",
        "Step 2: Look for Drawer N - located on left wall",
        "Step 3: Open drawer - Narcan in clear tubes or orange containers",
        "Step 4: GRAB BOTH syringe AND atomizer (taped together)"
      ],
      quickFind: "Inside ambulance → Drawer N (left wall) → Clear tubes or orange containers"
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
      image: "/images/oxygen_tanks.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_exterior_side.jpg",
        compartmentView: "/images/locations/oxygen_compartment.jpg",
        equipmentPhoto: "/images/locations/oxygen_tanks_closeup.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 60, y: 70, label: "O2 Compartment" },
        compartmentView: { x: 50, y: 60, label: "Tank Holder" },
        equipmentPhoto: null
      },
      locationSteps: [
        "Step 1: Go to SIDE of ambulance",
        "Step 2: Find side entry door (with steps)",
        "Step 3: Look NEXT TO the steps - tanks are in holder",
        "Step 4: SQUEEZE brackets together to release tank"
      ],
      quickFind: "Side of ambulance → Next to entry steps → SQUEEZE brackets to release"
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
      image: "/images/lifepak_mounted.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_interior_overview.jpg",
        compartmentView: "/images/locations/lifepak_closeup.jpg",
        equipmentPhoto: "/images/locations/lifepak_closeup.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 35, y: 55, label: "LifePak Mount" },
        compartmentView: { x: 35, y: 55, label: "Mounted Here" },
        equipmentPhoto: null
      },
      locationSteps: [
        "Step 1: Enter patient compartment through side door",
        "Step 2: Look for mounted unit - obvious location on wall",
        "Step 3: Press GREEN button ONCE briefly to turn on",
        "Step 4: Carry with screen facing your body (protect it)"
      ],
      quickFind: "Inside ambulance → Mounted on wall → Press GREEN button to turn on"
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
      image: "/images/lucas_device.jpg",
      images: {
        ambulancePosition: "/images/lucas_device.jpg",
        compartmentView: "/images/lucas_device.jpg",
        equipmentPhoto: "/images/lucas_device.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 70, y: 50, label: "MC2 Vehicle" },
        compartmentView: { x: 50, y: 50, label: "Back Seat" },
        equipmentPhoto: null
      }
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
      image: "/images/compartments/compartment-d-ob-linens.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_interior_overview.jpg",
        compartmentView: "/images/compartments/compartment-d-ob-linens.jpg",
        equipmentPhoto: "/images/compartments/compartment-d-ob-linens.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 30, y: 50, label: "Cabinet D" },
        compartmentView: { x: 50, y: 50, label: "Saline Bags" },
        equipmentPhoto: null
      }
    },
    {
      id: "primary_sets",
      name: "Primary Sets",
      aliases: ["IV tubing", "IV administration set", "drip set", "IV line", "tubing"],
      searchText: "primary sets IV tubing administration drip line saline",
      location: "Cabinet D - right next to saline bags",
      compartment: "D",
      description: "IV tubing with needle for saline bags - required to administer saline",
      image: "/images/primary_sets.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_interior_overview.jpg",
        compartmentView: "/images/primary_sets.jpg",
        equipmentPhoto: "/images/primary_sets.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 30, y: 50, label: "Cabinet D" },
        compartmentView: { x: 50, y: 50, label: "IV Tubing" },
        equipmentPhoto: null
      }
    },
    {
      id: "onboard_suction",
      name: "Onboard Suction",
      aliases: ["main suction", "built-in suction", "vacuum suction", "stretcher suction"],
      searchText: "onboard main built-in vacuum suction stretcher transport",
      location: "Built into patient compartment - wall-mounted unit",
      compartment: "onboard",
      description: "Vacuum pump driven suction for patients on stretcher during transport",
      notes: "Wall-mounted in patient compartment. Always available when patient is on stretcher.",
      image: "/images/locations/onboard_suction_area.jpg",
      images: {
        ambulancePosition: "/images/locations/ambulance_interior_overview.jpg",
        compartmentView: "/images/locations/onboard_suction_area.jpg",
        equipmentPhoto: "/images/locations/onboard_suction_area.jpg"
      },
      goldDots: {
        ambulancePosition: { x: 15, y: 45, label: "Suction Panel" },
        compartmentView: { x: 40, y: 35, label: "Wall Unit" },
        equipmentPhoto: null
      },
      locationSteps: [
        "Step 1: Enter patient compartment",
        "Step 2: Look at LEFT WALL near head of stretcher",
        "Step 3: Wall-mounted suction unit with green components",
        "Step 4: Already connected - ready to use"
      ],
      quickFind: "Inside ambulance → Left wall → Green wall-mounted unit"
    },
    // === COMPARTMENT A - BASIC SUPPLIES ===
    {
      id: "bandaids",
      name: "Bandaids",
      aliases: ["band-aids", "band aids", "adhesive bandages", "plasters"],
      searchText: "bandaids band aids adhesive bandages plasters small wounds",
      location: "Compartment A - Basic Supplies",
      compartment: "A",
      description: "Adhesive bandages for small wounds",
      image: "/images/compartments/compartment-a-supplies.jpg",
      quickFind: "Outside ambulance → Compartment A → Basic Supplies area"
    },
    {
      id: "cold_packs",
      name: "Cold Packs",
      aliases: ["ice packs", "instant cold", "cold compress"],
      searchText: "cold packs ice instant compress cooling",
      location: "Compartment A - Basic Supplies",
      compartment: "A",
      description: "Instant cold packs for swelling and injuries",
      image: "/images/compartments/compartment-a-supplies.jpg",
      quickFind: "Outside ambulance → Compartment A → Basic Supplies area"
    },
    {
      id: "hot_packs",
      name: "Hot Packs",
      aliases: ["heat packs", "instant heat", "warm packs"],
      searchText: "hot packs heat instant warm warming",
      location: "Compartment A - Basic Supplies",
      compartment: "A",
      description: "Instant heat packs",
      image: "/images/compartments/compartment-a-supplies.jpg",
      quickFind: "Outside ambulance → Compartment A → Basic Supplies area"
    },
    {
      id: "triangle_bandages",
      name: "Triangle Bandages",
      aliases: ["triangular bandage", "sling", "cravat"],
      searchText: "triangle triangular bandages sling cravat arm sling",
      location: "Compartment A - Basic Supplies",
      compartment: "A",
      description: "Triangle bandages for slings and cravats",
      image: "/images/compartments/compartment-a-supplies.jpg",
      quickFind: "Outside ambulance → Compartment A → Basic Supplies area"
    },
    {
      id: "gauze",
      name: "Gauze",
      aliases: ["gauze pads", "gauze dressings", "gauze rolls"],
      searchText: "gauze pads dressings rolls wound care",
      location: "Compartment A - Basic Supplies",
      compartment: "A",
      description: "Gauze for wound care",
      image: "/images/compartments/compartment-a-supplies.jpg",
      quickFind: "Outside ambulance → Compartment A → Basic Supplies area"
    },
    {
      id: "kling",
      name: "Kling",
      aliases: ["kling bandage", "kerlix", "roller gauze", "conforming bandage"],
      searchText: "kling kerlix roller gauze conforming bandage wrap",
      location: "Compartment A - Basic Supplies",
      compartment: "A",
      description: "Conforming roller bandage for securing dressings",
      image: "/images/compartments/compartment-a-supplies.jpg",
      quickFind: "Outside ambulance → Compartment A → Basic Supplies area"
    },
    {
      id: "sam_splints",
      name: "SAM Splints",
      aliases: ["sam splint", "malleable splint", "aluminum splint"],
      searchText: "SAM splint malleable aluminum foam splint fracture",
      location: "Compartment A - Basic Supplies",
      compartment: "A",
      description: "SAM malleable splints for fractures",
      image: "/images/compartments/compartment-a-supplies.jpg",
      quickFind: "Outside ambulance → Compartment A → Basic Supplies area"
    },
    {
      id: "flexall_splints",
      name: "Flex-All Splints",
      aliases: ["flexall", "flex all splint", "cardboard splint"],
      searchText: "flex all flexall splint cardboard fracture immobilization",
      location: "Compartment A - Basic Supplies",
      compartment: "A",
      description: "Flex-All splints for fracture immobilization",
      image: "/images/compartments/compartment-a-supplies.jpg",
      quickFind: "Outside ambulance → Compartment A → Basic Supplies area"
    },
    {
      id: "tocs",
      name: "T.O.C.S. (Chest Seal)",
      aliases: ["TOCS", "occlusive dressing", "chest seal", "occlusive chest seal"],
      searchText: "TOCS occlusive chest seal dressing pneumothorax sucking wound",
      location: "Compartment A - Basic Supplies",
      compartment: "A",
      critical: true,
      description: "Occlusive chest seal for sucking chest wounds",
      image: "/images/compartments/compartment-a-supplies.jpg",
      quickFind: "Outside ambulance → Compartment A → Basic Supplies area"
    },
    // === COMPARTMENT B - TRAUMA & BURN ===
    {
      id: "burn_dressings",
      name: "Burn Dressings",
      aliases: ["burn pads", "burn sheets", "water-jel"],
      searchText: "burn dressings pads sheets water-jel thermal burns",
      location: "Compartment B - Trauma & Burn Supplies",
      compartment: "B",
      description: "Specialized dressings for burn injuries",
      image: "/images/compartments/compartment-b-trauma.jpg",
      quickFind: "Outside ambulance → Compartment B → Trauma & Burn area"
    },
    {
      id: "abd_pads",
      name: "ABD Pads",
      aliases: ["abdominal pads", "combine pads", "trauma pads", "large pads"],
      searchText: "ABD abdominal pads combine trauma large absorbent dressing",
      location: "Compartment B - Trauma & Burn Supplies",
      compartment: "B",
      description: "Large absorbent dressings for major wounds",
      image: "/images/compartments/compartment-b-trauma.jpg",
      quickFind: "Outside ambulance → Compartment B → Trauma & Burn area"
    },
    {
      id: "multitrauma_dressing",
      name: "Multi-Trauma Dressing",
      aliases: ["trauma dressing", "MTD", "10x30"],
      searchText: "multi trauma dressing MTD 10x30 large wound coverage",
      location: "Compartment B - Trauma & Burn Supplies",
      compartment: "B",
      description: "Large multi-trauma dressings for extensive wounds",
      image: "/images/compartments/compartment-b-trauma.jpg",
      quickFind: "Outside ambulance → Compartment B → Trauma & Burn area"
    },
    {
      id: "eye_pads",
      name: "Eye Pads",
      aliases: ["eye dressings", "eye patches"],
      searchText: "eye pads dressings patches ocular injury",
      location: "Compartment B - Trauma & Burn Supplies",
      compartment: "B",
      description: "Sterile eye pads for eye injuries",
      image: "/images/compartments/compartment-b-trauma.jpg",
      quickFind: "Outside ambulance → Compartment B → Trauma & Burn area"
    },
    {
      id: "morgan_lens",
      name: "Morgan Lens",
      aliases: ["eye irrigation", "eye wash lens"],
      searchText: "morgan lens eye irrigation wash chemical burn flush",
      location: "Compartment B - Trauma & Burn Supplies",
      compartment: "B",
      description: "Morgan Lens for continuous eye irrigation",
      image: "/images/compartments/compartment-b-trauma.jpg",
      quickFind: "Outside ambulance → Compartment B → Trauma & Burn area"
    },
    {
      id: "hemostatic_dressings",
      name: "Hemostatic Dressings",
      aliases: ["quikclot", "celox", "hemostatic gauze", "bleeding control"],
      searchText: "hemostatic dressings quikclot celox gauze bleeding control hemorrhage",
      location: "Compartment B - Trauma & Burn Supplies",
      compartment: "B",
      critical: true,
      description: "Hemostatic agents for severe bleeding control",
      image: "/images/compartments/compartment-b-trauma.jpg",
      quickFind: "Outside ambulance → Compartment B → Trauma & Burn area"
    },
    // === COMPARTMENT C - CERVICAL COLLARS ===
    {
      id: "cervical_collars",
      name: "Cervical Collars",
      aliases: ["c-collar", "neck collar", "c collar", "cervical spine collar"],
      searchText: "cervical collar c-collar neck collar spine immobilization",
      location: "Compartment C - Cervical Collars & Saline",
      compartment: "C",
      critical: true,
      description: "Cervical spine immobilization collars",
      image: "/images/compartments/compartment-c-collars.jpg",
      quickFind: "Outside ambulance → Compartment C → Collars area"
    },
    // === COMPARTMENT D (OB) - OB KIT & LINENS ===
    {
      id: "ob_kit",
      name: "OB Kit",
      aliases: ["obstetrics kit", "delivery kit", "childbirth kit", "curaplex OB"],
      searchText: "OB obstetrics delivery kit childbirth curaplex labor",
      location: "Compartment D (OB) - Inside glass cabinet",
      compartment: "OB",
      critical: true,
      description: "Complete obstetrics kit for emergency delivery",
      image: "/images/compartments/compartment-d-ob-linens.jpg",
      quickFind: "Inside ambulance → Glass cabinet → OB Kit"
    },
    {
      id: "emesis_bags",
      name: "Emesis Bags",
      aliases: ["vomit bags", "barf bags", "sick bags"],
      searchText: "emesis bags vomit barf sick nausea",
      location: "Compartment D (OB) - Inside glass cabinet",
      compartment: "OB",
      description: "Emesis bags for nausea/vomiting",
      image: "/images/compartments/compartment-d-ob-linens.jpg",
      quickFind: "Inside ambulance → Glass cabinet → Near linens"
    },
    {
      id: "blankets",
      name: "Blankets",
      aliases: ["linens", "sheets", "patient blankets"],
      searchText: "blankets linens sheets patient warming hypothermia",
      location: "Compartment D (OB) - Inside glass cabinet",
      compartment: "OB",
      description: "Patient blankets for warmth and comfort",
      image: "/images/compartments/compartment-d-ob-linens.jpg",
      quickFind: "Inside ambulance → Glass cabinet → Linens area"
    },
    // === COMPARTMENT F - PPE SUPPLIES ===
    {
      id: "ppe_supplies",
      name: "PPE Supplies",
      aliases: ["personal protective equipment", "protective gear", "PPE"],
      searchText: "PPE personal protective equipment gear infection control",
      location: "Compartment F - Inside upper cabinet",
      compartment: "F",
      description: "Personal Protective Equipment supplies",
      image: "/images/compartments/compartment-f-ppe.jpg",
      quickFind: "Inside ambulance → Upper cabinet → PPE area"
    },
    {
      id: "gowns",
      name: "Gowns",
      aliases: ["isolation gowns", "protective gowns"],
      searchText: "gowns isolation protective PPE infection control",
      location: "Compartment F - PPE Supplies",
      compartment: "F",
      description: "Protective gowns for infection control",
      image: "/images/compartments/compartment-f-ppe.jpg",
      quickFind: "Inside ambulance → Compartment F → PPE area"
    },
    {
      id: "n95_masks",
      name: "N95 Masks",
      aliases: ["N95", "respirator", "N95 respirator"],
      searchText: "N95 masks respirator respiratory protection airborne",
      location: "Compartment F - PPE Supplies",
      compartment: "F",
      description: "N95 respirator masks for airborne protection",
      image: "/images/compartments/compartment-f-ppe.jpg",
      quickFind: "Inside ambulance → Compartment F → PPE area"
    },
    {
      id: "surgical_masks",
      name: "Surgical Masks",
      aliases: ["face masks", "procedure masks"],
      searchText: "surgical masks face procedure masks droplet protection",
      location: "Compartment F - PPE Supplies",
      compartment: "F",
      description: "Surgical face masks",
      image: "/images/compartments/compartment-f-ppe.jpg",
      quickFind: "Inside ambulance → Compartment F → PPE area"
    },
    {
      id: "protective_eyewear",
      name: "Protective Eyewear",
      aliases: ["safety glasses", "goggles", "eye protection"],
      searchText: "protective eyewear safety glasses goggles eye protection splash",
      location: "Compartment F - PPE Supplies",
      compartment: "F",
      description: "Protective eyewear for splash protection",
      image: "/images/compartments/compartment-f-ppe.jpg",
      quickFind: "Inside ambulance → Compartment F → PPE area"
    },
    {
      id: "face_shields",
      name: "Face Shields",
      aliases: ["full face shield", "face visor"],
      searchText: "face shields visor full face protection splash",
      location: "Compartment F - PPE Supplies",
      compartment: "F",
      description: "Full face shields for protection",
      image: "/images/compartments/compartment-f-ppe.jpg",
      quickFind: "Inside ambulance → Compartment F → PPE area"
    },
    // === COMPARTMENT G - AIRWAY SUPPLIES ===
    {
      id: "airway_supplies",
      name: "Airway Supplies",
      aliases: ["airway equipment", "respiratory supplies"],
      searchText: "airway supplies equipment respiratory management",
      location: "Compartment G - Glass cabinet labeled 'AIRWAY SUPPLIES'",
      compartment: "G",
      description: "Complete airway management supplies",
      image: "/images/compartments/compartment-g-airway.jpg",
      quickFind: "Inside ambulance → Glass cabinet → 'AIRWAY SUPPLIES' label"
    },
    {
      id: "nasal_airways",
      name: "Nasal Airways (NPA)",
      aliases: ["NPA", "nasal trumpet", "nasopharyngeal airway"],
      searchText: "nasal airways NPA trumpet nasopharyngeal airway",
      location: "Compartment G - Airway Supplies cabinet",
      compartment: "G",
      description: "Nasopharyngeal airways (NPA) - various sizes",
      image: "/images/compartments/compartment-g-airway.jpg",
      quickFind: "Inside ambulance → Compartment G → Airway cabinet"
    },
    {
      id: "oral_airways",
      name: "Oral Airways (OPA)",
      aliases: ["OPA", "oropharyngeal airway", "guedel airway"],
      searchText: "oral airways OPA oropharyngeal guedel airway",
      location: "Compartment G - Airway Supplies cabinet",
      compartment: "G",
      description: "Oropharyngeal airways (OPA) - various sizes",
      image: "/images/compartments/compartment-g-airway.jpg",
      quickFind: "Inside ambulance → Compartment G → Airway cabinet"
    },
    {
      id: "king_airways",
      name: "King Airways",
      aliases: ["king LT", "supraglottic airway", "King tube"],
      searchText: "king airways LT supraglottic tube advanced airway",
      location: "Compartment G - Airway Supplies cabinet",
      compartment: "G",
      critical: true,
      description: "King supraglottic airways for advanced airway management",
      image: "/images/compartments/compartment-g-airway.jpg",
      quickFind: "Inside ambulance → Compartment G → Airway cabinet"
    },
    {
      id: "non_rebreather_masks",
      name: "Non-Rebreather Masks",
      aliases: ["NRB", "high flow mask", "oxygen mask", "NRM"],
      searchText: "non rebreather masks NRB NRM high flow oxygen mask",
      location: "Compartment G - Airway Supplies cabinet",
      compartment: "G",
      description: "Non-rebreather oxygen masks for high flow O2",
      image: "/images/compartments/compartment-g-airway.jpg",
      quickFind: "Inside ambulance → Compartment G → Airway cabinet"
    },
    {
      id: "nasal_cannulas",
      name: "Nasal Cannulas",
      aliases: ["nasal prongs", "NC", "oxygen cannula"],
      searchText: "nasal cannula NC prongs oxygen low flow",
      location: "Compartment G - Airway Supplies cabinet",
      compartment: "G",
      description: "Nasal cannulas for oxygen delivery",
      image: "/images/compartments/compartment-g-airway.jpg",
      quickFind: "Inside ambulance → Compartment G → Airway cabinet"
    },
    {
      id: "nebulizers",
      name: "Nebulizers",
      aliases: ["nebulizer mask", "aerosol mask", "SVN"],
      searchText: "nebulizer nebulizers mask aerosol SVN breathing treatment",
      location: "Compartment G - Airway Supplies cabinet",
      compartment: "G",
      description: "Nebulizer masks for medication delivery",
      image: "/images/compartments/compartment-g-airway.jpg",
      quickFind: "Inside ambulance → Compartment G → Airway cabinet"
    },
    {
      id: "end_tidal_co2",
      name: "End Tidal CO2",
      aliases: ["ETCO2", "capnography", "CO2 detector"],
      searchText: "end tidal CO2 ETCO2 capnography detector waveform",
      location: "Compartment G - Airway Supplies cabinet",
      compartment: "G",
      description: "End tidal CO2 detection for airway confirmation",
      image: "/images/compartments/compartment-g-airway.jpg",
      quickFind: "Inside ambulance → Compartment G → Airway cabinet"
    },
    // === COMPARTMENT H - BVM & VENTILATION ===
    {
      id: "bvm",
      name: "Bag Valve Mask (BVM)",
      aliases: ["BVM", "ambu bag", "bag mask", "manual resuscitator"],
      searchText: "BVM bag valve mask ambu manual resuscitator ventilation",
      location: "Compartment H - Glass cabinet labeled 'BAG VALVE MASKS'",
      compartment: "H",
      critical: true,
      description: "Bag valve masks for manual ventilation",
      image: "/images/compartments/compartment-h-bvm.jpg",
      quickFind: "Inside ambulance → Glass cabinet → 'BAG VALVE MASKS' label"
    },
    {
      id: "bvm_face_masks",
      name: "BVM Face Masks",
      aliases: ["face masks for BVM", "ventilation masks"],
      searchText: "BVM face masks ventilation masks sizes",
      location: "Compartment H - With BVM equipment",
      compartment: "H",
      description: "Face masks for BVM - various sizes",
      image: "/images/compartments/compartment-h-bvm.jpg",
      quickFind: "Inside ambulance → Compartment H → With BVM"
    },
    {
      id: "suction_catheters",
      name: "Suction Catheters",
      aliases: ["yankauer", "suction tip", "tonsil tip"],
      searchText: "suction catheters yankauer tip tonsil",
      location: "Compartment H - With BVM/Ventilation equipment",
      compartment: "H",
      description: "Suction catheters including Yankauer tips",
      image: "/images/compartments/compartment-h-bvm.jpg",
      quickFind: "Inside ambulance → Compartment H → With ventilation gear"
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
    },
    // === NEW HNFR COMPARTMENTS A-H (from Dec 2024 photos) ===
    "A": {
      name: "Compartment A",
      description: "Basic Supplies - bandages, splints, cold/hot packs",
      access: "Outside - side compartment",
      image: "/images/compartments/compartment-a-supplies.jpg",
      contents: ["Bandaids", "Cold Packs", "Hot Packs", "Triangle Bandages", "Gauze", "Kling", "SAM Splints", "Flex-All Splints", "Gloves", "Stethoscope", "T.O.C.S. (Occlusive Chest Seal)"]
    },
    "B": {
      name: "Compartment B",
      description: "Trauma & Burn Supplies",
      access: "Outside - side compartment",
      image: "/images/compartments/compartment-b-trauma.jpg",
      contents: ["Stuffed Animals", "Burn Dressings", "ABD Pads", "Multi-Trauma Dressing", "Eye Pads", "Morgan Lens", "Hemostatic Dressings"]
    },
    "C": {
      name: "Compartment C",
      description: "Cervical Collars & Saline",
      access: "Outside - side compartment",
      image: "/images/compartments/compartment-c-collars.jpg",
      contents: ["Cervical Collars", "Saline", "Stretcher Battery"]
    },
    "OB": {
      name: "Compartment D (OB/Linens)",
      description: "OB Kit, Linens, Emesis Bags",
      access: "Inside - glass cabinet",
      image: "/images/compartments/compartment-d-ob-linens.jpg",
      contents: ["OB Kit (Curaplex)", "Emesis Bags", "Linens", "Sharps Container", "Blankets"]
    },
    "E": {
      name: "Compartment E",
      description: "Protocols & Reference Materials",
      access: "Inside - cabinet with lock",
      image: "/images/compartments/compartment-e-protocols.jpg",
      contents: ["ME EMS Protocols", "Drug Log", "LIFEPAK 15 Manual", "SCBA Binder", "LVAD Info"]
    },
    "F": {
      name: "Compartment F",
      description: "PPE Supplies",
      access: "Inside - upper cabinet",
      image: "/images/compartments/compartment-f-ppe.jpg",
      contents: ["Gowns", "N95 Masks", "Surgical Masks", "Protective Eyewear", "Face Shields"]
    },
    "G": {
      name: "Compartment G",
      description: "Airway Supplies",
      access: "Inside - glass cabinet with 'AIRWAY SUPPLIES' label",
      image: "/images/compartments/compartment-g-airway.jpg",
      contents: ["Nasal Airways (NPA)", "Oral Airways (OPA)", "King Airways", "Tube Holders", "CO2 Adapters", "Non-Rebreather Masks", "End Tidal CO2", "Adult Oxygen Nasal Cannulas", "Nebulizers"]
    },
    "H": {
      name: "Compartment H",
      description: "BVM & Ventilation",
      access: "Inside - glass cabinet with 'BAG VALVE MASKS' label",
      image: "/images/compartments/compartment-h-bvm.jpg",
      contents: ["Bag Valve Masks (BVM)", "Face Masks for BVM", "Suction Catheters", "Suction Tubing"]
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
// APP_VERSION is loaded from /version.js (single source of truth)
// It's included in index.html before this script
const VERSION_CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour when online

// Check for updates automatically
async function checkForUpdates(showIfCurrent = false) {
  if (!navigator.onLine) return;

  try {
    // CRITICAL: Add cache-busting and force no-cache headers
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    if (!response.ok) return;

    const data = await response.json();
    const serverVersion = data.version;
    const currentVersion = APP_VERSION;

    console.log(`[Update] Server: v${serverVersion}, Current: v${currentVersion}`);

    if (serverVersion !== currentVersion) {
      // New version available
      console.log('[Update] New version detected - showing notification');
      showUpdateNotification(serverVersion, data.changelog);
    } else if (showIfCurrent) {
      showVersionInfo('App is up to date!');
    }
  } catch (e) {
    console.log('[Update] Check failed (offline?):', e.message);
  }
}

function showUpdateNotification(newVersion, changelog) {
  // AUTO-UPDATE: Don't prompt - just apply the update immediately
  console.log(`[Update] Auto-applying update to v${newVersion}`);

  // Show brief "Updating..." message
  const statusText = document.getElementById('status-text');
  if (statusText) {
    statusText.textContent = `Updating to v${newVersion}...`;
  }

  // Apply update after brief delay so user sees message
  setTimeout(() => applyUpdate(), 500);
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
  // CRITICAL: Check IMMEDIATELY on every page load (no delay, no cache)
  // Clear any previous dismissal - always check on fresh load
  sessionStorage.removeItem('hnfd_update_dismissed');
  checkForUpdates();

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
// SHARE APP - Let EMTs share with each other via native share or clipboard
// ============================================================================
async function shareApp() {
  const shareBtn = document.getElementById('share-btn');
  const shareData = {
    title: 'HNFD Rescue - Equipment Finder',
    text: 'Find equipment fast on the HNFD ambulance. Voice-enabled, works offline!',
    url: 'https://hnfd-rescue.vercel.app'
  };

  hapticFeedback('light');

  // Try native Web Share API first (works great on mobile)
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      console.log('[Share] Shared successfully via native share');
      shareBtn.classList.add('shared');
      setTimeout(() => shareBtn.classList.remove('shared'), 1000);
      return;
    } catch (err) {
      // User cancelled or share failed - fall through to clipboard
      if (err.name !== 'AbortError') {
        console.log('[Share] Native share failed:', err);
      }
    }
  }

  // Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(shareData.url);
    console.log('[Share] URL copied to clipboard');
    hapticFeedback('success');
    shareBtn.classList.add('shared');

    // Show feedback
    const originalText = statusText.textContent;
    statusText.textContent = 'Link copied!';
    setTimeout(() => {
      statusText.textContent = originalText;
      shareBtn.classList.remove('shared');
    }, 2000);
  } catch (err) {
    console.error('[Share] Clipboard failed:', err);
    // Last resort: show URL in alert
    alert('Share this URL with other EMTs:\n\nhttps://hnfd-rescue.vercel.app');
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
// CRITICAL: This is life-safety code - must work 100% of the time
// ============================================================================
let recognitionInitialized = false;
let recognitionAttempts = 0;
const MAX_RECOGNITION_ATTEMPTS = 5;
let recognitionStarting = false; // Prevent race conditions
let recognitionCleanupTimer = null;

/**
 * Initialize speech recognition with bulletproof error handling
 * This MUST work on iOS Safari in emergency situations
 */
function initSpeechRecognition() {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[Speech] Web Speech API not available on this device');
      if (voiceBtn) voiceBtn.style.display = 'none';
      if (voiceLabel) voiceLabel.textContent = 'Voice not supported - use text search';
      return false;
    }

    // CRITICAL: Always recreate recognition object to avoid stale state
    // iOS Safari can get into bad states if we reuse the object
    if (recognition) {
      try {
        recognition.abort();
      } catch (e) {
        console.log('[Speech] Could not abort old recognition:', e);
      }
      recognition = null;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      console.log('[Speech] ✅ Recognition started successfully');
      isListening = true;
      recognitionStarting = false;
      recognitionAttempts = 0; // Reset on success

      // Clear any pending cleanup
      if (recognitionCleanupTimer) {
        clearTimeout(recognitionCleanupTimer);
        recognitionCleanupTimer = null;
      }

      // Update UI
      if (voiceBtn) voiceBtn.classList.add('listening');
      if (voiceIcon) voiceIcon.textContent = '🔴';
      if (voiceLabel) voiceLabel.textContent = 'Listening... speak now';
      if (transcript) transcript.textContent = '';
      if (statusText) statusText.textContent = 'Listening';
      if (voiceCancelBtn) voiceCancelBtn.style.display = 'flex';
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

      if (transcript) transcript.textContent = finalTranscript || interimTranscript;

      if (finalTranscript) {
        console.log('[Speech] Raw input:', finalTranscript);

        // CRITICAL: Match spoken text to valid equipment ONLY
        const matchedEquipment = matchToValidEquipment(finalTranscript);
        console.log('[Speech] Matched to:', matchedEquipment);

        lastSearchWasVoice = true;
        search(matchedEquipment);
      }
    };

    recognition.onerror = (event) => {
      console.error('[Speech] ❌ Recognition error:', event.error);
      recognitionStarting = false;

      // Handle specific errors with clear user guidance
      if (event.error === 'no-speech') {
        if (transcript) transcript.textContent = 'No speech detected. Tap to try again.';
        // Auto-recover: restart after brief delay
        recognitionCleanupTimer = setTimeout(() => {
          if (!isListening) {
            console.log('[Speech] Auto-recovering from no-speech...');
            startListening();
          }
        }, 2000);
      } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        // SMART PERMISSION HANDLING: Show helpful modal instead of text error
        handleMicrophoneError(event.error);
        recognitionInitialized = false; // Force re-init on next attempt
      } else if (event.error === 'network') {
        if (transcript) transcript.textContent = 'Network error. Checking connection...';
        // Auto-retry network errors
        recognitionCleanupTimer = setTimeout(() => {
          console.log('[Speech] Retrying after network error...');
          startListening();
        }, 1500);
      } else if (event.error === 'aborted') {
        // User cancelled - this is normal, don't show error
        console.log('[Speech] Recognition aborted by user');
      } else if (event.error === 'audio-capture') {
        // Don't show scary error - just reset to ready state
        if (transcript) transcript.textContent = 'Tap microphone to try again';
        console.log('[Speech] Audio capture issue - mic may be in use by another app');
      } else {
        // Unknown error - try to recover
        console.error('[Speech] Unknown error:', event.error);
        if (transcript) transcript.textContent = 'Voice error. Retrying...';

        // Force re-initialization
        recognitionInitialized = false;
        recognition = null;

        // Auto-retry unknown errors
        if (recognitionAttempts < MAX_RECOGNITION_ATTEMPTS) {
          recognitionCleanupTimer = setTimeout(() => {
            console.log('[Speech] Auto-recovering from unknown error...');
            startListening();
          }, 1000);
        }
      }

      stopListening();
    };

    recognition.onend = () => {
      console.log('[Speech] Recognition ended');
      recognitionStarting = false;

      // CRITICAL: Always reset state when recognition ends
      stopListening();

      // iOS Safari workaround: Sometimes onend fires without onerror
      // If we were listening and expected to continue, restart
      if (isListening) {
        console.log('[Speech] Unexpected end while listening - auto-restarting');
        recognitionCleanupTimer = setTimeout(() => {
          startListening();
        }, 300);
      }
    };

    recognitionInitialized = true;
    console.log('[Speech] ✅ Web Speech API initialized successfully');
    return true;

  } catch (e) {
    console.error('[Speech] ❌ Failed to initialize:', e);
    if (voiceLabel) voiceLabel.textContent = 'Voice unavailable';
    recognitionInitialized = false;
    recognitionStarting = false;
    return false;
  }
}

/**
 * Start listening with comprehensive error handling and recovery
 * MUST work reliably on iOS Safari for emergency situations
 */
function startListening() {
  console.log('[Speech] 🎤 startListening called, isListening:', isListening, 'recognitionStarting:', recognitionStarting);

  // Prevent race conditions
  if (recognitionStarting) {
    console.log('[Speech] Already starting, ignoring duplicate call');
    return;
  }

  // If already listening, this is a toggle to stop
  if (isListening) {
    console.log('[Speech] Already listening, stopping');
    try {
      if (recognition) recognition.stop();
    } catch (e) {
      console.warn('[Speech] Error stopping:', e);
      // Force state reset
      stopListening();
    }
    return;
  }

  recognitionStarting = true;

  // Auto-initialize if not done yet OR if we had errors
  if (!recognition || !recognitionInitialized) {
    console.log('[Speech] Recognition not ready, initializing...');
    const success = initSpeechRecognition();
    if (!success) {
      if (transcript) transcript.textContent = 'Voice not available on this device';
      console.error('[Speech] ❌ Could not initialize recognition');
      recognitionStarting = false;
      return;
    }
  }

  // Set UI state BEFORE starting (iOS Safari requirement)
  if (voiceBtn) voiceBtn.classList.add('listening');
  if (voiceIcon) voiceIcon.textContent = '🔴';
  if (voiceLabel) voiceLabel.textContent = 'Starting microphone...';
  if (transcript) transcript.textContent = '';
  if (statusText) statusText.textContent = 'Starting...';
  if (voiceCancelBtn) voiceCancelBtn.style.display = 'flex';

  try {
    console.log('[Speech] 🚀 Starting recognition...');
    recognition.start();
    console.log('[Speech] ✅ recognition.start() called successfully');

    // Safety timeout: If onstart doesn't fire within 3 seconds, something is wrong
    const startTimeout = setTimeout(() => {
      if (recognitionStarting && !isListening) {
        console.error('[Speech] ⏰ Timeout waiting for recognition to start');
        recognitionStarting = false;
        stopListening();
        if (transcript) transcript.textContent = 'Microphone timeout. Tap to retry.';

        // Force re-init
        recognitionInitialized = false;
        recognition = null;
      }
    }, 3000);

    // Clear timeout if we start successfully
    recognition.addEventListener('start', () => {
      clearTimeout(startTimeout);
    }, { once: true });

  } catch (e) {
    console.error('[Speech] ❌ Could not start recognition:', e.message);
    recognitionStarting = false;

    // Handle "already started" error - iOS Safari edge case
    if (e.message && e.message.includes('already started')) {
      console.log('[Speech] Recognition already running, forcing restart...');
      try {
        recognition.abort(); // Use abort instead of stop for force-kill
        recognitionAttempts++;
        if (recognitionAttempts < MAX_RECOGNITION_ATTEMPTS) {
          setTimeout(() => {
            recognitionStarting = false;
            startListening();
          }, 200);
        } else {
          stopListening();
          if (transcript) transcript.textContent = 'Voice stuck. Refresh page to fix.';
        }
      } catch (e2) {
        console.error('[Speech] Restart failed:', e2);
        stopListening();
        if (transcript) transcript.textContent = 'Voice error. Refresh page.';
      }
    } else if (e.message && e.message.includes('not-allowed')) {
      stopListening();
      // SMART PERMISSION HANDLING: Show helpful modal instead of text error
      handleMicrophoneError('not-allowed');
    } else {
      // Unknown error - full recovery sequence
      stopListening();
      recognitionInitialized = false;
      recognition = null;
      recognitionAttempts++;

      if (recognitionAttempts < MAX_RECOGNITION_ATTEMPTS) {
        console.log('[Speech] 🔄 Attempting recovery, attempt:', recognitionAttempts);
        if (transcript) transcript.textContent = `Retrying... (${recognitionAttempts}/${MAX_RECOGNITION_ATTEMPTS})`;
        setTimeout(() => {
          recognitionStarting = false;
          startListening();
        }, 500);
      } else {
        if (transcript) transcript.textContent = 'Voice unavailable. Use text search or refresh page.';
        // Reset attempts after showing error
        setTimeout(() => {
          recognitionAttempts = 0;
        }, 5000);
      }
    }
  }
}

/**
 * Stop listening and reset all state
 */
function stopListening() {
  console.log('[Speech] 🛑 Stopping listening');
  isListening = false;
  recognitionStarting = false;

  if (voiceBtn) voiceBtn.classList.remove('listening');
  if (voiceIcon) voiceIcon.textContent = '🎤';
  if (voiceLabel) voiceLabel.textContent = 'Tap to ask where something is';
  if (statusText) statusText.textContent = 'Ready';
  if (voiceCancelBtn) voiceCancelBtn.style.display = 'none';

  // Clear any pending cleanup timers
  if (recognitionCleanupTimer) {
    clearTimeout(recognitionCleanupTimer);
    recognitionCleanupTimer = null;
  }
}

/**
 * User-initiated cancellation
 */
function cancelListening() {
  console.log('[Speech] 🚫 Cancelled by user');

  // Clear any auto-recovery timers
  if (recognitionCleanupTimer) {
    clearTimeout(recognitionCleanupTimer);
    recognitionCleanupTimer = null;
  }

  if (recognition && (isListening || recognitionStarting)) {
    try {
      recognition.abort(); // Use abort for immediate stop
    } catch (e) {
      console.warn('[Speech] Error aborting:', e);
    }
  }

  stopListening();

  if (transcript) {
    transcript.textContent = 'Cancelled';
    setTimeout(() => {
      transcript.textContent = '';
    }, 1500);
  }

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

        <!-- LOCATION FIRST - Most important info up front -->
        <div class="result-location-primary">
          <span class="location-icon-large">📍</span>
          <span class="location-text-large">${item.location}</span>
        </div>
        ${item.color ? `<div class="result-color-inline">Color: <strong>${item.color}</strong></div>` : ''}

        ${item.images ? `
          <button class="location-guide-btn" onclick="showLocationGuide('${item.id}')">
            📍 View Location Guide (3 Steps)
          </button>
        ` : ''}

        ${item.image ? `
          <div class="result-image-container">
            <img src="${getImageUrl(item)}" alt="${item.name}" class="result-image" onclick="toggleImageZoom(this)" />
            <div class="image-hint">Tap image to enlarge ${getCustomImage(item.id) ? '• Custom Image' : ''}</div>
          </div>
        ` : ''}

        <div class="result-details">
          ${item.description || ''}
          ${item.driverNote ? `<br><br><strong>Driver Note:</strong> ${item.driverNote}` : ''}
          ${item.notes ? `<br><br>${item.notes}` : ''}
        </div>

        ${item.warning ? `<div class="result-warning">⚠️ ${item.warning}</div>` : ''}

        ${item.usageNotes ? `
          <div class="result-usage-notes">
            <div class="usage-notes-header">📋 EMT Reference Notes</div>
            <div class="usage-notes-content">${item.usageNotes.replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}

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

  // AUTO-SCROLL: Scroll to results so user sees them immediately
  // Critical for emergency situations - don't make them hunt for the result
  setTimeout(() => {
    const topResult = document.getElementById('topResult');
    if (topResult) {
      topResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
      console.log('[UI] Auto-scrolled to result');
    }
  }, 100);

  // AUTO-SPEAK: Always speak results immediately - this is life-saving equipment!
  // EMTs need hands-free operation - don't make them tap a button
  if (currentResult) {
    lastSearchWasVoice = false; // Reset flag regardless
    console.log('[TTS] Auto-speaking result for:', currentResult.name);

    // Delay to ensure:
    // 1. Speech recognition is fully stopped (iOS requirement)
    // 2. UI is rendered and scrolled
    // 3. Audio context is ready
    setTimeout(() => {
      if (currentResult) {
        // Cancel any lingering speech recognition
        if (recognition) {
          try { recognition.abort(); } catch(e) {}
        }
        isListening = false;
        recognitionStarting = false;

        // Initialize audio and speak
        initializeAudio();
        speakResult();
      }
    }, 600); // Slight delay after scroll
  }
}

// ============================================================================
// ROTATING LOCATION GUIDE (3-image sequence: ambulance → drawer → equipment)
// ============================================================================
let guideInterval = null;
let guideCurrentStep = 0;
let guideSteps = [];

function showLocationGuide(itemId) {
  const item = INVENTORY_DATABASE.items.find(i => i.id === itemId);
  if (!item || !item.images) {
    alert('Location guide not available for this item');
    return;
  }

  // Build the image steps
  guideSteps = [];
  if (item.images.ambulancePosition) {
    guideSteps.push({
      url: item.images.ambulancePosition,
      label: 'Step 1: Find this area on the ambulance',
      dot: item.goldDots?.ambulancePosition
    });
  }
  if (item.images.compartmentView) {
    guideSteps.push({
      url: item.images.compartmentView,
      label: 'Step 2: Open this drawer/cabinet',
      dot: item.goldDots?.compartmentView
    });
  }
  if (item.images.equipmentPhoto) {
    guideSteps.push({
      url: item.images.equipmentPhoto,
      label: 'Step 3: Grab this item',
      dot: item.goldDots?.equipmentPhoto
    });
  }

  if (guideSteps.length === 0) {
    alert('No location images available');
    return;
  }

  // Create modal using safe DOM methods
  const modal = document.createElement('div');
  modal.id = 'location-guide-modal';
  modal.className = 'guide-modal';

  const content = document.createElement('div');
  content.className = 'guide-content';

  // Header
  const header = document.createElement('div');
  header.className = 'guide-header';
  const title = document.createElement('h3');
  title.textContent = '📍 ' + item.name + ' Location';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'guide-close-btn';
  closeBtn.textContent = '✕';
  closeBtn.onclick = closeLocationGuide;
  header.appendChild(title);
  header.appendChild(closeBtn);

  // Image container
  const imgContainer = document.createElement('div');
  imgContainer.className = 'guide-image-container';
  const img = document.createElement('img');
  img.id = 'guide-image';
  img.className = 'guide-image'; // CRITICAL: Apply CSS class for object-fit: contain
  img.src = guideSteps[0].url;
  img.alt = 'Location guide';
  const dot = document.createElement('div');
  dot.id = 'guide-dot';
  dot.className = 'guide-dot';
  dot.style.display = 'none';
  imgContainer.appendChild(img);
  imgContainer.appendChild(dot);

  // Label container
  const labelContainer = document.createElement('div');
  labelContainer.className = 'guide-label-container';
  const stepNumber = document.createElement('div');
  stepNumber.className = 'guide-step-number';
  stepNumber.id = 'guide-step-number';
  stepNumber.textContent = 'Step 1 of ' + guideSteps.length;
  const labelText = document.createElement('div');
  labelText.className = 'guide-label-text';
  labelText.id = 'guide-label';
  labelText.textContent = guideSteps[0].label;
  labelContainer.appendChild(stepNumber);
  labelContainer.appendChild(labelText);

  // Progress dots
  const progress = document.createElement('div');
  progress.className = 'guide-progress';
  guideSteps.forEach((_, i) => {
    const stepDot = document.createElement('span');
    stepDot.className = 'guide-progress-dot' + (i === 0 ? ' active' : '');
    stepDot.dataset.step = i;
    progress.appendChild(stepDot);
  });

  // Controls
  const controls = document.createElement('div');
  controls.className = 'guide-controls';
  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'guide-play-btn';
  pauseBtn.id = 'guide-pause-btn';
  pauseBtn.textContent = '⏸ Pause';
  pauseBtn.onclick = toggleGuidePlayback;
  controls.appendChild(pauseBtn);

  // Assemble
  content.appendChild(header);
  content.appendChild(imgContainer);
  content.appendChild(labelContainer);
  content.appendChild(progress);
  content.appendChild(controls);
  modal.appendChild(content);
  document.body.appendChild(modal);

  // Position gold dot if available
  updateGuideDot(guideSteps[0].dot);

  // Start auto-rotation (1.5 seconds per image)
  guideCurrentStep = 0;
  startGuideRotation();
}

function startGuideRotation() {
  guideInterval = setInterval(() => {
    guideCurrentStep = (guideCurrentStep + 1) % guideSteps.length;
    const step = guideSteps[guideCurrentStep];

    const img = document.getElementById('guide-image');
    const label = document.getElementById('guide-label');
    const stepNum = document.getElementById('guide-step-number');
    if (img) img.src = step.url;
    if (label) label.textContent = step.label;
    if (stepNum) stepNum.textContent = 'Step ' + (guideCurrentStep + 1) + ' of ' + guideSteps.length;
    updateGuideDot(step.dot);

    // Update progress dots
    document.querySelectorAll('.guide-progress-dot').forEach((el, i) => {
      el.classList.toggle('active', i === guideCurrentStep);
    });
  }, 1500);
}

function updateGuideDot(dotData) {
  const dotEl = document.getElementById('guide-dot');
  if (!dotEl) return;

  if (dotData && dotData.x && dotData.y) {
    dotEl.style.display = 'block';
    dotEl.style.left = dotData.x + '%';
    dotEl.style.top = dotData.y + '%';
    // Clear and add label safely
    dotEl.textContent = '';
    if (dotData.label) {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'dot-label';
      labelSpan.textContent = dotData.label;
      dotEl.appendChild(labelSpan);
    }
  } else {
    dotEl.style.display = 'none';
  }
}

function toggleGuidePlayback() {
  const btn = document.getElementById('guide-pause-btn');
  if (!btn) return;

  if (guideInterval) {
    clearInterval(guideInterval);
    guideInterval = null;
    btn.textContent = '▶ Play';
  } else {
    startGuideRotation();
    btn.textContent = '⏸ Pause';
  }
}

function closeLocationGuide() {
  if (guideInterval) {
    clearInterval(guideInterval);
    guideInterval = null;
  }
  const modal = document.getElementById('location-guide-modal');
  if (modal) modal.remove();
}

// Make location guide functions globally accessible for onclick handlers
window.showLocationGuide = showLocationGuide;
window.closeLocationGuide = closeLocationGuide;

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

async function speakResult(retryCount = 0) {
  if (!currentResult) {
    console.error('[TTS] No result to speak');
    return;
  }

  if (!synthesis) {
    console.error('[TTS] Speech synthesis not available');
    return;
  }

  console.log('[TTS] speakResult called, retry:', retryCount);

  // Cancel any ongoing speech
  synthesis.cancel();

  // Small delay after cancel to ensure clean state
  await new Promise(resolve => setTimeout(resolve, 100));

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

    // Retry up to 2 times on error
    if (retryCount < 2) {
      console.log('[TTS] Retrying speech...');
      setTimeout(() => speakResult(retryCount + 1), 300);
    } else {
      statusText.textContent = 'Tap speaker to hear location';
      setTimeout(() => statusText.textContent = 'Ready', 3000);
    }
  };

  try {
    console.log('[TTS] Calling synthesis.speak()');
    synthesis.speak(utterance);
  } catch (e) {
    console.error('[TTS] Exception:', e);
    // Retry on exception
    if (retryCount < 2) {
      setTimeout(() => speakResult(retryCount + 1), 300);
    } else {
      statusText.textContent = 'Tap speaker to hear location';
      setTimeout(() => statusText.textContent = 'Ready', 2000);
    }
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
// EVENT LISTENERS - CRITICAL: Single handlers only to prevent race conditions
// ============================================================================

/**
 * Voice button click handler - MUST be reliable for emergency situations
 * Uses addEventListener instead of onclick to properly handle event propagation
 */
voiceBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation(); // Prevent bubbling to voice-section

  console.log('[VoiceBtn] Click handler triggered, isListening:', isListening, 'recognitionStarting:', recognitionStarting);

  hapticFeedback('medium');

  // Toggle: Stop if listening, start if not
  if (isListening || recognitionStarting) {
    console.log('[VoiceBtn] Stopping recognition');
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.warn('[VoiceBtn] Error stopping:', e);
        stopListening(); // Force state reset
      }
    }
  } else {
    // SIMPLIFIED: Just start listening directly - let the browser handle permission prompts
    // This is how v1/v2 worked and it was reliable
    console.log('[VoiceBtn] Starting recognition directly');
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
  // Don't trigger if clicking inside the button containers
  if (!e.target.closest('.voice-btn') && !e.target.closest('.voice-cancel-btn') && !isListening) {
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

// Share button - allows EMTs to share the app with each other
document.getElementById('share-btn')?.addEventListener('click', shareApp);

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
// MICROPHONE PERMISSION MANAGEMENT - Smart permission flow
// ============================================================================
const MIC_PERMISSION_KEY = 'hnfd-mic-permission-status';
const MIC_SETUP_SHOWN_KEY = 'hnfd-mic-setup-shown';

/**
 * Check if this is the first time the user is using the app
 * SIMPLIFIED: Don't show onboarding modals - let browser handle permission prompts naturally
 * This is how v1/v2 worked and was reliable on iOS Safari
 */
function checkMicrophoneSetup() {
  // DISABLED: The modal-based permission flow was blocking speech recognition
  // Just let the browser handle permission prompts when user taps the microphone
  console.log('[MicPerm] Skipping setup check - using direct browser permission flow');
  return false;
}

/**
 * Show the microphone onboarding modal for first-time users
 */
function showMicOnboardingModal() {
  const modal = document.getElementById('mic-onboarding-modal');
  if (modal) {
    modal.classList.add('active');
    localStorage.setItem(MIC_SETUP_SHOWN_KEY, 'true');
    console.log('[MicPerm] Showing onboarding modal');
  }
}

/**
 * Show the microphone blocked help modal
 */
function showMicBlockedModal() {
  const modal = document.getElementById('mic-blocked-modal');
  if (modal) {
    modal.classList.add('active');
    console.log('[MicPerm] Showing blocked help modal');
  }
}

/**
 * Close the onboarding modal
 */
function closeMicOnboardingModal() {
  const modal = document.getElementById('mic-onboarding-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Close the blocked help modal
 */
function closeMicBlockedModal() {
  const modal = document.getElementById('mic-blocked-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  // Update transcript to show text search is available
  const transcript = document.getElementById('transcript');
  if (transcript) {
    transcript.textContent = 'Voice disabled - type equipment name below';
  }
}

/**
 * Request microphone permission - triggered by user clicking Enable button
 */
async function requestMicrophonePermission() {
  console.log('[MicPerm] User requesting microphone permission');

  closeMicOnboardingModal();

  // Show feedback in UI
  const transcript = document.getElementById('transcript');
  if (transcript) {
    transcript.textContent = 'Requesting microphone access...';
  }

  try {
    // Try to get microphone stream - this triggers the permission prompt
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Permission granted! Stop the stream immediately
    stream.getTracks().forEach(track => track.stop());

    console.log('[MicPerm] ✅ Permission granted!');
    localStorage.setItem(MIC_PERMISSION_KEY, 'granted');

    // Update UI
    if (transcript) {
      transcript.textContent = '✓ Voice search enabled! Tap microphone to speak.';
    }

    // Auto-start listening after a brief delay
    setTimeout(() => {
      if (!isListening && !recognitionStarting) {
        startListening();
      }
    }, 800);

    return true;
  } catch (err) {
    console.error('[MicPerm] ❌ Permission denied or error:', err.name, err.message);

    // Store denied status
    localStorage.setItem(MIC_PERMISSION_KEY, 'denied');

    // Check if it's a permission denied error
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      // Show the help modal with steps to enable
      showMicBlockedModal();
    } else {
      // Some other error - don't show scary message
      if (transcript) {
        transcript.textContent = 'Tap microphone to try again';
      }
    }

    return false;
  }
}

/**
 * User chooses to skip microphone setup
 */
function skipMicrophoneSetup() {
  console.log('[MicPerm] User skipped microphone setup');
  localStorage.setItem(MIC_PERMISSION_KEY, 'skipped');
  closeMicOnboardingModal();

  const transcript = document.getElementById('transcript');
  if (transcript) {
    transcript.textContent = 'Type equipment name below to search';
  }
}

/**
 * Retry microphone permission after user changed settings
 */
async function retryMicrophonePermission() {
  console.log('[MicPerm] Retrying microphone permission');
  closeMicBlockedModal();

  // Clear the denied status so we can try again
  localStorage.removeItem(MIC_PERMISSION_KEY);

  // Request permission again
  const success = await requestMicrophonePermission();

  if (!success) {
    // Still denied - show blocked modal again
    setTimeout(() => {
      showMicBlockedModal();
    }, 500);
  }
}

/**
 * Check if microphone permission is currently granted
 */
async function isMicrophonePermissionGranted() {
  // Check localStorage first
  const stored = localStorage.getItem(MIC_PERMISSION_KEY);
  if (stored === 'granted') {
    return true;
  }
  if (stored === 'denied' || stored === 'skipped') {
    return false;
  }

  // Try permissions API (doesn't work on iOS Safari)
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      if (result.state === 'granted') {
        localStorage.setItem(MIC_PERMISSION_KEY, 'granted');
        return true;
      }
      if (result.state === 'denied') {
        localStorage.setItem(MIC_PERMISSION_KEY, 'denied');
        return false;
      }
    } catch (e) {
      // Permissions API not supported
    }
  }

  return null; // Unknown - need to ask
}

/**
 * Handle microphone error - show modal instead of text error
 */
function handleMicrophoneError(error) {
  console.log('[MicPerm] Handling error:', error);

  if (error === 'not-allowed' || error === 'permission-denied') {
    localStorage.setItem(MIC_PERMISSION_KEY, 'denied');
    showMicBlockedModal();
    return true; // Handled
  }

  return false; // Not a permission error
}

// ============================================================================
// INITIALIZATION - CRITICAL: Auto-start listening for life-safety
// ============================================================================
initSpeechRecognition();

// Initialize audio on first user interaction (required for iOS)
function initializeAudio() {
  if (audioInitialized || !synthesis) return;

  try {
    const utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0;
    synthesis.speak(utterance);
    audioInitialized = true;
    console.log('[TTS] Audio initialized');
  } catch (e) {
    console.error('[TTS] Audio init failed:', e);
  }
}

// ============================================================================
// AUTO-START LISTENING when app loads
// SIMPLIFIED: Just initialize and wait for user to tap microphone
// ============================================================================
async function autoStartListening() {
  console.log('[AutoStart] 🚀 Initializing speech recognition...');

  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('[AutoStart] ❌ Speech recognition not supported');
      if (transcript) transcript.textContent = 'Voice not supported - use text search';
      return;
    }

    // Just initialize - let user tap microphone to start
    const initSuccess = initSpeechRecognition();
    if (initSuccess) {
      console.log('[AutoStart] ✅ Ready - waiting for user to tap microphone');
      if (transcript) transcript.textContent = 'Tap microphone to search by voice';
    } else {
      console.log('[AutoStart] ❌ Could not initialize');
      if (transcript) transcript.textContent = 'Tap microphone to try voice search';
    }
  } catch (e) {
    console.error('[AutoStart] ❌ Error:', e);
    if (transcript) transcript.textContent = 'Tap microphone to start';
  }
}

// Load voices (needed for some browsers)
if (synthesis) {
  synthesis.onvoiceschanged = () => {
    console.log('[TTS] Voices loaded:', synthesis.getVoices().length);
  };
  synthesis.getVoices();
}

// ============================================================================
// INITIALIZATION SEQUENCE
// ============================================================================

/**
 * Primary initialization - SIMPLIFIED: Just initialize, wait for user tap
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Init] 📱 DOM loaded, initializing...');

  // Initialize audio context unlock for iOS
  initializeAudio();

  // Initialize speech recognition (will show "Tap microphone to search by voice")
  setTimeout(autoStartListening, 800);
});

/**
 * First user interaction - unlock audio for iOS Safari
 */
let hasUnlockedAudio = false;
document.addEventListener('click', () => {
  if (!hasUnlockedAudio) {
    hasUnlockedAudio = true;
    console.log('[Init] 👆 First tap - unlocking audio');
    initializeAudio();
  }
}, { once: true });

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
// A-Z BROWSE FEATURE - Alphabetical equipment list
// ============================================================================

/**
 * Open the A-Z browse modal with scrollable tappable list
 */
function openAZBrowse() {
  const modal = document.getElementById('az-modal');
  const listEl = document.getElementById('az-list');
  const countEl = document.getElementById('az-count');

  if (!modal || !listEl) return;

  // Sort equipment alphabetically by name
  const sortedEquipment = [...INVENTORY_DATABASE.items].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Build scrollable button list
  let html = '';
  sortedEquipment.forEach(item => {
    const criticalClass = item.critical ? ' az-item-critical' : '';
    html += `<button class="az-item${criticalClass}" onclick="selectAZItem('${item.id}')">${item.name}</button>`;
  });

  listEl.innerHTML = html;
  countEl.textContent = `${sortedEquipment.length} items - tap to select`;

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the A-Z browse modal
 */
function closeAZBrowse() {
  const modal = document.getElementById('az-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Open the Compartment Browse modal with visual compartment cards
 */
function openCompartmentBrowse() {
  const modal = document.getElementById('compartment-modal');
  const listEl = document.getElementById('compartment-list');
  if (!modal || !listEl) return;

  // Get compartments that have images (the new HNFR ones)
  const compartmentsWithImages = ['A', 'B', 'C', 'OB', 'E', 'F', 'G', 'H'];

  let html = '';
  compartmentsWithImages.forEach(key => {
    const comp = INVENTORY_DATABASE.compartments[key];
    if (!comp || !comp.image) return;

    const contentsPreview = comp.contents ? comp.contents.slice(0, 4).join(', ') + (comp.contents.length > 4 ? '...' : '') : '';

    html += `
      <div class="compartment-card" onclick="showCompartmentDetail('${key}')">
        <img src="${comp.image}" alt="${comp.name}" class="compartment-thumb">
        <div class="compartment-info">
          <div class="compartment-name">${comp.name}</div>
          <div class="compartment-desc">${comp.description}</div>
          <div class="compartment-contents">${contentsPreview}</div>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCompartmentBrowse() {
  const modal = document.getElementById('compartment-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function showCompartmentDetail(key) {
  const comp = INVENTORY_DATABASE.compartments[key];
  if (!comp) return;

  closeCompartmentBrowse();

  // Show full-screen image with contents overlay
  const overlay = document.createElement('div');
  overlay.className = 'compartment-detail-overlay';
  overlay.innerHTML = `
    <div class="compartment-detail-content">
      <button class="compartment-detail-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      <img src="${comp.image}" alt="${comp.name}" class="compartment-detail-img">
      <div class="compartment-detail-info">
        <h3>${comp.name}</h3>
        <p class="compartment-access"><strong>Access:</strong> ${comp.access}</p>
        <div class="compartment-contents-list">
          <strong>Contents:</strong>
          <ul>${comp.contents ? comp.contents.map(c => `<li>${c}</li>`).join('') : ''}</ul>
        </div>
      </div>
    </div>
  `;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

/**
 * Select an item from the A-Z list and show its details
 */
function selectAZItem(itemId) {
  if (!itemId) return;

  closeAZBrowse();

  // Find the item
  const item = INVENTORY_DATABASE.items.find(e => e.id === itemId);
  if (!item) return;

  // Display the result
  displayResults([item]);

  // Scroll to results
  const resultsSection = document.getElementById('results');
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Make A-Z functions globally accessible for onclick handlers
window.openAZBrowse = openAZBrowse;
window.selectAZItem = selectAZItem;
window.closeAZBrowse = closeAZBrowse;

// A-Z Browse button click handler
const azBrowseBtn = document.getElementById('azBrowseBtn');
if (azBrowseBtn) {
  azBrowseBtn.addEventListener('click', openAZBrowse);
}

// A-Z Close button click handler
const azCloseBtn = document.getElementById('az-close-btn');
if (azCloseBtn) {
  azCloseBtn.addEventListener('click', closeAZBrowse);
}

// Close A-Z modal on background click
const azModal = document.getElementById('az-modal');
if (azModal) {
  azModal.addEventListener('click', (e) => {
    if (e.target === azModal) {
      closeAZBrowse();
    }
  });
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
const CUSTOM_IMAGES_KEY = 'hnfd_custom_images'; // Store custom images
let adminAuthenticated = false;
let customInventory = null;
let customImages = {}; // { itemId: base64ImageData }

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
  } catch (e) {
    console.error('[Admin] Failed to save inventory:', e);
  }
}

// ============================================================================
// CUSTOM IMAGE MANAGEMENT - Camera Capture & Storage
// ============================================================================

// Load custom images from localStorage
function loadCustomImages() {
  const stored = localStorage.getItem(CUSTOM_IMAGES_KEY);
  if (stored) {
    try {
      customImages = JSON.parse(stored);
      console.log('[Images] Loaded custom images:', Object.keys(customImages).length);
    } catch (e) {
      console.error('[Images] Failed to load custom images:', e);
      customImages = {};
    }
  }
}

// Save custom images to localStorage
function saveCustomImages() {
  try {
    localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(customImages));
    console.log('[Images] Saved custom images:', Object.keys(customImages).length);
  } catch (e) {
    console.error('[Images] Failed to save custom images:', e);
    alert('Failed to save image - it may be too large');
  }
}

// Get custom image for item (returns null if none)
function getCustomImage(itemId) {
  return customImages[itemId] || null;
}

// Get image URL for item (custom or default)
function getImageUrl(item) {
  const customImg = getCustomImage(item.id);
  return customImg || item.image;
}

// Open camera capture modal
function openImageCapture(itemId) {
  const item = customInventory.items.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('image-capture-modal');
  const itemName = document.getElementById('capture-item-name');
  const fileInput = document.getElementById('capture-file-input');

  itemName.textContent = item.name;
  modal.dataset.itemId = itemId;
  modal.classList.add('active');

  // Trigger file input for camera/gallery
  fileInput.click();
}

// Handle image file selection
function handleImageCapture(event) {
  const file = event.target.files[0];
  if (!file) return;

  const modal = document.getElementById('image-capture-modal');
  const itemId = modal.dataset.itemId;
  const preview = document.getElementById('capture-preview');
  const previewImg = document.getElementById('capture-preview-img');
  const controls = document.getElementById('capture-controls');

  const reader = new FileReader();
  reader.onload = (e) => {
    // Show preview
    previewImg.src = e.target.result;
    preview.style.display = 'block';
    controls.style.display = 'flex';

    // Store temporarily for save
    modal.dataset.imageData = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Save custom image
function saveCustomImage() {
  const modal = document.getElementById('image-capture-modal');
  const itemId = modal.dataset.itemId;
  const imageData = modal.dataset.imageData;

  if (!itemId || !imageData) return;

  // Store custom image
  customImages[itemId] = imageData;
  saveCustomImages();

  // Close modal and refresh admin list
  closeImageCapture();
  renderAdminItemsList();

  hapticFeedback('success');
  alert('Image saved successfully!');
}

// Reset to default image
function resetImage(itemId) {
  if (confirm('Reset to default image?')) {
    delete customImages[itemId];
    saveCustomImages();
    renderAdminItemsList();
    hapticFeedback('medium');
  }
}

// Close image capture modal
function closeImageCapture() {
  const modal = document.getElementById('image-capture-modal');
  const preview = document.getElementById('capture-preview');
  const controls = document.getElementById('capture-controls');
  const fileInput = document.getElementById('capture-file-input');

  modal.classList.remove('active');
  preview.style.display = 'none';
  controls.style.display = 'none';
  fileInput.value = '';
  delete modal.dataset.imageData;
  delete modal.dataset.itemId;
}

// Load custom images on startup
loadCustomImages();

// Legacy save function - add error handling
function saveCustomInventoryContinue() {
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

// ============================================================================
// SETTINGS MENU (User-facing settings with version info, updates, share)
// ============================================================================

const settingsModal = document.getElementById('settings-modal');

function openSettingsModal() {
  // Load version info
  loadVersionInfo();
  settingsModal.classList.add('active');
}

function closeSettingsModal() {
  settingsModal.classList.remove('active');
}

function loadVersionInfo() {
  // Display current version
  document.getElementById('settings-version').textContent = `v${APP_VERSION}`;

  // Fetch version.json for full details
  fetch('/version.json?' + Date.now())
    .then(res => res.json())
    .then(data => {
      document.getElementById('settings-build-date').textContent = data.build || '--';

      // Display changelog
      const changelog = document.getElementById('settings-changelog');
      if (data.changelog && data.changelog.length > 0) {
        changelog.innerHTML = data.changelog.map(item => {
          if (item === '---') return '<hr style="border-color: var(--gray-700); margin: 8px 0;">';
          return `<div style="margin-bottom: 6px; color: var(--gray-300);">• ${item}</div>`;
        }).join('');
      }

      // Check if on latest
      checkVersionStatus(data.version);
    })
    .catch(err => {
      console.error('[Settings] Failed to load version info:', err);
      document.getElementById('settings-update-status').innerHTML =
        '<span style="color: var(--yellow-400);">⚠️ Could not check version</span>';
    });
}

function checkVersionStatus(latestVersion) {
  const statusEl = document.getElementById('settings-update-status');

  if (latestVersion === APP_VERSION) {
    statusEl.innerHTML = '<span style="color: var(--green-500);">✓ You\'re on the latest version!</span>';
  } else {
    statusEl.innerHTML = `<span style="color: var(--yellow-400);">⚠️ Update available: v${latestVersion}</span>`;
  }
}

async function checkForUpdates() {
  const statusEl = document.getElementById('settings-update-status');
  statusEl.innerHTML = '<span style="color: var(--gray-400);">🔄 Checking for updates...</span>';

  try {
    // Force fetch fresh version.json
    const response = await fetch('/version.json?' + Date.now());
    const data = await response.json();

    if (data.version !== APP_VERSION) {
      statusEl.innerHTML = `<span style="color: var(--green-500);">🔄 Updating to v${data.version}...</span>`;

      // AUTO-UPDATE: Don't ask, just do it
      console.log(`[Update] Auto-updating from v${APP_VERSION} to v${data.version}`);

      // Clear service worker cache and reload
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.unregister();
      }

      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Force reload
      window.location.reload(true);
    } else {
      statusEl.innerHTML = '<span style="color: var(--green-500);">✓ You\'re on the latest version!</span>';
      hapticFeedback('success');
    }
  } catch (err) {
    console.error('[Settings] Update check failed:', err);
    statusEl.innerHTML = '<span style="color: var(--red-600);">❌ Could not check for updates</span>';
  }
}

function shareApp() {
  const shareData = {
    title: 'HNFD Rescue - Equipment Finder',
    text: 'Quick voice-enabled app to find equipment locations on the ambulance. Works offline!',
    url: window.location.origin
  };

  if (navigator.share) {
    navigator.share(shareData)
      .then(() => {
        hapticFeedback('success');
        console.log('[Share] App shared successfully');
      })
      .catch(err => {
        console.log('[Share] Share cancelled or failed:', err);
      });
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(window.location.origin)
      .then(() => {
        hapticFeedback('success');
        alert('Link copied to clipboard!\n\nShare this with other EMTs:\n' + window.location.origin);
      })
      .catch(() => {
        alert('Share this app:\n' + window.location.origin);
      });
  }
}

function openAdminLogin() {
  closeSettingsModal();
  adminLoginModal.classList.add('active');
  adminPasswordInput.focus();
}

// Gear button - ALWAYS opens settings modal first (with all options)
adminToggleBtn.addEventListener('click', () => {
  hapticFeedback('light');
  // Always show settings menu - user can choose what they want to do
  openSettingsModal();
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
      <div class="admin-item-actions" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
        <button class="admin-btn-small" style="background: var(--green-600);" data-item-id="${item.id}" onclick="event.stopPropagation(); openGuideEditor('${item.id}')">
          🎯 Edit Location Guide
        </button>
        <button class="admin-btn-small admin-btn-camera" data-item-id="${item.id}" onclick="event.stopPropagation(); openImageCapture('${item.id}')">
          📷 Replace Image
        </button>
        ${getCustomImage(item.id) ? `<button class="admin-btn-small admin-btn-secondary" onclick="event.stopPropagation(); resetImage('${item.id}')">🔄 Reset</button>` : ''}
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
    document.getElementById('edit-usage-notes').value = '';
    document.getElementById('edit-image').value = '';
    document.getElementById('edit-critical').checked = false;
    document.getElementById('edit-critical-rank').value = '';
    adminDeleteBtn.style.display = 'none';
    // Clear image preview
    updateImagePreview('');
    // Clear location guide preview
    updateEditGuidePreview(null);
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
    document.getElementById('edit-usage-notes').value = item.usageNotes || '';
    document.getElementById('edit-image').value = item.image || '';
    document.getElementById('edit-critical').checked = item.critical || false;
    document.getElementById('edit-critical-rank').value = item.criticalRank || '';
    adminDeleteBtn.style.display = 'block';
    // Show image preview
    updateImagePreview(item.image || '');
    // Show location guide preview
    updateEditGuidePreview(item);
  }

  adminEditModal.classList.add('active');
}

// ============================================================================
// ADMIN PHOTO UPLOAD FUNCTIONS - iPhone-friendly
// ============================================================================

/**
 * Update the image preview in the admin form
 */
function updateImagePreview(imagePath) {
  const previewBox = document.getElementById('edit-image-preview');
  if (!previewBox) return;

  if (imagePath) {
    previewBox.innerHTML = `<img src="${imagePath}" alt="Preview" onerror="this.onerror=null; this.parentNode.innerHTML='<span class=\\'image-preview-placeholder\\'>Image not found</span>';" />`;
  } else {
    previewBox.innerHTML = '<span class="image-preview-placeholder">No image</span>';
  }
}

/**
 * Trigger camera to take a new photo
 */
function takeEquipmentPhoto() {
  const cameraInput = document.getElementById('edit-image-camera');
  if (cameraInput) {
    cameraInput.click();
  }
}

/**
 * Open photo library to choose existing photo
 */
function chooseEquipmentPhoto() {
  const libraryInput = document.getElementById('edit-image-library');
  if (libraryInput) {
    libraryInput.click();
  }
}

/**
 * Handle when user selects a photo (from camera or library)
 */
function handleEquipmentPhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Create a local URL for preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;

    // Show preview
    const previewBox = document.getElementById('edit-image-preview');
    if (previewBox) {
      previewBox.innerHTML = `<img src="${dataUrl}" alt="Preview" />`;
    }

    // For now, store a placeholder path
    // In a real app, you'd upload to a server and get a URL back
    const fileName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_');
    const imagePath = `/images/${fileName}`;
    document.getElementById('edit-image').value = imagePath;

    // Show a note about the upload
    alert(`Photo selected: ${file.name}\n\nNote: In this version, the photo is shown as a preview but you'll need to manually upload it to /images/ folder on the server.`);
  };

  reader.readAsDataURL(file);

  // Reset input so same file can be selected again
  event.target.value = '';
}

/**
 * Clear the equipment photo
 */
function clearEquipmentPhoto() {
  document.getElementById('edit-image').value = '';
  updateImagePreview('');
}

// ============================================================================
// LOCATION GUIDE PREVIEW IN EDIT FORM
// ============================================================================

let editGuidePreviewInterval = null;
let editGuideCurrentStep = 1;
let editGuideImages = [];

/**
 * Update the location guide thumbnails and preview in the edit form
 */
function updateEditGuidePreview(item) {
  // Clear existing preview
  editGuideImages = [];
  pauseEditGuidePreview();

  // Get thumbnail containers
  const thumb1 = document.getElementById('edit-thumb-img1');
  const thumb2 = document.getElementById('edit-thumb-img2');
  const thumb3 = document.getElementById('edit-thumb-img3');
  const previewImg = document.getElementById('edit-guide-preview-img');
  const placeholder = document.getElementById('edit-guide-preview-placeholder');
  const dotsContainer = document.getElementById('edit-guide-preview-dots');

  if (!thumb1 || !thumb2 || !thumb3) return;

  // Reset thumbnails
  [thumb1, thumb2, thumb3].forEach((thumb, i) => {
    thumb.innerHTML = '<span class="guide-thumb-placeholder">No image</span>';
    thumb.classList.remove('has-image');
  });

  if (!item || !item.images) {
    // No item or no images - show empty state
    if (previewImg) previewImg.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    if (dotsContainer) dotsContainer.style.display = 'none';
    return;
  }

  // Update thumbnails
  const images = item.images;
  if (images.ambulancePosition) {
    thumb1.innerHTML = `<img src="${images.ambulancePosition}" alt="Step 1" />`;
    thumb1.classList.add('has-image');
    editGuideImages.push({ url: images.ambulancePosition, step: 1 });
  }
  if (images.compartmentView) {
    thumb2.innerHTML = `<img src="${images.compartmentView}" alt="Step 2" />`;
    thumb2.classList.add('has-image');
    editGuideImages.push({ url: images.compartmentView, step: 2 });
  }
  if (images.equipmentPhoto) {
    thumb3.innerHTML = `<img src="${images.equipmentPhoto}" alt="Step 3" />`;
    thumb3.classList.add('has-image');
    editGuideImages.push({ url: images.equipmentPhoto, step: 3 });
  }

  // Show preview if any images exist
  if (editGuideImages.length > 0) {
    if (previewImg) {
      previewImg.src = editGuideImages[0].url;
      previewImg.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (dotsContainer) dotsContainer.style.display = editGuideImages.length > 1 ? 'flex' : 'none';
    updateEditGuideDots(editGuideImages[0].step);
  } else {
    if (previewImg) previewImg.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    if (dotsContainer) dotsContainer.style.display = 'none';
  }
}

/**
 * Update the preview dots to show current step
 */
function updateEditGuideDots(step) {
  const dots = document.querySelectorAll('#edit-guide-preview-dots .preview-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', (i + 1) === step);
  });
}

/**
 * Play the rotation preview animation
 */
function playEditGuidePreview() {
  if (editGuideImages.length < 2) return;
  if (editGuidePreviewInterval) return; // Already playing

  editGuideCurrentStep = 0;
  editGuidePreviewInterval = setInterval(() => {
    editGuideCurrentStep = (editGuideCurrentStep + 1) % editGuideImages.length;
    const img = editGuideImages[editGuideCurrentStep];
    const previewImg = document.getElementById('edit-guide-preview-img');
    if (previewImg && img) {
      previewImg.src = img.url;
      updateEditGuideDots(img.step);
    }
  }, 2000);
}

/**
 * Pause the rotation preview animation
 */
function pauseEditGuidePreview() {
  if (editGuidePreviewInterval) {
    clearInterval(editGuidePreviewInterval);
    editGuidePreviewInterval = null;
  }
}

/**
 * Wire up the Edit Guide button to open the guide editor
 */
document.addEventListener('DOMContentLoaded', () => {
  const editGuideBtn = document.getElementById('edit-location-guide-btn');
  if (editGuideBtn) {
    editGuideBtn.addEventListener('click', () => {
      const itemId = document.getElementById('edit-item-id').value;
      if (!itemId) {
        alert('Please save the item first before editing the location guide.');
        return;
      }
      // Open the guide editor for this item
      openGuideEditor(itemId);
    });
  }
});

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

  // CRITICAL: Preserve existing images/goldDots data when updating
  const existingItem = itemId ? getAllItems().find(i => i.id === itemId) : null;

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
    usageNotes: document.getElementById('edit-usage-notes').value.trim(),
    image: document.getElementById('edit-image').value.trim(),
    // Preserve location guide data if it exists
    images: existingItem?.images || {},
    goldDots: existingItem?.goldDots || {},
    locationSteps: existingItem?.locationSteps || [],
    quickFind: existingItem?.quickFind || ''
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

// Close admin edit modal (called from X button and Cancel button)
function closeAdminEditModal() {
  adminEditModal.classList.remove('active');
}
// Make it globally available for onclick
window.closeAdminEditModal = closeAdminEditModal;

// Cancel edit
adminEditCancelBtn.addEventListener('click', () => {
  closeAdminEditModal();
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

// ============================================================================
// LOCATION GUIDE EDITOR
// Allows editing 3-image location guides with draggable gold dots
// ============================================================================

let guideEditorItemId = null;
let guideEditorData = {
  step1: { image: null, dot: { x: 50, y: 50, label: '' } },
  step2: { image: null, dot: { x: 50, y: 50, label: '' } },
  step3: { image: null, dot: null } // Step 3 has no dot
};
let currentGuideStep = 1;
let rotationInterval = null;
let isDraggingDot = false;

const STEP_DESCRIPTIONS = {
  1: 'Show where on the ambulance to find this',
  2: 'Show the cabinet/drawer where it\'s located',
  3: 'Show the equipment itself (no dot needed)'
};

const STEP_IMAGE_KEYS = {
  1: 'ambulancePosition',
  2: 'compartmentView',
  3: 'equipmentPhoto'
};

// Available images in the library
const IMAGE_LIBRARY = [
  '/images/locations/cabinet_k_labeled.jpg',
  '/images/locations/cabinet_k_overview.jpg',
  '/images/locations/ambulance_exterior_side.jpg',
  '/images/locations/ambulance_interior_overview.jpg',
  '/images/locations/drawer_n_open.jpg',
  '/images/locations/drawer_n_contents.jpg',
  '/images/locations/oxygen_compartment.jpg',
  '/images/locations/drug_box_cabinet.jpg',
  '/images/locations/adult_trauma_bag_closeup.jpg',
  '/images/locations/aed_closeup.jpg',
  '/images/locations/drug_box_closeup.jpg',
  '/images/locations/lifepak_closeup.jpg',
  '/images/locations/narcan_syringe_closeup.jpg',
  '/images/locations/oxygen_tanks_closeup.jpg',
  '/images/locations/iv_kit_closeup.jpg',
  '/images/locations/intubation_bag_blue.jpg',
  '/images/trauma_bag_adult.jpg',
  '/images/cabinet_k_overview.jpg',
  '/images/intubation_kit.jpg',
  '/images/pediatric_bags.jpg',
  '/images/drug_box.jpg',
  '/images/lifepak_bag.jpg',
  '/images/lifepak_mounted.jpg',
  '/images/drawer_n.jpg',
  '/images/drawer_n_labeled.jpg',
  '/images/oxygen_tanks.jpg',
  '/images/cabinet_d_aed.jpg'
];

function openGuideEditor(itemId) {
  guideEditorItemId = itemId;
  const item = getAllItems().find(i => i.id === itemId);

  if (!item) {
    alert('Item not found');
    return;
  }

  // Load existing data
  guideEditorData = {
    step1: {
      image: item.images?.ambulancePosition || null,
      dot: item.goldDots?.ambulancePosition ? { ...item.goldDots.ambulancePosition } : { x: 50, y: 50, label: '' }
    },
    step2: {
      image: item.images?.compartmentView || null,
      dot: item.goldDots?.compartmentView ? { ...item.goldDots.compartmentView } : { x: 50, y: 50, label: '' }
    },
    step3: {
      image: item.images?.equipmentPhoto || null,
      dot: null
    }
  };

  // Set item name
  document.getElementById('guide-editor-item-name').textContent = item.name;

  // Update tab states
  updateTabStates();

  // Select first step
  currentGuideStep = 1;
  selectGuideStep(1);

  // Show modal
  document.getElementById('guide-editor-modal').classList.add('active');

  // Start preview
  updateRotationPreview();
}

function closeGuideEditor() {
  document.getElementById('guide-editor-modal').classList.remove('active');
  pauseRotationPreview();
  guideEditorItemId = null;
}

function selectGuideStep(step) {
  currentGuideStep = step;

  // Update tab active states
  document.querySelectorAll('.guide-editor-tab').forEach(tab => {
    tab.classList.toggle('active', parseInt(tab.dataset.step) === step);
  });

  // Update step info
  document.getElementById('current-step-badge').textContent = `Step ${step}`;
  document.getElementById('current-step-text').textContent = STEP_DESCRIPTIONS[step];

  // Update image preview
  const stepData = guideEditorData[`step${step}`];
  const previewImg = document.getElementById('guide-preview-img');
  const placeholder = document.getElementById('guide-image-placeholder');
  const dotEditor = document.getElementById('guide-dot-editor');
  const dotControls = document.getElementById('dot-controls');

  if (stepData.image) {
    previewImg.src = stepData.image;
    previewImg.style.display = 'block';
    placeholder.style.display = 'none';

    // Show dot for steps 1 and 2 only
    if (step <= 2 && stepData.dot) {
      dotEditor.classList.add('visible');
      dotEditor.style.left = `${stepData.dot.x}%`;
      dotEditor.style.top = `${stepData.dot.y}%`;
      dotControls.style.display = 'block';
      document.getElementById('dot-label-input').value = stepData.dot.label || '';
      updateDotPositionDisplay(stepData.dot.x, stepData.dot.y);
    } else {
      dotEditor.classList.remove('visible');
      dotControls.style.display = 'none';
    }
  } else {
    previewImg.style.display = 'none';
    placeholder.style.display = 'block';
    dotEditor.classList.remove('visible');
    dotControls.style.display = 'none';
  }
}

function updateTabStates() {
  document.querySelectorAll('.guide-editor-tab').forEach(tab => {
    const step = parseInt(tab.dataset.step);
    const stepData = guideEditorData[`step${step}`];
    tab.classList.toggle('has-image', !!stepData.image);
  });
}

function openImageLibrary() {
  const grid = document.getElementById('image-library-grid');
  grid.innerHTML = IMAGE_LIBRARY.map(img => `
    <div style="cursor: pointer; border: 2px solid transparent; border-radius: 8px; overflow: hidden;"
         onclick="selectLibraryImage('${img}')"
         onmouseover="this.style.borderColor='var(--green-500)'"
         onmouseout="this.style.borderColor='transparent'">
      <img src="${img}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover;" onerror="this.parentElement.style.display='none'" />
    </div>
  `).join('');

  document.getElementById('image-library-modal').classList.add('active');
}

function closeImageLibrary() {
  document.getElementById('image-library-modal').classList.remove('active');
}

function selectLibraryImage(imagePath) {
  guideEditorData[`step${currentGuideStep}`].image = imagePath;
  closeImageLibrary();
  updateTabStates();
  selectGuideStep(currentGuideStep);
  updateRotationPreview();
}

function uploadGuideImage() {
  document.getElementById('guide-image-upload').click();
}

function handleGuideImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    // Store as base64 for custom uploads
    guideEditorData[`step${currentGuideStep}`].image = e.target.result;
    updateTabStates();
    selectGuideStep(currentGuideStep);
    updateRotationPreview();
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function clearGuideImage() {
  guideEditorData[`step${currentGuideStep}`].image = null;
  updateTabStates();
  selectGuideStep(currentGuideStep);
  updateRotationPreview();
}

function updateDotLabel() {
  const label = document.getElementById('dot-label-input').value;
  if (guideEditorData[`step${currentGuideStep}`].dot) {
    guideEditorData[`step${currentGuideStep}`].dot.label = label;
  }
}

function updateDotPositionDisplay(x, y) {
  document.getElementById('dot-position-display').textContent = `Position: ${Math.round(x)}%, ${Math.round(y)}%`;
}

// Initialize dot dragging
document.addEventListener('DOMContentLoaded', () => {
  const dotEditor = document.getElementById('guide-dot-editor');
  const previewContainer = document.getElementById('guide-image-preview');

  if (dotEditor && previewContainer) {
    // Mouse events
    dotEditor.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDraggingDot = true;
      dotEditor.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDraggingDot) return;
      updateDotPosition(e.clientX, e.clientY, previewContainer, dotEditor);
    });

    document.addEventListener('mouseup', () => {
      isDraggingDot = false;
      if (dotEditor) dotEditor.style.cursor = 'grab';
    });

    // Touch events for mobile
    dotEditor.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDraggingDot = true;
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDraggingDot) return;
      const touch = e.touches[0];
      updateDotPosition(touch.clientX, touch.clientY, previewContainer, dotEditor);
    });

    document.addEventListener('touchend', () => {
      isDraggingDot = false;
    });
  }
});

function updateDotPosition(clientX, clientY, container, dot) {
  const rect = container.getBoundingClientRect();
  let x = ((clientX - rect.left) / rect.width) * 100;
  let y = ((clientY - rect.top) / rect.height) * 100;

  // Clamp to container
  x = Math.max(5, Math.min(95, x));
  y = Math.max(5, Math.min(95, y));

  dot.style.left = `${x}%`;
  dot.style.top = `${y}%`;

  // Save to data
  if (guideEditorData[`step${currentGuideStep}`].dot) {
    guideEditorData[`step${currentGuideStep}`].dot.x = x;
    guideEditorData[`step${currentGuideStep}`].dot.y = y;
  }

  updateDotPositionDisplay(x, y);
}

function updateRotationPreview() {
  const images = [
    guideEditorData.step1.image,
    guideEditorData.step2.image,
    guideEditorData.step3.image
  ].filter(Boolean);

  const previewImg = document.getElementById('gif-preview-img');
  const placeholder = document.getElementById('gif-placeholder');

  if (images.length > 0) {
    previewImg.src = images[0];
    previewImg.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    previewImg.style.display = 'none';
    placeholder.style.display = 'block';
  }
}

let previewStep = 0;
function playRotationPreview() {
  pauseRotationPreview();

  const images = [
    guideEditorData.step1.image,
    guideEditorData.step2.image,
    guideEditorData.step3.image
  ];

  const validImages = images.filter(Boolean);
  if (validImages.length === 0) return;

  previewStep = 0;
  const previewImg = document.getElementById('gif-preview-img');
  const dots = document.querySelectorAll('.guide-rotation-dot');

  function showNextImage() {
    const validIndices = images.map((img, i) => img ? i : -1).filter(i => i >= 0);
    const currentIndex = validIndices[previewStep % validIndices.length];

    previewImg.src = images[currentIndex];
    previewImg.style.display = 'block';

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    previewStep++;
  }

  showNextImage();
  rotationInterval = setInterval(showNextImage, 2000);
}

function pauseRotationPreview() {
  if (rotationInterval) {
    clearInterval(rotationInterval);
    rotationInterval = null;
  }
}

function saveGuideEditor() {
  if (!guideEditorItemId) return;

  const item = getAllItems().find(i => i.id === guideEditorItemId);
  if (!item) {
    alert('Item not found');
    return;
  }

  // Update item with new guide data
  item.images = {
    ambulancePosition: guideEditorData.step1.image,
    compartmentView: guideEditorData.step2.image,
    equipmentPhoto: guideEditorData.step3.image
  };

  item.goldDots = {
    ambulancePosition: guideEditorData.step1.dot ? {
      x: guideEditorData.step1.dot.x,
      y: guideEditorData.step1.dot.y,
      label: guideEditorData.step1.dot.label
    } : null,
    compartmentView: guideEditorData.step2.dot ? {
      x: guideEditorData.step2.dot.x,
      y: guideEditorData.step2.dot.y,
      label: guideEditorData.step2.dot.label
    } : null,
    equipmentPhoto: null
  };

  // Save to custom inventory
  if (!customInventory.items.find(i => i.id === item.id)) {
    customInventory.items.push(item);
  }
  saveCustomInventory();

  // Close editor
  closeGuideEditor();
  renderAdminItemsList();

  hapticFeedback('success');
  alert('Location guide saved!');
}

console.log('[GuideEditor] Module loaded');
// Force deploy Fri Dec 19 21:10:08 EST 2025
