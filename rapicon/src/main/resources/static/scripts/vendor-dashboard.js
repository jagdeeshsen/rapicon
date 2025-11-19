// State Management
let currentDesignType = '';
let floors = [];
let elevationImages = [];
let planImages = [];
let vendorData = null;

let designs = [];

// ========== SESSION & AUTH MANAGEMENT ==========

// Check session on page load
async function checkSession() {
    const token = localStorage.getItem('vendor_token');
    if(!token || isTokenExpired(token)){
        localStorage.removeItem('vendor_token');
        localStorage.removeItem('vendor_role');
        localStorage.removeItem('vendor_id');
        localStorage.removeItem('vendor_fullName');
        localStorage.removeItem('user');
        console.error("Session expired Please login again ");
        redirectToLogin();
        return false;
    }
    return true;
}

// Redirect to login page (NOT OTP page)
function redirectToLogin() {
  // Clear any stored data
  localStorage.clear();
  sessionStorage.clear();

  // Redirect to login page
  window.location.href = '/login.html';
}

// ========== FETCH VENDOR DATA ==========

async function fetchVendorData() {
  const id= localStorage.getItem('vendor_id');
  try {
    const response = await fetch(`/api/vendor/get-vendor/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendor data');
    }

    const data = await response.json();
    vendorData = data;

    // Update UI with vendor data
    updateVendorUI(data);

    return data;
  } catch (error) {
    console.error('Error fetching vendor data:', error);
    return null;
  }
}

// Update UI with vendor information
function updateVendorUI(data) {
  // Update header
  const userName = document.querySelector('.user-name');
  const userEmail = document.querySelector('.user-email');
  const userAvatar = document.querySelector('.user-avatar');

  if (userName) userName.textContent = data.fullName || 'Vendor';
  if (userEmail) userEmail.textContent = data.email || '';

  // Update avatar with initials
  if (userAvatar && data.fullName) {
    const initials = data.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    userAvatar.textContent = initials;
  }

  // Update profile page
  const profileName = document.querySelector('.profile-info h2');
  const profileEmail = document.querySelector('.profile-info p');
  const profileAvatar = document.querySelector('.profile-avatar');

  if (profileName) profileName.textContent = data.fullName || 'Vendor';
  if (profileEmail) profileEmail.textContent = data.email || '';
  if (profileAvatar && data.fullName) {
    const initials = data.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    profileAvatar.textContent = initials;
  }

  // Update profile form fields
  if (data.fullName) {
    const nameParts = data.fullName.split(' ');
    const firstNameInput = document.querySelector('input[value="Vendor"]');
    const lastNameInput = document.querySelector('input[value="Designer"]');

    if (firstNameInput) firstNameInput.value = nameParts[0] || '';
    if (lastNameInput) lastNameInput.value = nameParts.slice(1).join(' ') || '';
  }

  // Update other profile fields
  const emailInput = document.querySelector('input[type="email"]');
  const phoneInput = document.querySelector('input[type="tel"]');
  const companyInput = document.querySelector('input[value="Design Studio Pro"]');
  const addressTextarea = document.querySelector('.form-textarea');
  const bioTextarea = document.querySelectorAll('.form-textarea')[1];

  if (emailInput && data.email) emailInput.value = data.email;
  if (phoneInput && data.phone) phoneInput.value = data.phone;
  if (companyInput && data.companyName) companyInput.value = data.companyName;
  if (addressTextarea && data.streetAddress) addressTextarea.value = data.streetAddress;
  if (bioTextarea && data.bio) bioTextarea.value = data.bio || '';
}

// ========== FETCH VENDOR DESIGNS ==========

async function fetchVendorDesigns() {
  console.log('📊 Fetching vendor designs...');
  const token = localStorage.getItem('vendor_token');

  try {
    const response = await fetch('/api/designs/fetch-designs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('Failed to fetch designs:', response.status);
      return [];
    }

    const data = await response.json();
    designs = data.designs || data || [];

    console.log('✅ Fetched designs:', designs.length);

    // Render designs if on view/manage page
    if (typeof renderDesignsGrid === 'function') renderDesignsGrid();
    if (typeof renderDesignsTable === 'function') renderDesignsTable();

    return designs;
  } catch (error) {
    console.error('Error fetching designs:', error);
    designs = [];
    return [];
  }
}

// ========== NAVIGATION ==========

function navigateTo(page) {
      const pages = ['upload', 'view', 'manage', 'profile'];
      const titles = {
        upload: 'Upload New Design',
        view: 'My Designs',
        manage: 'Manage Designs',
        profile: 'Vendor Profile'
      };

      pages.forEach(p => {
        document.getElementById(p + 'Page').classList.remove('active');
      });
      document.getElementById(page + 'Page').classList.add('active');

      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      event.target.closest('.nav-item').classList.add('active');

      document.getElementById('pageTitle').textContent = titles[page];

      if (page === 'view') renderDesignsGrid();
      if (page === 'manage') renderDesignsTable();
}

// ========== DESIGN TYPE SELECTION ==========

function selectDesignType(type) {
  currentDesignType = type;

  document.querySelectorAll('.design-type-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.target.closest('.design-type-card').classList.add('selected');

  const plotInfo = document.getElementById('plotInfo');
  const residentialOnly = document.getElementById('residentialOnlyFields');
  const numFloorsSection = document.getElementById('numFloorsSection');
  const commonFields = document.getElementById('commonFields');

  plotInfo.classList.add('hidden');
  residentialOnly.classList.add('hidden');
  numFloorsSection.classList.remove('hidden');
  commonFields.classList.remove('hidden');

  if (type === 'Residential') {
    plotInfo.classList.remove('hidden');
    residentialOnly.classList.remove('hidden');
  } else if (type === 'Semi-Commercial') {
    plotInfo.classList.remove('hidden');
  }

  floors = [];
  document.getElementById('numFloors').value = '';
  document.getElementById('floorsSection').classList.add('hidden');
}

// ========== FLOOR MANAGEMENT ==========

function generateFloors() {
  const num = parseInt(document.getElementById('numFloors').value);
  if (num > 0) {
    floors = Array.from({ length: num }, (_, i) => ({
      id: Date.now() + i,
      name: `Floor ${i + 1}`,
      type: currentDesignType === 'Semi-Commercial' ? 'Residential' : '',
      bedrooms: '',
      bathrooms: '',
      kitchen: '',
      hall: '',
      other: '',
      businessUnits: '',
      unitDetails: ''
    }));
    renderFloors();
    document.getElementById('floorsSection').classList.remove('hidden');
  } else {
    document.getElementById('floorsSection').classList.add('hidden');
  }
}

function addFloor() {
  floors.push({
    id: Date.now(),
    name: `Floor ${floors.length + 1}`,
    type: currentDesignType === 'Semi-Commercial' ? 'Residential' : '',
    bedrooms: '',
    bathrooms: '',
    kitchen: '',
    hall: '',
    other: '',
    businessUnits: '',
    unitDetails: ''
  });
  document.getElementById('numFloors').value = floors.length;
  renderFloors();
}

function removeFloor(id) {
  floors = floors.filter(f => f.id !== id);
  document.getElementById('numFloors').value = floors.length;
  if (floors.length === 0) {
    document.getElementById('floorsSection').classList.add('hidden');
  } else {
    renderFloors();
  }
}

function updateFloor(id, field, value) {
  floors = floors.map(f => f.id === id ? { ...f, [field]: value } : f);
}

function renderFloors() {
  const container = document.getElementById('floorsList');
  container.innerHTML = floors.map((floor, index) => {
    const showResidentialFields = currentDesignType === 'Residential' ||
      (currentDesignType === 'Semi-Commercial' && floor.type === 'Residential');
    const showCommercialFields = currentDesignType === 'Commercial' ||
      (currentDesignType === 'Semi-Commercial' && floor.type === 'Commercial');

    return `
      <div class="floor-card">
        <div class="floor-card-header">
          <div class="floor-title">Floor ${index + 1}</div>
          ${floors.length > 1 ? `
            <button type="button" class="btn-icon" style="background: #fee2e2; color: #ef4444;" onclick="removeFloor(${floor.id})">
              <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          ` : ''}
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Floor Name</label>
            <input type="text" class="form-input" value="${floor.name}" onchange="updateFloor(${floor.id}, 'name', this.value)">
          </div>

          ${currentDesignType === 'Semi-Commercial' ? `
            <div class="form-group">
              <label class="form-label">Floor Type</label>
              <select class="form-select" onchange="updateFloor(${floor.id}, 'type', this.value); renderFloors();">
                <option value="Residential" ${floor.type === 'Residential' ? 'selected' : ''}>Residential</option>
                <option value="Commercial" ${floor.type === 'Commercial' ? 'selected' : ''}>Commercial</option>
              </select>
            </div>
          ` : ''}

          ${showResidentialFields ? `
            <div class="form-group">
              <label class="form-label">Bedrooms</label>
              <input type="number" class="form-input" value="${floor.bedrooms}" onchange="updateFloor(${floor.id}, 'bedrooms', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Bathrooms</label>
              <input type="number" class="form-input" value="${floor.bathrooms}" onchange="updateFloor(${floor.id}, 'bathrooms', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Kitchen</label>
              <input type="text" class="form-input" value="${floor.kitchen}" placeholder="e.g., No. of kitchen" onchange="updateFloor(${floor.id}, 'kitchen', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Hall</label>
              <input type="text" class="form-input" value="${floor.hall}" placeholder="e.g., No. of hall" onchange="updateFloor(${floor.id}, 'hall', this.value)">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label">Other Rooms</label>
              <input type="text" class="form-input" value="${floor.other}" placeholder="e.g., Study room, Balcony" onchange="updateFloor(${floor.id}, 'other', this.value)">
            </div>
          ` : ''}

          ${showCommercialFields ? `
            <div class="form-group">
              <label class="form-label">Business Units</label>
              <input type="number" class="form-input" value="${floor.businessUnits}" onchange="updateFloor(${floor.id}, 'businessUnits', this.value)">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label">Unit Details</label>
              <textarea class="form-textarea" placeholder="e.g., Retail shops, Offices, Restaurants" onchange="updateFloor(${floor.id}, 'unitDetails', this.value)">${floor.unitDetails}</textarea>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ========== IMAGE HANDLING ==========

function handleImageUpload(event, type) {
  const files = Array.from(event.target.files);

  files.forEach(file => {
    const url = URL.createObjectURL(file);
    if (type === 'elevation') {
      elevationImages.push(url);
    } else {
      planImages.push(url);
    }
  });

  renderImagePreview(type);
}

function renderImagePreview(type) {
  const images = type === 'elevation' ? elevationImages : planImages;
  const container = document.getElementById(type + 'Preview');

  container.innerHTML = images.map((img, idx) => `
    <div class="image-preview-item">
      <img src="${img}" alt="${type} ${idx + 1}">
      <button type="button" class="image-remove" onclick="removeImage(${idx}, '${type}')">
        <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `).join('');
}

function removeImage(index, type) {
  if (type === 'elevation') {
    elevationImages.splice(index, 1);
  } else {
    planImages.splice(index, 1);
  }
  renderImagePreview(type);
}

// ========== FORM HANDLING ==========

function resetForm() {
  currentDesignType = '';
  floors = [];
  elevationImages = [];
  planImages = [];

  document.getElementById('uploadForm').reset();
  document.querySelectorAll('.design-type-card').forEach(card => {
    card.classList.remove('selected');
  });

  document.getElementById('plotInfo').classList.add('hidden');
  document.getElementById('numFloorsSection').classList.add('hidden');
  document.getElementById('floorsSection').classList.add('hidden');
  document.getElementById('commonFields').classList.add('hidden');
  document.getElementById('elevationPreview').innerHTML = '';
  document.getElementById('planPreview').innerHTML = '';
}

// ========== FORM SUBMISSION ==========

async function submitDesignForm() {
  console.log('🚀 Starting form submission...');

  // Validate required fields
  if (!currentDesignType) {
    alert('❌ Please select a design type');
    return;
  }

  // Get file inputs
  const elevationInput = document.getElementById('elevationUpload');
  const planInput = document.getElementById('planUpload');

  const elevationFiles = elevationInput?.files || [];
  const planFiles = planInput?.files || [];

  console.log('📁 Files selected:');
  console.log('  - Elevation files:', elevationFiles.length);
  console.log('  - Plan files:', planFiles.length);

  // Validate files exist
  if (elevationFiles.length === 0) {
    alert('❌ Please upload at least one elevation image');
    return;
  }
  if (planFiles.length === 0) {
    alert('❌ Please upload at least one 2D plan image');
    return;
  }

  // Validate file sizes
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  for (let file of elevationFiles) {
    console.log(`  ✓ Elevation: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
    if (file.size > MAX_FILE_SIZE) {
      alert(`❌ Elevation file "${file.name}" exceeds 50MB limit`);
      return;
    }
  }

  for (let file of planFiles) {
    console.log(`  ✓ Plan: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
    if (file.size > MAX_FILE_SIZE) {
      alert(`❌ Plan file "${file.name}" exceeds 50MB limit`);
      return;
    }
  }

  const formData = new FormData();

  // Add design type and basic info
  const formFields = {
    designType: currentDesignType,
    designCategory: document.getElementById('designCategory')?.value || '',
    plotLocation: document.getElementById('plotLocation')?.value || '',
    length: document.getElementById('plotLength')?.value || '',
    width: document.getElementById('plotBreadth')?.value || '',
    totalArea: document.getElementById('plotArea')?.value || '',
    plotFacing: document.getElementById('plotFacing')?.value || '',
    parking: document.getElementById('vehicleParking')?.value || '',
    builtUpArea: document.getElementById('totalBuiltUp')?.value || ''
  };

  console.log('📋 Form data:', formFields);

  // Append all form fields
  Object.entries(formFields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Add floor details as JSON
  console.log('🏢 Floors data:', floors);
  formData.append('floorList', JSON.stringify(floors));

  // Append elevation image files
  for (let file of elevationFiles) {
    formData.append('elevationFiles', file);
  }

  // Append plan image files
  for (let file of planFiles) {
    formData.append('twoDPlanFiles', file);
  }

  // Log FormData contents (for debugging)
  console.log('📦 FormData contents:');
  for (let pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`  ${pair[0]}: [File] ${pair[1].name}`);
    } else {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }
  }

  try {
    // Show loading state
    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Uploading...';
    submitBtn.disabled = true;

    const token = localStorage.getItem('vendor_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('🔐 Sending request with token...');

    const response = await fetch('/api/designs/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    console.log('📡 Response status:', response.status, response.statusText);

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Parsed JSON response:', result);
    } catch (e) {
      console.error('❌ Failed to parse JSON. Response was:', responseText);
      throw new Error('Server returned invalid JSON: ' + responseText.substring(0, 100));
    }

    if (response.ok && result.success) {
      alert('✅ Design uploaded successfully!');
      console.log('🎉 Success! Design data:', result.design);
      resetForm();

      // Refresh designs list if function exists
      if (typeof fetchVendorDesigns === 'function') {
        await fetchVendorDesigns();
      }
    } else {
      // Show detailed error
      const errorMsg = result.error || result.message || 'Unknown error';
      console.error('❌ Upload failed:', result);
      alert(`❌ Upload failed: ${errorMsg}`);

      // Log full error for debugging
      console.error('Full error object:', result);
    }

    // Restore button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

  } catch (error) {
    console.error('💥 Upload error:', error);
    console.error('Error stack:', error.stack);
    alert(`⚠️ Error: ${error.message}`);

    // Restore button
    const submitBtn = document.querySelector('.btn-primary');
    if (submitBtn) {
      submitBtn.textContent = 'Upload Design';
      submitBtn.disabled = false;
    }
  }
}


// ========== RENDER DESIGNS ==========

function renderDesignsGrid() {
  const container = document.getElementById('designsGrid');

  if (!designs || designs.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;">No designs uploaded yet.</p>';
    return;
  }

  container.innerHTML = designs.map(design => `
    <div class="design-card">
      <img src="${design.thumbnail || design.elevationUrls?.[0] || 'https://via.placeholder.com/400x300'}" alt="${design.name}" class="design-thumbnail">
      <div class="design-info">
        <div class="design-name">${design.designCategory.toUpperCase() || 'Untitled Design'}</div>
        <span class="status-badge status-${design.status}">
          ${getStatusIcon(design.status)}
          ${design.status.charAt(0).toUpperCase() + design.status.slice(1)}
        </span>
        <div class="design-details">
          <div class="detail-row">
            <span>Type:</span>
            <span class="detail-value">${design.type || design.designType}</span>
          </div>
          <div class="detail-row">
            <span>Floors:</span>
            <span class="detail-value">${design.floorList.length || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span>Area:</span>
            <span class="detail-value">${design.totalArea + ' sq ft' || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span>Uploaded:</span>
            <span class="detail-value">${formatDate(design.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderDesignsTable() {
  const tbody = document.getElementById('designsTable');

  if (!designs || designs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 40px;">No designs uploaded yet.</td></tr>';
    return;
  }

  tbody.innerHTML = designs.map(design => `
    <tr>
      <td>
        <div class="table-design-info">
          <img src="${design.thumbnail || design.elevationUrls?.[0] || 'https://via.placeholder.com/64'}" alt="${design.name}" class="table-thumbnail">
          <div class="table-design-details">
            <div class="table-design-name">${design.designCategory.toUpperCase() || 'Untitled Design'}</div>
            <div class="table-design-area">${design.totalArea + ' sq ft' || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td>${design.type || design.designType}</td>
      <td>
        <span class="status-badge status-${design.status}">
          ${getStatusIcon(design.status)}
          ${design.status.charAt(0).toUpperCase() + design.status.slice(1)}
        </span>
      </td>
      <td>${design.uploadedDate || formatDate(design.createdAt)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" style="background: #dbeafe; color: #1e40af;" onclick="editDesign(${design.id})" title="Edit">
            <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="btn-icon" style="background: #f1f5f9; color: #475569;" onclick="viewDesign(${design.id})" title="View">
            <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
          <button class="btn-icon" style="background: #fee2e2; color: #ef4444;" onclick="deleteDesign(${design.id})" title="Delete">
            <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function getStatusIcon(status) {
  switch (status) {
    case 'approved':
      return '<svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
    case 'pending':
      return '<svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    case 'rejected':
      return '<svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    default:
      return '';
  }
}

// ========== DESIGN ACTIONS ==========

function editDesign(id) {
  // TODO: Implement edit functionality
  console.log('Edit design:', id);
  alert('Edit functionality coming soon!');
}

function viewDesign(id) {
  // TODO: Implement view functionality
  console.log('View design:', id);
  alert('View functionality coming soon!');
}

/*async function deleteDesign(id) {
  if (!confirm('Are you sure you want to delete this design?')) {
    return;
  }

  try {
    const response = await fetch(`/api/vendor/delete-design.php?id=${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert('✅ Design deleted successfully!');
      // Refresh designs list
      await fetchVendorDesigns();
    } else {
      alert('❌ Failed to delete design: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('⚠️ Error deleting design. Please try again.');
  }
}*/

// ========== UTILITY FUNCTIONS ==========

function formatDate(dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ========== INITIALIZATION ==========

window.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Vendor Dashboard Loading...');

  // Check session first
  const isAuthenticated = await checkSession();
  if (!isAuthenticated) {
    return; // Will redirect to login
  }

  // Fetch vendor data
  await fetchVendorData();

  // Fetch designs
  await fetchVendorDesigns();

  // Setup form submission
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      console.log('📤 Upload button clicked');
      submitDesignForm();
    });
  }

  console.log('✅ Vendor Dashboard Loaded Successfully');
});

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime; // true if expired
  } catch (e) {
    console.error("Invalid token:", e);
    return true; // treat invalid as expired
  }
}

// Periodic session check (every 5 minutes)
setInterval(checkSession, 60 * 60 * 1000);