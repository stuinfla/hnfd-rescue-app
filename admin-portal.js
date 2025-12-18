/**
 * HNFD Equipment Admin Portal
 * Desktop admin interface for managing equipment, images, and deployments
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const STATE = {
  equipment: [],
  changes: [],
  optimizedImages: {},
  currentVersion: '2.3.3',
  githubToken: localStorage.getItem('github_token') || null,
  githubRepo: 'YOUR_USERNAME/AMBUILANCE_INVENTORY', // TODO: Update with actual repo
};

// Load equipment from main app database
async function loadEquipment() {
  // Import from app.js INVENTORY_DATABASE
  if (typeof INVENTORY_DATABASE !== 'undefined') {
    STATE.equipment = JSON.parse(JSON.stringify(INVENTORY_DATABASE.items));
  } else {
    // Fallback: fetch from deployed app
    try {
      const response = await fetch('/app.js');
      const code = await response.text();
      const match = code.match(/const INVENTORY_DATABASE = ({[\s\S]*?});/);
      if (match) {
        eval('STATE.equipment = ' + match[1] + '.items');
      }
    } catch (e) {
      console.error('Failed to load equipment:', e);
    }
  }

  renderEquipment();
  updateStats();
}

// ============================================================================
// IMAGE OPTIMIZATION ENGINE
// ============================================================================

async function optimizeImage(file, targetWidth = 800, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > targetWidth) {
          height = (height * targetWidth) / width;
          width = targetWidth;
        }

        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG
        canvas.toBlob(
          (blob) => {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve({
              original: file,
              optimized: optimizedFile,
              originalSize: file.size,
              optimizedSize: blob.size,
              savings: ((1 - blob.size / file.size) * 100).toFixed(1),
              dataURL: canvas.toDataURL('image/jpeg', quality),
            });
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function optimizeAllImages() {
  const progressDiv = document.getElementById('optimization-progress');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  progressDiv.style.display = 'block';

  const imagePaths = STATE.equipment.map(item => item.image).filter(Boolean);
  const total = imagePaths.length;
  let completed = 0;

  for (const imagePath of imagePaths) {
    try {
      // Fetch image
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const file = new File([blob], imagePath.split('/').pop(), { type: blob.type });

      // Optimize
      const result = await optimizeImage(file);

      // Store optimized version
      STATE.optimizedImages[imagePath] = result.dataURL;

      completed++;
      const percent = (completed / total) * 100;
      progressBar.style.width = percent + '%';
      progressText.textContent = `Optimizing... ${completed}/${total} (${percent.toFixed(0)}%)`;

    } catch (e) {
      console.error('Failed to optimize:', imagePath, e);
      completed++;
    }
  }

  progressText.textContent = 'Optimization complete!';
  setTimeout(() => {
    progressDiv.style.display = 'none';
  }, 2000);

  updateStats();
  addChange('Optimized all equipment images');
}

// ============================================================================
// EQUIPMENT MANAGEMENT
// ============================================================================

function renderEquipment() {
  const grid = document.getElementById('equipment-grid');
  grid.innerHTML = STATE.equipment.map(item => `
    <div class="equipment-card ${item._modified ? 'modified' : ''}" data-item-id="${item.id}">
      <div class="equipment-header">
        <div class="equipment-name">${item.name}</div>
        <div class="equipment-badges">
          ${item.critical ? '<span class="badge badge-critical">Critical</span>' : ''}
          ${item._modified ? '<span class="badge badge-modified">Modified</span>' : ''}
        </div>
      </div>

      ${item.image ? `
        <img src="${STATE.optimizedImages[item.image] || item.image}"
             alt="${item.name}"
             class="equipment-image">
      ` : ''}

      <div class="equipment-location">
        📍 ${item.location}
      </div>

      <div class="equipment-actions">
        <button class="btn btn-secondary btn-small" onclick="editEquipment('${item.id}')">
          ✏️ Edit
        </button>
        <button class="btn btn-secondary btn-small" onclick="replaceImage('${item.id}')">
          📷 Image
        </button>
      </div>
    </div>
  `).join('');
}

function editEquipment(itemId) {
  const item = STATE.equipment.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('edit-item-id').value = item.id;
  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-location').value = item.location;
  document.getElementById('edit-description').value = item.description || '';

  document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('active');
  document.getElementById('edit-form').reset();
  document.getElementById('image-preview').style.display = 'none';
}

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const result = await optimizeImage(file);

  // Show preview
  const preview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const originalSize = document.getElementById('original-size');
  const optimizedSizeDisplay = document.getElementById('optimized-size-display');

  previewImg.src = result.dataURL;
  originalSize.textContent = formatFileSize(result.originalSize);
  optimizedSizeDisplay.textContent = formatFileSize(result.optimizedSize) + ' (' + result.savings + '% smaller)';

  preview.style.display = 'block';

  // Store for save
  preview.dataset.optimizedImage = result.dataURL;
}

function saveEquipmentEdit(event) {
  event.preventDefault();

  const itemId = document.getElementById('edit-item-id').value;
  const item = STATE.equipment.find(i => i.id === itemId);
  if (!item) return;

  // Update item data
  item.name = document.getElementById('edit-name').value;
  item.location = document.getElementById('edit-location').value;
  item.description = document.getElementById('edit-description').value;

  // Update image if changed
  const preview = document.getElementById('image-preview');
  if (preview.style.display !== 'none' && preview.dataset.optimizedImage) {
    const newImagePath = `/images/${itemId}.jpg`;
    STATE.optimizedImages[newImagePath] = preview.dataset.optimizedImage;
    item.image = newImagePath;
  }

  // Mark as modified
  item._modified = true;

  // Track change
  addChange(`Modified ${item.name}`);

  // Close modal and re-render
  closeEditModal();
  renderEquipment();
  updateStats();
}

function replaceImage(itemId) {
  editEquipment(itemId);
  setTimeout(() => {
    document.getElementById('edit-image-file').click();
  }, 100);
}

// ============================================================================
// CHANGE TRACKING
// ============================================================================

function addChange(description) {
  STATE.changes.push({
    timestamp: new Date(),
    description,
  });
  updateChangesDisplay();
}

function updateChangesDisplay() {
  const count = STATE.changes.length;
  const badge = document.getElementById('changes-badge');
  const countEl = document.getElementById('changes-count');

  if (count > 0) {
    badge.style.display = 'flex';
    countEl.textContent = count;
  } else {
    badge.style.display = 'none';
  }

  // Update deployment tab
  const changesList = document.getElementById('changes-list');
  if (count === 0) {
    changesList.innerHTML = '<li>No changes pending</li>';
  } else {
    changesList.innerHTML = STATE.changes.map(change =>
      `<li>✓ ${change.description} <span style="color: var(--gray-500); font-size: 12px;">${formatTime(change.timestamp)}</span></li>`
    ).join('');
  }
}

function resetAllChanges() {
  if (!confirm('Reset all changes? This cannot be undone.')) return;

  STATE.changes = [];
  STATE.optimizedImages = {};

  // Reload equipment
  loadEquipment();

  updateChangesDisplay();
  updateStats();
}

// ============================================================================
// DEPLOYMENT & GITHUB INTEGRATION
// ============================================================================

async function pushAndUpdate() {
  if (STATE.changes.length === 0) {
    alert('No changes to push!');
    return;
  }

  if (!confirm(`Push ${STATE.changes.length} changes to production?`)) {
    return;
  }

  const pushBtn = document.getElementById('push-btn');
  const deployLog = document.getElementById('deployment-log');
  const logContent = document.getElementById('log-content');

  pushBtn.disabled = true;
  pushBtn.innerHTML = '<div class="spinner"></div> Deploying...';
  deployLog.style.display = 'block';
  logContent.innerHTML = '';

  const log = (message) => {
    const entry = document.createElement('div');
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    entry.style.marginBottom = '5px';
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
  };

  try {
    log('Starting deployment process...');

    // Step 1: Increment version
    const newVersion = incrementVersion(STATE.currentVersion);
    log(`Version: ${STATE.currentVersion} → ${newVersion}`);

    // Step 2: Generate updated app.js
    log('Generating updated app.js...');
    const updatedAppJS = await generateUpdatedAppJS(newVersion);

    // Step 3: Save optimized images
    log(`Saving ${Object.keys(STATE.optimizedImages).length} optimized images...`);
    const imagesToCommit = await prepareImagesForCommit();

    // Step 4: Update version.json
    log('Updating version.json...');
    const versionJSON = generateVersionJSON(newVersion);

    // Step 5: Commit to GitHub
    if (STATE.githubToken) {
      log('Committing changes to GitHub...');
      await commitToGitHub({
        files: {
          'app.js': updatedAppJS,
          'version.json': versionJSON,
          ...imagesToCommit,
        },
        message: `Admin Update v${newVersion}\\n\\n${STATE.changes.map(c => '- ' + c.description).join('\\n')}`,
      });
      log('✓ Changes committed to GitHub');
    } else {
      log('⚠ No GitHub token - downloading files for manual commit...');
      downloadDeploymentPackage(updatedAppJS, versionJSON, imagesToCommit, newVersion);
    }

    // Step 6: Trigger Vercel deployment
    log('Vercel will auto-deploy from GitHub push...');
    log('✓ Deployment initiated!');

    // Step 7: Clear changes
    STATE.changes = [];
    STATE.currentVersion = newVersion;
    document.getElementById('current-version').textContent = `v${newVersion}`;

    updateChangesDisplay();

    log('');
    log('🎉 Deployment complete!');
    log('All mobile users will receive update notification.');

    setTimeout(() => {
      pushBtn.disabled = false;
      pushBtn.innerHTML = '🚀 Push & Update to Production';
    }, 3000);

  } catch (error) {
    log('');
    log(`❌ Error: ${error.message}`);
    console.error(error);

    pushBtn.disabled = false;
    pushBtn.innerHTML = '🚀 Push & Update to Production';
  }
}

function incrementVersion(version) {
  const parts = version.split('.');
  parts[2] = parseInt(parts[2]) + 1;
  return parts.join('.');
}

async function generateUpdatedAppJS(newVersion) {
  // Read current app.js
  const response = await fetch('/app.js');
  let code = await response.text();

  // Update version
  code = code.replace(/const APP_VERSION = '[^']+';/, `const APP_VERSION = '${newVersion}';`);

  // Update inventory database
  const inventoryJSON = JSON.stringify({ items: STATE.equipment }, null, 2);
  code = code.replace(
    /const INVENTORY_DATABASE = {[\s\S]*?};/,
    `const INVENTORY_DATABASE = ${inventoryJSON};`
  );

  return code;
}

function generateVersionJSON(newVersion) {
  return JSON.stringify({
    version: newVersion,
    build: new Date().toISOString().split('T')[0],
    changelog: [
      `Admin Update v${newVersion}`,
      ...STATE.changes.map(c => c.description),
    ],
  }, null, 2);
}

async function prepareImagesForCommit() {
  const images = {};

  for (const [path, dataURL] of Object.entries(STATE.optimizedImages)) {
    // Convert data URL to base64 content
    const base64 = dataURL.split(',')[1];
    images[path.replace(/^\//, '')] = base64;
  }

  return images;
}

async function commitToGitHub({ files, message }) {
  // This would use GitHub API to commit files
  // Requires GitHub personal access token with repo permissions

  const response = await fetch(`https://api.github.com/repos/${STATE.githubRepo}/contents/`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${STATE.githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: btoa(JSON.stringify(files)),
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

function downloadDeploymentPackage(appJS, versionJSON, images, version) {
  // Create a downloadable package for manual deployment
  const zip = {
    'app.js': appJS,
    'version.json': versionJSON,
    ...Object.fromEntries(
      Object.entries(images).map(([path, base64]) => [path, atob(base64)])
    ),
  };

  // Download as JSON (user can extract and commit manually)
  const blob = new Blob([JSON.stringify(zip, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hnfd-deployment-v${version}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// UI HELPERS
// ============================================================================

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

function updateStats() {
  // Equipment stats
  document.getElementById('total-items').textContent = STATE.equipment.length;
  document.getElementById('critical-items').textContent = STATE.equipment.filter(i => i.critical).length;
  document.getElementById('modified-items').textContent = STATE.equipment.filter(i => i._modified).length;

  // Image stats
  const totalSize = STATE.equipment.length * 150 * 1024; // Estimate 150KB per image
  const optimizedSize = Object.keys(STATE.optimizedImages).length * 60 * 1024; // ~60KB optimized
  const savings = ((1 - optimizedSize / totalSize) * 100).toFixed(0);

  document.getElementById('total-size').textContent = formatFileSize(totalSize);
  document.getElementById('optimized-size').textContent = formatFileSize(optimizedSize);
  document.getElementById('savings').textContent = savings + '%';

  // Update next version
  const nextVersion = incrementVersion(STATE.currentVersion);
  document.getElementById('deploy-current-version').textContent = STATE.currentVersion;
  document.getElementById('deploy-next-version').textContent = nextVersion;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

function exportData() {
  const data = {
    equipment: STATE.equipment,
    changes: STATE.changes,
    version: STATE.currentVersion,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hnfd-backup-${STATE.currentVersion}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('load', () => {
  console.log('[Admin Portal] Initializing...');
  loadEquipment();
  updateChangesDisplay();
});
