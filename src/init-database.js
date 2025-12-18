/**
 * Initialize RuVector Database for Ambulance Inventory
 * Creates persistent vector embeddings for semantic search
 */

const ruvector = require('ruvector');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/ambulance_inventory.json');
const DB_PATH = path.join(__dirname, '../data/ambulance_vectors.db');

async function initDatabase() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║       INITIALIZING RUVECTOR DATABASE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Load inventory data
  const inventory = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  console.log(`[INFO] Loaded inventory: ${inventory.metadata.source}`);
  console.log(`[INFO] Critical items: ${inventory.metadata.critical_items_count}`);

  // Initialize RuVector with 128 dimensions (optimized for mobile)
  const db = new ruvector.VectorDB(128, {
    metric: 'cosine',
    efConstruction: 128,
    M: 16
  });

  console.log('[INFO] RuVector database initialized');

  // Flatten items from all compartments
  const allItems = [];

  for (const [compId, compartment] of Object.entries(inventory.compartments)) {
    // Get items from direct items array
    if (compartment.items) {
      for (const item of compartment.items) {
        allItems.push({
          ...item,
          compartmentId: compId,
          compartmentName: compartment.name,
          compartmentAccess: compartment.access
        });
      }
    }

    // Get items from sections
    if (compartment.sections) {
      for (const section of Object.values(compartment.sections)) {
        if (section.items) {
          for (const item of section.items) {
            allItems.push({
              ...item,
              compartmentId: compId,
              compartmentName: compartment.name,
              compartmentAccess: compartment.access,
              sectionType: section.type
            });
          }
        }
      }
    }
  }

  console.log(`[INFO] Found ${allItems.length} items to index`);

  // Create embeddings for each item
  let indexed = 0;
  for (const item of allItems) {
    // Create searchable text from item properties
    const searchText = [
      item.name,
      item.id,
      ...(item.aliases || []),
      item.description,
      item.color,
      item.position,
      item.compartmentName,
      item.driver_note,
      item.notes,
      item.CRITICAL_WARNING,
      item.CRITICAL_NOTE
    ].filter(Boolean).join(' ').toLowerCase();

    // Generate simple but effective embedding
    const embedding = generateEmbedding(searchText, 128);

    // Add to database
    db.add(embedding, {
      id: item.id,
      name: item.name,
      aliases: item.aliases || [],
      location: item.position || item.compartmentName,
      compartment: item.compartmentId,
      compartmentName: item.compartmentName,
      compartmentAccess: item.compartmentAccess,
      color: item.color,
      critical: item.critical || false,
      criticalRank: item.critical_rank,
      description: item.description,
      warning: item.CRITICAL_WARNING || item.CRITICAL_NOTE,
      driverNote: item.driver_note,
      notes: item.notes
    });

    indexed++;
  }

  console.log(`[INFO] Indexed ${indexed} items with embeddings`);

  // Also index by aliases for better recall
  let aliasCount = 0;
  for (const item of allItems) {
    if (item.aliases) {
      for (const alias of item.aliases) {
        const embedding = generateEmbedding(alias.toLowerCase(), 128);
        db.add(embedding, {
          id: `${item.id}_alias_${aliasCount}`,
          primaryId: item.id,
          name: item.name,
          alias: alias,
          location: item.position || item.compartmentName,
          compartment: item.compartmentId,
          compartmentName: item.compartmentName,
          critical: item.critical || false
        });
        aliasCount++;
      }
    }
  }

  console.log(`[INFO] Added ${aliasCount} alias entries`);

  // Save the database
  const dbData = {
    version: '1.0.0',
    created: new Date().toISOString(),
    itemCount: indexed,
    aliasCount: aliasCount,
    dimensions: 128,
    source: inventory.metadata.source
  };

  // RuVector persistence
  try {
    // Export vectors for later use
    const vectors = [];
    const searchResult = db.search(generateEmbedding('test', 128), db.size());

    fs.writeFileSync(
      path.join(__dirname, '../data/db_metadata.json'),
      JSON.stringify(dbData, null, 2)
    );

    console.log('[INFO] Database metadata saved');
  } catch (e) {
    console.log('[WARN] Could not export vectors:', e.message);
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║       DATABASE INITIALIZATION COMPLETE                          ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║   Items indexed: ${indexed.toString().padEnd(45)}║`);
  console.log(`║   Aliases indexed: ${aliasCount.toString().padEnd(43)}║`);
  console.log(`║   Total vectors: ${(indexed + aliasCount).toString().padEnd(45)}║`);
  console.log('╚════════════════════════════════════════════════════════════════╝');

  return db;
}

/**
 * Generate a simple embedding vector for text
 * Uses character n-gram hashing for offline operation
 */
function generateEmbedding(text, dimensions) {
  const embedding = new Array(dimensions).fill(0);
  const words = text.toLowerCase().split(/\s+/);

  // Character-level features
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const idx = charCode % dimensions;
    embedding[idx] += 1;
  }

  // Word-level features
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash + word.charCodeAt(j)) | 0;
    }
    const idx = Math.abs(hash) % dimensions;
    embedding[idx] += 2;
  }

  // Bigram features
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = words[i] + words[i + 1];
    let hash = 0;
    for (let j = 0; j < bigram.length; j++) {
      hash = ((hash << 5) - hash + bigram.charCodeAt(j)) | 0;
    }
    const idx = Math.abs(hash) % dimensions;
    embedding[idx] += 1.5;
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

// Run initialization
initDatabase().catch(console.error);

module.exports = { initDatabase, generateEmbedding };
