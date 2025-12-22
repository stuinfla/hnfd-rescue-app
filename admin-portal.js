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
  currentVersion: '2.6.0',
  githubToken: localStorage.getItem('github_token') || null,
  githubRepo: 'stuartkerr/AMBUILANCE_INVENTORY',
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
  // Clear grid safely
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }

  STATE.equipment.forEach(item => {
    const card = createEquipmentCard(item);
    grid.appendChild(card);
  });
}

function createEquipmentCard(item) {
  const card = document.createElement('div');
  card.className = 'equipment-card' + (item._modified ? ' modified' : '');
  card.dataset.itemId = item.id;

  // Header
  const header = document.createElement('div');
  header.className = 'equipment-header';

  const nameDiv = document.createElement('div');
  nameDiv.className = 'equipment-name';
  nameDiv.textContent = item.name;
  header.appendChild(nameDiv);

  const badges = document.createElement('div');
  badges.className = 'equipment-badges';

  if (item.critical) {
    const criticalBadge = document.createElement('span');
    criticalBadge.className = 'badge badge-critical';
    criticalBadge.textContent = 'Critical #' + item.criticalRank;
    badges.appendChild(criticalBadge);
  }

  if (item._modified) {
    const modifiedBadge = document.createElement('span');
    modifiedBadge.className = 'badge badge-modified';
    modifiedBadge.textContent = 'Modified';
    badges.appendChild(modifiedBadge);
  }

  // Image count badge
  const imageCount = countItemImages(item);
  if (imageCount > 1) {
    const imgBadge = document.createElement('span');
    imgBadge.className = 'badge';
    imgBadge.style.background = '#3b82f6';
    imgBadge.textContent = imageCount + ' imgs';
    badges.appendChild(imgBadge);
  }

  header.appendChild(badges);
  card.appendChild(header);

  // Image
  if (item.image) {
    const img = document.createElement('img');
    img.src = STATE.optimizedImages[item.image] || item.image;
    img.alt = item.name;
    img.className = 'equipment-image';
    img.onerror = function() {
      this.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'no-image';
      placeholder.style.cssText = 'height: 200px; background: var(--gray-600); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--gray-400); margin-bottom: 15px;';
      placeholder.textContent = '📷 No image available';
      this.parentElement.insertBefore(placeholder, this.nextSibling);
    };
    card.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'no-image';
    placeholder.style.cssText = 'height: 200px; background: var(--gray-600); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--gray-400); margin-bottom: 15px;';
    placeholder.textContent = '📷 No image available';
    card.appendChild(placeholder);
  }

  // Location
  const location = document.createElement('div');
  location.className = 'equipment-location';
  location.textContent = '📍 ' + item.location;
  card.appendChild(location);

  // Quick Find (if available)
  if (item.quickFind) {
    const quickFind = document.createElement('div');
    quickFind.className = 'quick-find';
    quickFind.style.cssText = 'font-size: 12px; color: var(--green-500); margin-top: 8px; padding: 8px; background: rgba(34, 197, 94, 0.1); border-radius: 6px;';
    quickFind.textContent = '🎯 ' + item.quickFind;
    card.appendChild(quickFind);
  }

  // Location steps preview
  if (item.locationSteps && item.locationSteps.length > 0) {
    const stepsPreview = document.createElement('div');
    stepsPreview.style.cssText = 'font-size: 11px; color: var(--gray-400); margin-top: 8px;';
    stepsPreview.textContent = '📋 ' + item.locationSteps.length + ' step guide available';
    card.appendChild(stepsPreview);
  }

  // Actions
  const actions = document.createElement('div');
  actions.className = 'equipment-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-secondary btn-small';
  editBtn.textContent = '✏️ Edit';
  editBtn.onclick = () => editEquipment(item.id);
  actions.appendChild(editBtn);

  const imageBtn = document.createElement('button');
  imageBtn.className = 'btn btn-secondary btn-small';
  imageBtn.textContent = '📷 Images';
  imageBtn.onclick = () => manageImages(item.id);
  actions.appendChild(imageBtn);

  const guideBtn = document.createElement('button');
  guideBtn.className = 'btn btn-secondary btn-small';
  guideBtn.textContent = '🗺️ Guide';
  guideBtn.onclick = () => viewLocationGuide(item.id);
  actions.appendChild(guideBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-danger btn-small';
  deleteBtn.textContent = '🗑️';
  deleteBtn.onclick = () => deleteEquipment(item.id);
  actions.appendChild(deleteBtn);

  card.appendChild(actions);

  return card;
}

function countItemImages(item) {
  let count = 0;
  if (item.image) count++;
  if (item.images) {
    if (item.images.ambulancePosition) count++;
    if (item.images.compartmentView) count++;
    if (item.images.equipmentPhoto && item.images.equipmentPhoto !== item.image) count++;
  }
  return count;
}

function manageImages(itemId) {
  const item = STATE.equipment.find(i => i.id === itemId);
  if (!item) return;

  // Initialize images object if it doesn't exist
  if (!item.images) {
    item.images = {
      ambulancePosition: null,
      compartmentView: null,
      equipmentPhoto: item.image || null
    };
  }

  // Create or get modal
  let modal = document.getElementById('images-modal');
  if (!modal) {
    modal = createImagesModal();
    document.body.appendChild(modal);
  }

  document.getElementById('images-item-id').value = item.id;
  document.getElementById('images-item-name').textContent = item.name;

  // Set current images
  setImagePreview('ambulance-img', item.images.ambulancePosition);
  setImagePreview('compartment-img', item.images.compartmentView);
  setImagePreview('equipment-img', item.images.equipmentPhoto || item.image);

  modal.classList.add('active');
}

function createImagesModal() {
  const modal = document.createElement('div');
  modal.id = 'images-modal';
  modal.className = 'modal';

  const content = document.createElement('div');
  content.className = 'modal-content';
  content.style.maxWidth = '800px';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';

  const title = document.createElement('h2');
  title.id = 'images-item-name';
  title.textContent = 'Manage Images';
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.textContent = '✕';
  closeBtn.onclick = () => modal.classList.remove('active');
  header.appendChild(closeBtn);

  content.appendChild(header);

  // Hidden input for item ID
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.id = 'images-item-id';
  content.appendChild(hiddenInput);

  // Image grid
  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;';

  // Create image sections
  const sections = [
    { id: 'ambulance', label: '1. Ambulance Position', desc: 'Where on the ambulance (inside/outside)' },
    { id: 'compartment', label: '2. Drawer/Cabinet', desc: 'Which compartment to open' },
    { id: 'equipment', label: '3. Equipment Photo', desc: 'What the item looks like' }
  ];

  sections.forEach(section => {
    const div = document.createElement('div');
    div.style.textAlign = 'center';

    const label = document.createElement('div');
    label.style.cssText = 'font-weight: 600; margin-bottom: 10px; color: var(--green-500);';
    label.textContent = section.label;
    div.appendChild(label);

    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = 'min-height: 120px; max-height: 200px; background: var(--gray-700); border-radius: 8px; margin-bottom: 10px; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center;';

    const img = document.createElement('img');
    img.id = section.id + '-img';
    img.style.cssText = 'max-width: 100%; max-height: 200px; object-fit: contain; display: none;';
    imgContainer.appendChild(img);

    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.style.cssText = 'height: 100%; display: flex; align-items: center; justify-content: center; color: var(--gray-400);';
    placeholder.textContent = '📷 No image';
    imgContainer.appendChild(placeholder);

    div.appendChild(imgContainer);

    const desc = document.createElement('div');
    desc.style.cssText = 'font-size: 11px; color: var(--gray-400); margin-bottom: 10px;';
    desc.textContent = section.desc;
    div.appendChild(desc);

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'btn btn-secondary btn-small';
    uploadBtn.style.width = '100%';
    uploadBtn.textContent = '📷 Upload';
    uploadBtn.onclick = () => uploadImageFor(section.id);
    div.appendChild(uploadBtn);

    grid.appendChild(div);
  });

  content.appendChild(grid);

  // Save button
  const saveDiv = document.createElement('div');
  saveDiv.style.cssText = 'margin-top: 20px; text-align: center;';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary';
  saveBtn.textContent = 'Save Images';
  saveBtn.onclick = saveImages;
  saveDiv.appendChild(saveBtn);

  content.appendChild(saveDiv);
  modal.appendChild(content);

  return modal;
}

function setImagePreview(elementId, src) {
  const img = document.getElementById(elementId);
  if (!img) return;
  const placeholder = img.parentElement.querySelector('.image-placeholder');

  if (src) {
    img.src = src;
    img.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  } else {
    img.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
  }
}

function uploadImageFor(type) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await optimizeImage(file);
    setImagePreview(type + '-img', result.dataURL);
    document.getElementById(type + '-img').dataset.newImage = result.dataURL;
  };
  input.click();
}

