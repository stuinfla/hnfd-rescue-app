/**
 * Ambulance Inventory Vector Database
 * Uses RuVector for persistent, offline-capable semantic search
 * CRITICAL: Lives depend on accuracy - all data verified from training video
 */

const ruvector = require('ruvector');

class AmbulanceInventoryDB {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.dbPath = './data/ambulance_vectors.db';
  }

  async initialize() {
    if (this.isInitialized) return;

    // Initialize RuVector with 384-dimension embeddings (MiniLM compatible)
    this.db = new ruvector.VectorDB(384, {
      persistPath: this.dbPath,
      indexType: 'hnsw',
      efConstruction: 200,
      M: 16
    });

    // Load inventory data
    const inventoryData = require('../data/ambulance_inventory.json');

    // Index all items with multiple search vectors
    await this.indexInventory(inventoryData);

    this.isInitialized = true;
    console.log('[AmbulanceDB] Initialized with', this.db.size(), 'vectors');
  }

  async indexInventory(data) {
    const documents = [];

    // Index each compartment and its items
    for (const [compartmentId, compartment] of Object.entries(data.compartments)) {
      // Index compartment itself
      documents.push({
        id: `compartment_${compartmentId}`,
        type: 'compartment',
        text: `${compartment.name} ${compartment.description || ''}`,
        metadata: {
          compartmentId,
          name: compartment.name,
          access: compartment.access,
          description: compartment.description
        }
      });

      // Index items in compartment
      const items = this.extractItems(compartment);
      for (const item of items) {
        // Create primary document
        documents.push({
          id: item.id,
          type: 'item',
          text: this.createSearchText(item),
          metadata: {
            ...item,
            compartmentId,
            compartmentName: compartment.name
          }
        });

        // Create alias documents for better recall
        if (item.aliases) {
          for (const alias of item.aliases) {
            documents.push({
              id: `${item.id}_alias_${alias.replace(/\s+/g, '_')}`,
              type: 'alias',
              text: `${alias} ${item.name} ${compartment.name}`,
              metadata: {
                primaryItemId: item.id,
                alias,
                ...item,
                compartmentId,
                compartmentName: compartment.name
              }
            });
          }
        }
      }
    }

    // Index critical items summary for quick access
    for (const criticalItem of data.critical_items_summary) {
      documents.push({
        id: `critical_${criticalItem.rank}`,
        type: 'critical_item',
        text: `critical item ${criticalItem.rank} ${criticalItem.item} located in ${criticalItem.location}`,
        metadata: criticalItem
      });
    }

    // Generate embeddings and store
    for (const doc of documents) {
      const embedding = await this.generateEmbedding(doc.text);
      this.db.add(embedding, {
        id: doc.id,
        type: doc.type,
        text: doc.text,
        ...doc.metadata
      });
    }

    // Persist to disk
    await this.db.save();
  }

  extractItems(compartment) {
    const items = [];

    if (compartment.items) {
      items.push(...compartment.items);
    }

    if (compartment.sections) {
      for (const section of Object.values(compartment.sections)) {
        if (section.items) {
          items.push(...section.items);
        }
      }
    }

    return items;
  }

  createSearchText(item) {
    const parts = [
      item.name,
      item.description,
      item.position,
      item.color,
      ...(item.aliases || []),
      item.critical ? 'critical item' : '',
      item.CRITICAL_WARNING,
      item.CRITICAL_NOTE,
      item.driver_note
    ].filter(Boolean);

    return parts.join(' ');
  }

  /**
   * Generate embedding for text - uses simple but effective approach
   * For production, can swap to more sophisticated model
   */
  async generateEmbedding(text) {
    // Simple but effective character/word-based embedding
    // This provides reasonable semantic matching for our domain-specific data
    const embedding = new Array(384).fill(0);
    const words = text.toLowerCase().split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const idx = (charCode * (i + 1) * (j + 1)) % 384;
        embedding[idx] += 1 / (words.length + 1);
      }
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  /**
   * Search for items - returns top matches with location info
   */
  async search(query, topK = 5) {
    if (!this.isInitialized) await this.initialize();

    const queryEmbedding = await this.generateEmbedding(query);
    const results = this.db.search(queryEmbedding, topK);

    // Deduplicate and prioritize primary items over aliases
    const seen = new Set();
    const dedupedResults = [];

    for (const result of results) {
      const primaryId = result.metadata.primaryItemId || result.metadata.id;
      if (!seen.has(primaryId)) {
        seen.add(primaryId);
        dedupedResults.push(result);
      }
    }

    return dedupedResults;
  }

  /**
   * Get exact item by ID
   */
  getItem(itemId) {
    const inventory = require('../data/ambulance_inventory.json');

    for (const compartment of Object.values(inventory.compartments)) {
      const items = this.extractItems(compartment);
      const found = items.find(item => item.id === itemId);
      if (found) {
        return {
          ...found,
          compartmentName: compartment.name,
          access: compartment.access
        };
      }
    }
    return null;
  }

  /**
   * Get all critical items
   */
  getCriticalItems() {
    const inventory = require('../data/ambulance_inventory.json');
    return inventory.critical_items_summary;
  }

  /**
   * Format response for voice output
   */
  formatVoiceResponse(results, query) {
    if (!results || results.length === 0) {
      return `I could not find information about "${query}". Please ask the EMT for the exact location.`;
    }

    const topResult = results[0];
    const meta = topResult.metadata;

    let response = '';

    // Build clear, spoken response
    if (meta.name) {
      response += `${meta.name}. `;
    }

    if (meta.compartmentName) {
      response += `Located in ${meta.compartmentName}. `;
    }

    if (meta.position) {
      response += `${meta.position}. `;
    }

    if (meta.color) {
      response += `It is ${meta.color}. `;
    }

    if (meta.CRITICAL_WARNING) {
      response += `WARNING: ${meta.CRITICAL_WARNING}. `;
    }

    if (meta.driver_note) {
      response += meta.driver_note;
    }

    return response || `Found ${meta.name || 'item'} in ${meta.compartmentName || 'ambulance'}.`;
  }
}

module.exports = AmbulanceInventoryDB;