function saveImages() {
  const itemId = document.getElementById('images-item-id').value;
  const item = STATE.equipment.find(i => i.id === itemId);
  if (!item) return;

  if (!item.images) {
    item.images = {};
  }

  const ambulanceImg = document.getElementById('ambulance-img');
  const compartmentImg = document.getElementById('compartment-img');
  const equipmentImg = document.getElementById('equipment-img');

  if (ambulanceImg.dataset.newImage) {
    item.images.ambulancePosition = ambulanceImg.dataset.newImage;
  }
  if (compartmentImg.dataset.newImage) {
    item.images.compartmentView = compartmentImg.dataset.newImage;
  }
  if (equipmentImg.dataset.newImage) {
    item.images.equipmentPhoto = equipmentImg.dataset.newImage;
    item.image = equipmentImg.dataset.newImage;
  }

  item._modified = true;
  addChange('Updated images for ' + item.name);

  document.getElementById('images-modal').classList.remove('active');
  renderEquipment();
  updateStats();
}

// Global state for image rotation
let guideRotationInterval = null;
let guideCurrentIndex = 0;

function viewLocationGuide(itemId) {
  const item = STATE.equipment.find(i => i.id === itemId);
  if (!item) return;

  // Clear any existing rotation
  if (guideRotationInterval) {
    clearInterval(guideRotationInterval);
    guideRotationInterval = null;
  }
  guideCurrentIndex = 0;

  let modal = document.getElementById('guide-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'guide-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  // Clear modal
  while (modal.firstChild) {
    modal.removeChild(modal.firstChild);
  }

  const content = document.createElement('div');
  content.className = 'modal-content';
  content.style.maxWidth = '800px';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';

  const title = document.createElement('h2');
  title.textContent = '🗺️ Location Guide: ' + item.name;
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.textContent = '✕';
  closeBtn.onclick = () => {
    if (guideRotationInterval) {
      clearInterval(guideRotationInterval);
      guideRotationInterval = null;
    }
    modal.classList.remove('active');
  };
  header.appendChild(closeBtn);

  content.appendChild(header);

  // Build image array for rotation
  const imageSteps = [];
  if (item.images) {
    if (item.images.ambulancePosition) {
      imageSteps.push({
        src: item.images.ambulancePosition,
        label: '1. Find Location on Ambulance',
        goldDot: item.goldDots?.ambulancePosition || null,
        stepNum: 1
      });
    }
    if (item.images.compartmentView) {
      imageSteps.push({
        src: item.images.compartmentView,
        label: '2. Open Drawer/Cabinet',
        goldDot: item.goldDots?.compartmentView || null,
        stepNum: 2
      });
    }
    if (item.images.equipmentPhoto || item.image) {
      imageSteps.push({
        src: item.images.equipmentPhoto || item.image,
        label: '3. Grab This Equipment',
        goldDot: null,
        stepNum: 3
      });
    }
  }

  // Rotating Image Viewer
  if (imageSteps.length > 0) {
    const viewerContainer = document.createElement('div');
    viewerContainer.style.cssText = 'position: relative; margin-bottom: 20px;';

    // Main image container with gold dot
    const imageWrapper = document.createElement('div');
    imageWrapper.id = 'guide-image-wrapper';
    imageWrapper.style.cssText = 'position: relative; border-radius: 12px; overflow: hidden; background: var(--gray-800);';

    const mainImage = document.createElement('img');
    mainImage.id = 'guide-main-image';
    mainImage.src = imageSteps[0].src;
    mainImage.style.cssText = 'width: 100%; display: block; transition: opacity 0.3s ease;';
    imageWrapper.appendChild(mainImage);

    // Gold dot overlay
    const goldDot = document.createElement('div');
    goldDot.id = 'guide-gold-dot';
    goldDot.style.cssText = 'position: absolute; width: 40px; height: 40px; background: radial-gradient(circle, #FFD700 0%, #FFA500 50%, transparent 70%); border: 3px solid #FFD700; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; animation: pulseDot 1.5s ease-in-out infinite; box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); display: none;';
    imageWrapper.appendChild(goldDot);

    // Gold dot label
    const dotLabel = document.createElement('div');
    dotLabel.id = 'guide-dot-label';
    dotLabel.style.cssText = 'position: absolute; background: rgba(0,0,0,0.8); color: #FFD700; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; transform: translateX(-50%); display: none; white-space: nowrap;';
    imageWrapper.appendChild(dotLabel);

    viewerContainer.appendChild(imageWrapper);

    // Step label below image
    const stepLabel = document.createElement('div');
    stepLabel.id = 'guide-step-label';
    stepLabel.style.cssText = 'text-align: center; font-size: 20px; font-weight: 700; color: #FFD700; margin-top: 15px; padding: 10px; background: var(--gray-700); border-radius: 8px;';
    stepLabel.textContent = imageSteps[0].label;
    viewerContainer.appendChild(stepLabel);

    // Progress dots
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = 'display: flex; justify-content: center; gap: 10px; margin-top: 15px;';

    imageSteps.forEach((step, idx) => {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';
      dot.dataset.index = idx;
      dot.style.cssText = 'width: 12px; height: 12px; border-radius: 50%; cursor: pointer; transition: all 0.3s ease;';
      dot.style.background = idx === 0 ? '#FFD700' : 'var(--gray-600)';
      dot.onclick = () => showGuideStep(idx, imageSteps);
      progressContainer.appendChild(dot);
    });

    viewerContainer.appendChild(progressContainer);

    // Play/Pause controls
    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; justify-content: center; gap: 15px; margin-top: 15px;';

    const playPauseBtn = document.createElement('button');
    playPauseBtn.id = 'guide-play-pause';
    playPauseBtn.style.cssText = 'padding: 10px 25px; background: var(--green-600); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;';
    playPauseBtn.textContent = '⏸️ Pause';
    playPauseBtn.onclick = () => toggleGuideRotation(imageSteps, playPauseBtn);
    controls.appendChild(playPauseBtn);

    viewerContainer.appendChild(controls);

    content.appendChild(viewerContainer);

    // Start rotation
    startGuideRotation(imageSteps);
    showGuideStep(0, imageSteps);
  }

  // Quick Find section
  const quickFindBox = document.createElement('div');
  quickFindBox.style.cssText = 'background: var(--gray-700); padding: 20px; border-radius: 10px; margin-bottom: 20px;';

  const quickFindLabel = document.createElement('div');
  quickFindLabel.style.cssText = 'font-size: 14px; color: var(--gray-400); margin-bottom: 10px;';
  quickFindLabel.textContent = 'Quick Find Path:';
  quickFindBox.appendChild(quickFindLabel);

  const quickFindText = document.createElement('div');
  quickFindText.style.cssText = 'font-size: 18px; color: var(--green-500); font-weight: 600;';
  quickFindText.textContent = item.quickFind || item.location;
  quickFindBox.appendChild(quickFindText);

  content.appendChild(quickFindBox);

  // Warning
  if (item.warning) {
    const warningBox = document.createElement('div');
    warningBox.style.cssText = 'background: rgba(220, 38, 38, 0.2); border: 1px solid var(--red-600); padding: 15px; border-radius: 8px; margin-top: 20px;';

    const warningTitle = document.createElement('div');
    warningTitle.style.cssText = 'font-weight: 700; color: var(--red-500); margin-bottom: 5px;';
    warningTitle.textContent = '⚠️ WARNING';
    warningBox.appendChild(warningTitle);

    const warningText = document.createElement('div');
    warningText.style.color = 'white';
    warningText.textContent = item.warning;
    warningBox.appendChild(warningText);

    content.appendChild(warningBox);
  }

  modal.appendChild(content);
  modal.classList.add('active');
}

function showGuideStep(index, imageSteps) {
  guideCurrentIndex = index;
  const step = imageSteps[index];

  const mainImage = document.getElementById('guide-main-image');
  const goldDot = document.getElementById('guide-gold-dot');
  const dotLabel = document.getElementById('guide-dot-label');
  const stepLabel = document.getElementById('guide-step-label');

  if (mainImage) {
    mainImage.style.opacity = '0.5';
    setTimeout(() => {
      mainImage.src = step.src;
      mainImage.style.opacity = '1';
    }, 150);
  }

  if (stepLabel) {
    stepLabel.textContent = step.label;
  }

  // Update gold dot position
  if (goldDot && dotLabel) {
    if (step.goldDot) {
      goldDot.style.display = 'block';
      goldDot.style.left = step.goldDot.x + '%';
      goldDot.style.top = step.goldDot.y + '%';

      dotLabel.style.display = 'block';
      dotLabel.textContent = step.goldDot.label;
      dotLabel.style.left = step.goldDot.x + '%';
      dotLabel.style.top = (step.goldDot.y + 8) + '%';
    } else {
      goldDot.style.display = 'none';
      dotLabel.style.display = 'none';
    }
  }

  // Update progress dots
  document.querySelectorAll('.progress-dot').forEach((dot, idx) => {
    dot.style.background = idx === index ? '#FFD700' : 'var(--gray-600)';
    dot.style.transform = idx === index ? 'scale(1.3)' : 'scale(1)';
  });
}

function startGuideRotation(imageSteps) {
  if (guideRotationInterval) {
    clearInterval(guideRotationInterval);
  }
  guideRotationInterval = setInterval(() => {
    guideCurrentIndex = (guideCurrentIndex + 1) % imageSteps.length;
    showGuideStep(guideCurrentIndex, imageSteps);
  }, 2500);
}

function toggleGuideRotation(imageSteps, btn) {
  if (guideRotationInterval) {
    clearInterval(guideRotationInterval);
    guideRotationInterval = null;
    btn.textContent = '▶️ Play';
  } else {
    startGuideRotation(imageSteps);
    btn.textContent = '⏸️ Pause';
  }
}

function editEquipment(itemId) {
  const item = STATE.equipment.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('edit-item-id').value = item.id;
  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-location').value = item.location;
  document.getElementById('edit-description').value = item.description || '';
  document.getElementById('edit-quickfind').value = item.quickFind || '';
  document.getElementById('edit-locationsteps').value = (item.locationSteps || []).map(s => s.replace(/^Step \d+:\s*/, '')).join('\n');
  document.getElementById('edit-warning').value = item.warning || '';
  document.getElementById('edit-drivernote').value = item.driverNote || '';

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

  // Update quickFind
  const quickFind = document.getElementById('edit-quickfind').value.trim();
  if (quickFind) {
    item.quickFind = quickFind;
  }

  // Update locationSteps
  const stepsText = document.getElementById('edit-locationsteps').value.trim();
  if (stepsText) {
    const steps = stepsText.split('\n').filter(s => s.trim());
    item.locationSteps = steps.map((s, i) => 'Step ' + (i + 1) + ': ' + s.trim());
  }

  // Update warning
  const warning = document.getElementById('edit-warning').value.trim();
  if (warning) {
    item.warning = warning;
  } else {
    delete item.warning;
  }

  // Update driverNote
  const driverNote = document.getElementById('edit-drivernote').value.trim();
  if (driverNote) {
    item.driverNote = driverNote;
  } else {
    delete item.driverNote;
  }

  // Update image if changed
  const preview = document.getElementById('image-preview');
  if (preview.style.display !== 'none' && preview.dataset.optimizedImage) {
    const newImagePath = '/images/' + itemId + '.jpg';
    STATE.optimizedImages[newImagePath] = preview.dataset.optimizedImage;
    item.image = newImagePath;
  }

  // Mark as modified
  item._modified = true;

  // Track change
  addChange('Modified ' + item.name);

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

function addNewEquipment() {
  const name = prompt('Equipment name:');
  if (!name) return;

  const location = prompt('Location (e.g., Cabinet K, middle shelf):');
  if (!location) return;

  const compartment = prompt('Compartment letter (e.g., K, J, D):');
  const description = prompt('Description (what is it/what does it do):');
  const quickFind = prompt('Quick find tip (optional):');
  const isCritical = confirm('Is this a critical/life-saving item?');

  // Generate a unique ID
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

  // Check for duplicate ID
  if (STATE.equipment.find(e => e.id === id)) {
    alert('An item with a similar name already exists. Please use a different name.');
    return;
  }

  const newItem = {
    id: id,
    name: name,
    location: location,
    compartment: compartment || '',
    description: description || '',
    quickFind: quickFind || '',
    critical: isCritical,
    criticalRank: isCritical ? STATE.equipment.filter(e => e.critical).length + 1 : null,
    image: null,
    images: {
      ambulancePosition: null,
      compartmentView: null,
      equipmentPhoto: null
    },
    goldDots: {},
    locationSteps: [],
    _modified: true
  };

  STATE.equipment.push(newItem);
  addChange('Added new equipment: ' + name);
  renderEquipment();
  updateStats();

  // Offer to edit the new item immediately
  if (confirm('Equipment added! Would you like to edit it now to add more details?')) {
    editEquipment(id);
  }
}

function deleteEquipment(itemId) {
  const item = STATE.equipment.find(i => i.id === itemId);
  if (!item) return;

  if (!confirm('Delete "' + item.name + '"? This cannot be undone.')) return;

  STATE.equipment = STATE.equipment.filter(i => i.id !== itemId);
  addChange('Deleted equipment: ' + item.name);
  renderEquipment();
  updateStats();
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

  // Update deployment tab using safe DOM methods
  const changesList = document.getElementById('changes-list');

  // Clear existing items
  while (changesList.firstChild) {
    changesList.removeChild(changesList.firstChild);
  }

  if (count === 0) {
    const li = document.createElement('li');
    li.textContent = 'No changes pending';
    changesList.appendChild(li);
  } else {
    STATE.changes.forEach(change => {
      const li = document.createElement('li');
      li.textContent = '✓ ' + change.description + ' ';

      const timeSpan = document.createElement('span');
      timeSpan.style.cssText = 'color: var(--gray-500); font-size: 12px;';
      timeSpan.textContent = formatTime(change.timestamp);
      li.appendChild(timeSpan);

      changesList.appendChild(li);
    });
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

  // Multi-image stats
  const multiImageCount = STATE.equipment.filter(i => i.images && (i.images.ambulancePosition || i.images.compartmentView)).length;
  const guideCount = STATE.equipment.filter(i => i.locationSteps && i.locationSteps.length > 0).length;

  const multiImageEl = document.getElementById('multi-image-items');
  const guideEl = document.getElementById('guide-items');

  if (multiImageEl) multiImageEl.textContent = multiImageCount + '/' + STATE.equipment.length;
  if (guideEl) guideEl.textContent = guideCount + '/' + STATE.equipment.length;

  // Image stats
  const itemsWithImages = STATE.equipment.filter(i => i.image).length;
  const totalSize = itemsWithImages * 150 * 1024; // Estimate 150KB per image
  const optimizedSize = Object.keys(STATE.optimizedImages).length * 60 * 1024; // ~60KB optimized
  const savings = totalSize > 0 ? ((1 - optimizedSize / totalSize) * 100).toFixed(0) : 0;

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
// DRIVER ZONES MANAGEMENT
// ============================================================================

// Driver zones state
const DRIVER_STATE = {
  zones: []
};

function loadDriverZones() {
  // Load from DRIVER_ZONES if available (from app.js)
  if (typeof DRIVER_ZONES !== 'undefined') {
    DRIVER_STATE.zones = JSON.parse(JSON.stringify(DRIVER_ZONES.zones));
  } else {
    // Fallback default data
    DRIVER_STATE.zones = [
      { id: "728", driver: "Pinkston Russell", phone: "" },
      { id: "729", driver: "Bebarski Jim", phone: "" },
      { id: "731", driver: "Baiss David", phone: "" },
      { id: "732", driver: "Moore Tom", phone: "" },
      { id: "736", driver: "Arnold Pete", phone: "" },
      { id: "738", driver: "King Anthony", phone: "" },
      { id: "739", driver: "Griffiths Lauren", phone: "" },
      { id: "741", driver: "Hickey Kathy", phone: "" },
      { id: "742", driver: "Marshall Howie", phone: "" },
      { id: "743", driver: "Beck Bill", phone: "" },
      { id: "744", driver: "DeLorenzo Michael", phone: "" },
      { id: "745", driver: "Rose Chris", phone: "" },
      { id: "748", driver: "Dumas Rick", phone: "" },
      { id: "749", driver: "Carson Brownie", phone: "" },
      { id: "761", driver: "Williams Gail", phone: "" }
    ];
  }
  renderDrivers();
}

function renderDrivers() {
  const grid = document.getElementById('drivers-grid');
  if (!grid) return;

  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }

  DRIVER_STATE.zones.sort((a, b) => parseInt(a.id) - parseInt(b.id)).forEach(zone => {
    const card = document.createElement('div');
    card.className = 'equipment-card';
    card.style.padding = '20px';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;';

    const zoneLabel = document.createElement('div');
    zoneLabel.style.cssText = 'font-size: 24px; font-weight: 700; color: var(--green-500);';
    zoneLabel.textContent = 'Zone ' + zone.id;
    header.appendChild(zoneLabel);

    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 8px;';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-small';
    editBtn.textContent = '✏️ Edit';
    editBtn.onclick = () => editDriver(zone.id);
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-small';
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = () => deleteDriver(zone.id);
    actions.appendChild(deleteBtn);

    header.appendChild(actions);
    card.appendChild(header);

    const driverName = document.createElement('div');
    driverName.style.cssText = 'font-size: 18px; color: white; margin-bottom: 10px;';
    driverName.textContent = zone.driver;
    card.appendChild(driverName);

    if (zone.phone) {
      const phone = document.createElement('div');
      phone.style.cssText = 'font-size: 14px; color: var(--gray-400);';
      phone.textContent = '📞 ' + zone.phone;
      card.appendChild(phone);
    }

    grid.appendChild(card);
  });
}

function editDriver(zoneId) {
  const zone = DRIVER_STATE.zones.find(z => z.id === zoneId);
  if (!zone) return;

  const newDriver = prompt('Driver name for Zone ' + zoneId + ':', zone.driver);
  if (newDriver === null) return;

  const newPhone = prompt('Phone number (optional):', zone.phone || '');

  zone.driver = newDriver;
  zone.phone = newPhone || '';
  zone._modified = true;

  addChange('Updated Zone ' + zoneId + ' driver to ' + newDriver);
  renderDrivers();
}

function deleteDriver(zoneId) {
  if (!confirm('Delete Zone ' + zoneId + '? This cannot be undone.')) return;

  DRIVER_STATE.zones = DRIVER_STATE.zones.filter(z => z.id !== zoneId);
  addChange('Deleted Zone ' + zoneId);
  renderDrivers();
}

function addNewDriver() {
  const zoneId = prompt('Enter Zone number (e.g., 750):');
  if (!zoneId) return;

  if (DRIVER_STATE.zones.find(z => z.id === zoneId)) {
    alert('Zone ' + zoneId + ' already exists!');
    return;
  }

  const driverName = prompt('Driver name for Zone ' + zoneId + ':');
  if (!driverName) return;

  const phone = prompt('Phone number (optional):');

  DRIVER_STATE.zones.push({
    id: zoneId,
    driver: driverName,
    phone: phone || ''
  });

  addChange('Added Zone ' + zoneId + ' - ' + driverName);
  renderDrivers();
}

// ============================================================================
// ROSTER MANAGEMENT
// ============================================================================

const ROSTER_STATE = {
  members: []
};

function loadRoster() {
  // Load from HNFD_ROSTER if available (from app.js)
  if (typeof HNFD_ROSTER !== 'undefined') {
    ROSTER_STATE.members = JSON.parse(JSON.stringify(HNFD_ROSTER));
  } else {
    ROSTER_STATE.members = [];
  }
  renderRoster();
}

function renderRoster() {
  const grid = document.getElementById('roster-grid');
  if (!grid) return;

  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }

  // Sort by last name
  ROSTER_STATE.members.sort((a, b) => a.lastName.localeCompare(b.lastName)).forEach(member => {
    const card = document.createElement('div');
    card.className = 'equipment-card';
    card.style.padding = '15px';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';

    const nameDiv = document.createElement('div');
    nameDiv.innerHTML = `
      <div style="font-size: 18px; font-weight: 700; color: white;">${member.firstName} ${member.lastName}</div>
      <div style="font-size: 13px; color: var(--gray-400);">${member.office || member.certification || 'Member'}${member.number ? ' #' + member.number : ''}</div>
    `;
    header.appendChild(nameDiv);

    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 8px;';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-small';
    editBtn.textContent = '✏️';
    editBtn.onclick = () => editMember(member.number || member.lastName);
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-small';
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = () => deleteMember(member.number || member.lastName);
    actions.appendChild(deleteBtn);

    header.appendChild(actions);
    card.appendChild(header);

    // Phone info
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: 10px;';
    infoDiv.innerHTML = `
      <span style="color: var(--green-500);">📞</span>
      <span style="color: var(--gray-300);">${member.phone || 'No phone'}</span>
    `;
    card.appendChild(infoDiv);

    // Email if exists
    if (member.email) {
      const emailDiv = document.createElement('div');
      emailDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: 5px;';
      emailDiv.innerHTML = `
        <span style="color: var(--blue-500);">📧</span>
        <span style="color: var(--gray-400); font-size: 12px;">${member.email}</span>
      `;
      card.appendChild(emailDiv);
    }

    grid.appendChild(card);
  });
}

function editMember(identifier) {
  const member = ROSTER_STATE.members.find(m => m.number === identifier || m.lastName === identifier);
  if (!member) return;

  const newFirst = prompt('First name:', member.firstName);
  if (newFirst === null) return;

  const newLast = prompt('Last name:', member.lastName);
  if (newLast === null) return;

  const newPhone = prompt('Phone number:', member.phone || '');
  if (newPhone === null) return;

  const newCert = prompt('Certification (EMT, AEMT, Rescue Driver, FF, etc.):', member.certification || '');
  const newOffice = prompt('Office/Title (optional):', member.office || '');

  member.firstName = newFirst;
  member.lastName = newLast;
  member.phone = newPhone;
  member.certification = newCert || '';
  member.office = newOffice || '';
  member._modified = true;

  addChange('Updated member: ' + newFirst + ' ' + newLast);
  renderRoster();
}

function deleteMember(identifier) {
  const member = ROSTER_STATE.members.find(m => m.number === identifier || m.lastName === identifier);
  if (!member) return;

  if (!confirm('Delete ' + member.firstName + ' ' + member.lastName + '? This cannot be undone.')) return;

  ROSTER_STATE.members = ROSTER_STATE.members.filter(m => m !== member);
  addChange('Deleted member: ' + member.firstName + ' ' + member.lastName);
  renderRoster();
}

function addNewMember() {
  const firstName = prompt('First name:');
  if (!firstName) return;

  const lastName = prompt('Last name:');
  if (!lastName) return;

  const phone = prompt('Phone number:');
  const number = prompt('Member number (optional):');
  const certification = prompt('Certification (EMT, AEMT, Rescue Driver, FF, etc.):');
  const office = prompt('Office/Title (optional):');
  const email = prompt('Email (optional):');

  ROSTER_STATE.members.push({
    number: number || '',
    firstName: firstName,
    lastName: lastName,
    phone: phone || '',
    certification: certification || '',
    office: office || '',
    email: email || ''
  });

  addChange('Added member: ' + firstName + ' ' + lastName);
  renderRoster();
}

// ============================================================================
// SETTINGS / PIN MANAGEMENT
// ============================================================================

const SETTINGS_STATE = {
  rosterPin: '1426',       // For roster access in main app
  adminPin: 'hnfd2026admin' // For admin portal access
};

function loadSettings() {
  // Load from app.js constants if available
  if (typeof ROSTER_PIN !== 'undefined') {
    SETTINGS_STATE.rosterPin = ROSTER_PIN;
  }
  if (typeof ADMIN_PIN !== 'undefined') {
    SETTINGS_STATE.adminPin = ADMIN_PIN;
  }

  // Update display
  const rosterPinDisplay = document.getElementById('current-roster-pin');
  const adminPinDisplay = document.getElementById('current-admin-pin');

  if (rosterPinDisplay) {
    rosterPinDisplay.textContent = SETTINGS_STATE.rosterPin;
  }
  if (adminPinDisplay) {
    adminPinDisplay.textContent = SETTINGS_STATE.adminPin;
  }
}

function updateRosterPin() {
  const input = document.getElementById('roster-pin-input');
  const newPin = input.value.trim();

  if (!newPin) {
    alert('Please enter a PIN');
    return;
  }

  if (newPin.length < 4) {
    alert('PIN must be at least 4 characters');
    return;
  }

  const oldPin = SETTINGS_STATE.rosterPin;
  SETTINGS_STATE.rosterPin = newPin;

  document.getElementById('current-roster-pin').textContent = newPin;
  input.value = '';

  addChange('Changed Roster PIN from ' + oldPin + ' to ' + newPin);
  alert('Roster PIN updated to: ' + newPin + '\n\nRemember to Deploy for changes to take effect!');
}

function updateAdminPin() {
  const input = document.getElementById('admin-pin-input');
  const newPin = input.value.trim();

  if (!newPin) {
    alert('Please enter a PIN');
    return;
  }

  if (newPin.length < 4) {
    alert('PIN must be at least 4 characters');
    return;
  }

  const oldPin = SETTINGS_STATE.adminPin;
  SETTINGS_STATE.adminPin = newPin;

  document.getElementById('current-admin-pin').textContent = newPin;
  input.value = '';

  addChange('Changed Admin PIN from ' + oldPin + ' to ' + newPin);
  alert('Admin PIN updated to: ' + newPin + '\n\nRemember to Deploy for changes to take effect!');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('load', () => {
  console.log('[Admin Portal] Initializing...');
  loadEquipment();
  loadDriverZones();
  loadRoster();
  loadSettings();
  updateChangesDisplay();
});
