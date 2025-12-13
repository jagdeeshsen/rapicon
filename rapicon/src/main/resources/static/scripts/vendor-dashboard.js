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
        showMessage.error("Session expired Please login again ");
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

// ========== FETCH AND DISPLAY VENDOR DATA ==========

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
    showMessage.error('Error fetching vendor data:', error);
    return null;
  }
}

// update vendor data
function updateVendorUI(data) {
  if (!data) return;

  // Update header section
  const userName = document.querySelector('.logo-text');
  const userEmail = document.querySelector('.user-email');
  const userAvatar = document.querySelector('.logo-icon');

  if (userName) userName.textContent = data.fullName || 'Vendor';
  if (userEmail) userEmail.textContent = data.email || '';

  // Update avatar with initials
  if (userAvatar && data.fullName) {
    const initials = data.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    userAvatar.textContent = initials;
  }

  // Update profile page header
  const profileName = document.querySelector('.profile-info h2');
  const profileEmail = document.querySelector('.profile-info p');
  const memberSince = document.querySelector('.member-since');
  const profileAvatar = document.querySelector('.profile-avatar');

  if (profileName) profileName.textContent = data.fullName || 'Vendor';
  if (profileEmail) profileEmail.textContent = data.email || '';
  if (profileAvatar && data.fullName) {
    const initials = data.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    profileAvatar.textContent = initials;
  }

  // Format date
    if (data.createdAt) {
      const date = new Date(data.createdAt);
      const formattedDate = date.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric'
      });
      memberSince.textContent = `Member since ${formattedDate}`;
    }

  // Update User Information fields (LOCKED: fullName, userName, email)
  const fullNameInput = document.querySelector('#profileFullName');
  const userNameInput = document.querySelector('#profileUserName');
  const emailInput = document.querySelector('#profileEmail');
  const phoneInput = document.querySelector('#profilePhone'); // EDITABLE

  if (fullNameInput) fullNameInput.value = data.fullName || '';
  if (userNameInput) userNameInput.value = data.username || '';
  if (emailInput) emailInput.value = data.email || '';
  if (phoneInput) phoneInput.value = data.phone || '';

  // Update Qualification fields (LOCKED: degree, experience | EDITABLE: companyName)
  const companyNameInput = document.querySelector('#profileCompanyName');
  const degreeInput = document.querySelector('#profileDegree');
  const experienceInput = document.querySelector('#profileExperience');

  if (companyNameInput) companyNameInput.value = data.companyName || '';
  if (degreeInput) degreeInput.value = data.degree || '';
  if (experienceInput) experienceInput.value = data.experience || '';

  // Update Payment Details fields (ALL EDITABLE)
  const accountNumberInput = document.querySelector('#profileAccountNumber');
  const ifscCodeInput = document.querySelector('#profileIfscCode');
  const bankNameInput = document.querySelector('#profileBankName');
  const branchNameInput = document.querySelector('#profileBranchName');
  const panNumberInput = document.querySelector('#profilePanNumber');
  const gstNumberInput = document.querySelector('#profileGstNumber');

  if (accountNumberInput) accountNumberInput.value = data.accountNumber || '';
  if (ifscCodeInput) ifscCodeInput.value = data.ifscCode || '';
  if (bankNameInput) bankNameInput.value = data.bankName || '';
  if (branchNameInput) branchNameInput.value = data.branchName || '';
  if (panNumberInput) panNumberInput.value = data.panNumber || '';
  if (gstNumberInput) gstNumberInput.value = data.gstNumber || '';

  // Update Address fields (ALL EDITABLE)
  const streetInput = document.querySelector('#profileStreet');
  const cityInput = document.querySelector('#profileCity');
  const stateInput = document.querySelector('#profileState');
  const zipInput = document.querySelector('#profileZip');
  const countrySelect = document.querySelector('#profileCountry');

  if (streetInput) streetInput.value = data.streetAddress || '';
  if (cityInput) cityInput.value = data.city || '';
  if (stateInput) stateInput.value = data.state || '';
  if (zipInput) zipInput.value = data.zipCode || '';
  if (countrySelect) countrySelect.value = data.country || '';
}

// Enable edit mode for non-locked fields
function enableEdit() {
  const editableFields = document.querySelectorAll('.editable-field');
  editableFields.forEach(field => {
    if (field.tagName === 'SELECT') {
      field.removeAttribute('disabled');
    } else {
      field.removeAttribute('readonly');
    }
    field.style.backgroundColor = 'white';
  });

  // Show/hide buttons
  document.getElementById('editBtn').style.display = 'none';
  document.getElementById('saveBtn').style.display = 'inline-flex';
  document.getElementById('cancelBtn').style.display = 'inline-flex';


}

// Cancel edit function
async function cancelEdit() {
  const result= await showMessage.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.');
  if (result) {
    // Reload the profile data
    initializeProfile();

    // Make fields readonly again
    const editableFields = document.querySelectorAll('.editable-field');
    editableFields.forEach(field => {
      if (field.tagName === 'SELECT') {
        field.setAttribute('disabled', true);
      } else {
        field.setAttribute('readonly', true);
      }
      field.style.backgroundColor = '#f8f9fa';
    });

    // Show/hide buttons
    document.getElementById('editBtn').style.display = 'inline-flex';
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';
  }
}

// Delete account function
function deleteAccount() {
  //const confirmation = confirm('⚠️ WARNING: This will permanently delete your account and all associated data. This action cannot be undone.\n\nAre you absolutely sure you want to delete your account?');
  showMessage.alert("Delete Feature coming soon!");
  /*if (confirmation) {
    const finalConfirmation = prompt('Type "DELETE" to confirm account deletion:');

    if (finalConfirmation === 'DELETE') {
      // Remove vendor data from localStorage
      //localStorage.removeItem('vendorData');

      alert('Your account has been successfully deleted.');

      // Redirect to registration or login page
      window.location.href = 'register-now.html'; // Change to your registration page
    } else if (finalConfirmation !== null) {
      alert('Account deletion cancelled. Text did not match.');
    }
  }*/
}

// Edit profile function - only updates editable (non-required) fields
async function editProfile() {
  // Get existing data first
  const existingData = vendorData;

  const formData = {
    // LOCKED fields (keep from existing data, cannot be edited)
    fullName: existingData.fullName || '',
    username: existingData.userName || '',
    email: existingData.email || '',
    password: existingData.password || '', // Keep password unchanged
    degree: existingData.degree || '',
    experience: existingData.experience || '',

    // EDITABLE fields (can be updated)
    phone: document.querySelector('#profilePhone')?.value || existingData.phone,
    companyName: document.querySelector('#profileCompanyName')?.value || existingData.companyName,
    accountNumber: document.querySelector('#profileAccountNumber')?.value || existingData.accountNumber,
    ifscCode: document.querySelector('#profileIfscCode')?.value || existingData.ifscCode,
    bankName: document.querySelector('#profileBankName')?.value || existingData.bankName,
    branchName: document.querySelector('#profileBranchName')?.value || existingData.branchName,
    panNumber: document.querySelector('#profilePanNumber')?.value || existingData.panNumber,
    gstNumber: document.querySelector('#profileGstNumber')?.value || existingData.gstNumber,

    // EDITABLE Address fields
    streetAddress: document.querySelector('#profileStreet')?.value || existingData.streetAddress,
    city: document.querySelector('#profileCity')?.value || existingData.city,
    state: document.querySelector('#profileState')?.value || existingData.state,
    zipCode: document.querySelector('#profileZip')?.value || existingData.zipCode,
    country: document.querySelector('#profileCountry')?.value || existingData.country
  };

  // Validate phone format if provided
  if (formData.phone) {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Please enter a valid phone number');
      return false;
    }
  }

  // Save updated profile data to localStorage
  try {
    const vendorId= localStorage.getItem('vendor_id');
    const token = localStorage.getItem('vendor_token');

    const response = await fetch(`/api/vendor/update-vendor/${vendorId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    if(!response.ok){
        showMessage.error("Failed to update profile");
    }

    const responseResult= await response.json();
    vendorData= responseResult.vendor;

    showMessage.success("Profile updated successfully");

    // update the vendor profile
    //await fetchVendorData();
    updateVendorUI(responseResult.vendor);

    // Make fields readonly again
    const editableFields = document.querySelectorAll('.editable-field');
    editableFields.forEach(field => {
      if (field.tagName === 'SELECT') {
        field.setAttribute('disabled', true);
      } else {
        field.setAttribute('readonly', true);
      }
      field.style.backgroundColor = '#f8f9fa';
    });

    // Show/hide buttons
    document.getElementById('editBtn').style.display = 'inline-flex';
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';

    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Failed to update profile. Please try again.');
    return false;
  }
}

// Initialize profile on page load
function initializeProfile() {

  if (vendorData) {
    try {
      updateVendorUI(vendorData);
    } catch (error) {
      showMessage.error('Error loading profile data:', error);
    }
  }

  // Ensure buttons are in correct state
  const editBtn = document.getElementById('editBtn');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  if (editBtn) editBtn.style.display = 'inline-flex';
  if (saveBtn) saveBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// ========== FETCH VENDOR DESIGNS ==========

async function fetchVendorDesigns() {
  const token = localStorage.getItem('vendor_token');

  if(!checkSession()){
        showMessage.error("Session expired please login again");
        window.location.href='/login.html';
  }

  try {
    const response = await fetch('/api/designs/fetch-designs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      showMessage.warning('Failed to fetch designs:', response.status);
      return [];
    }

    const data = await response.json();
    designs = data.designs || data || [];

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

function navigateTo(page, sourceEvent = null) {
  const pages = ['upload', 'view', 'manage', 'profile', 'transactions'];
  const titles = {
    upload: 'Upload New Design',
    view: 'My Designs',
    manage: 'Manage Designs',
    profile: 'Vendor Profile',
    transactions: 'Transaction History'
  };

  pages.forEach(p => {
    const pageElement = document.getElementById(p + 'Page');
    if (pageElement) {
      pageElement.classList.remove('active');
    }
  });

  const targetPage = document.getElementById(page + 'Page');
  if (targetPage) {
    targetPage.classList.add('active');
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  // Only try to update nav item if sourceEvent exists
  if (sourceEvent && sourceEvent.target) {
    const navItem = sourceEvent.target.closest('.nav-item');
    if (navItem) {
      navItem.classList.add('active');
    }
  } else {
    // If no event, find and activate the nav item by page name
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const itemText = item.textContent.trim().toLowerCase();
      if (
        (page === 'upload' && itemText.includes('upload')) ||
        (page === 'view' && itemText.includes('view')) ||
        (page === 'manage' && itemText.includes('manage')) ||
        (page === 'profile' && itemText.includes('profile')) ||
        (page === 'transactions' && itemText.includes('transaction'))
      ) {
        item.classList.add('active');
      }
    });
  }

  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    pageTitle.textContent = titles[page];
  }

  // Reset form when navigating away from upload page (except when editing)
  if (page !== 'upload') {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm && uploadForm.dataset.editingId) {
      // Clear editing mode when navigating away
      delete uploadForm.dataset.editingId;
      const submitBtn = document.querySelector('.btn-primary');
      if (submitBtn) {
        submitBtn.textContent = 'Upload Design';
      }
    }
  }

  if (page === 'view') renderDesignsGrid();
  if (page === 'manage') renderDesignsTable();
  if (page === 'transactions') initializeTransactions();
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
  } else{
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
  const preview = document.getElementById(type + 'Preview');

  files.forEach(file => {
    const url = URL.createObjectURL(file);
    if (type === 'elevation') {
      elevationImages.push(url);
    } else {
      planImages.push(url);
    }
  });

  // Render new images along with existing ones
  renderImagePreview(type);
}

function renderImagePreview(type) {
  const images = type === 'elevation' ? elevationImages : planImages;
  const container = document.getElementById(type + 'Preview');

  // Get existing images HTML (if in edit mode)
  const uploadForm = document.getElementById('uploadForm');
  const isEditing = !!uploadForm.dataset.editingId;
  let existingHtml = '';

  if (isEditing) {
    const existingUrlsKey = type === 'elevation' ? 'existingElevationUrls' : 'existingPlanUrls';
    let existingUrls = [];
    try {
      existingUrls = JSON.parse(uploadForm.dataset[existingUrlsKey] || '[]');
    } catch (e) {
      showMessage.error('Error parsing existing URLs:', e);
    }

    existingHtml = existingUrls.map((url) => `
      <div class="image-preview-item" data-existing="true" data-url="${url}">
        <img src="${url}" alt="${type}">
        <div style="position: absolute; top: 8px; right: 8px; background: rgba(59, 130, 246, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">
          Current
        </div>
        <button type="button" class="image-remove" onclick="removeExistingImage('${type}', '${url}')">
          <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  // Render new images
  const newImagesHtml = images.map((img, idx) => `
    <div class="image-preview-item">
      <img src="${img}" alt="${type} ${idx + 1}">
      <div style="position: absolute; top: 8px; right: 8px; background: rgba(34, 197, 94, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">
        New
      </div>
      <button type="button" class="image-remove" onclick="removeImage(${idx}, '${type}')">
        <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `).join('');

  container.innerHTML = existingHtml + newImagesHtml;
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

  // ADD THESE TWO LINES:
    delete document.getElementById('uploadForm').dataset.editingId;
    const submitBtn = document.querySelector('.btn-primary');
    if (submitBtn) {
      submitBtn.textContent = 'Upload Design';
    }
    // END OF NEW LINES

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

  // Validate required fields
  if (!currentDesignType) {
    alert('Please select a design type');
    return;
  }

  // Get file inputs
  const elevationInput = document.getElementById('elevationUpload');
  const planInput = document.getElementById('planUpload');

  const elevationFiles = elevationInput?.files || [];
  const planFiles = planInput?.files || [];

  // Validate files exist
  if (elevationFiles.length === 0) {
    alert('Please upload at least one elevation image');
    return;
  }
  if (planFiles.length === 0) {
    alert('Please upload at least one 2D plan image');
    return;
  }

  // Validate file sizes
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  for (let file of elevationFiles) {
    if (file.size > MAX_FILE_SIZE) {
      alert(`Elevation file "${file.name}" exceeds 50MB limit`);
      return;
    }
  }

  for (let file of planFiles) {
    if (file.size > MAX_FILE_SIZE) {
      alert(`Plan file "${file.name}" exceeds 50MB limit`);
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

  // Append all form fields
  Object.entries(formFields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Add floor details as JSON
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

    const response = await fetch('/api/designs/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error('Server returned invalid JSON: ' + responseText.substring(0, 100));
    }

    if (response.ok && result.success) {
      showMessage.success('Design uploaded successfully!');
      resetForm();

      // Refresh designs list if function exists
      if (typeof fetchVendorDesigns === 'function') {
        await fetchVendorDesigns();
      }
    } else {
      // Show detailed error
      const errorMsg = result.error || result.message || 'Unknown error';
      showMessage.error('Upload failed.');
      alert(`Upload failed: ${errorMsg}`);
    }

    // Restore button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

  } catch (error) {
    showMessage.error('💥 Upload error:', error);
    showMessage.error('Error stack:', error.stack);
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
        <div class="design-name">${design.designCategory.toUpperCase() || design.designType.toUpperCase()}</div>
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
            <div class="table-design-name">${design.designCategory.toUpperCase() || design.designType.toUpperCase()}</div>
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
          <button class="btn-icon" style="background: #fee2e2; color: #ef4444;"
                  onclick="deactivateDesign(${design.id}, '${design.status}')" title="Deactivate">
            <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 2v10m6.364-6.364a9 9 0 11-12.728 0" />
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

async function deactivateDesign(id, status){
    if(status.toUpperCase()==='APPROVED'){
        await showMessage.alert("Approved design can not be deactivated");
        return ;
    }

    const token= localStorage.getItem('vendor_token');

    try{
        const response= await fetch(`/api/designs/update?id=${id}&status=DEACTIVATE`,{
            method: 'PUT',
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok){
            throw new Error("Error deactivating design");
        }

        showMessage.success("design deactivate successfully");
        fetchVendorDesigns();

    }catch(e){
        showMessage.error("error", e);
    }
}

function editDesign(id) {

  // Find the design to edit
  const design = designs.find(d => d.id === id);
  if (!design) {
    alert('Design not found!');
    return;
  }

  // Navigate to upload page - MANUALLY ACTIVATE IT
  const pages = ['upload', 'view', 'manage', 'profile'];
  pages.forEach(p => {
    document.getElementById(p + 'Page').classList.remove('active');
  });
  document.getElementById('uploadPage').classList.add('active');

  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.textContent.trim().toLowerCase().includes('upload')) {
      item.classList.add('active');
    }
  });

  // Update page title
  document.getElementById('pageTitle').textContent = 'Edit Design';

  // IMPORTANT: Don't reset form, just clear the dataset
  const uploadForm = document.getElementById('uploadForm');
  delete uploadForm.dataset.editingId;

  // Clear form fields but not the structure
  uploadForm.reset();

  // Clear floors and images
  floors = [];
  elevationImages = [];
  planImages = [];

  // Set design type
  currentDesignType = design.designType || design.type;

  // Select the appropriate design type card
  const designTypeCards = document.querySelectorAll('.design-type-card');
  designTypeCards.forEach(card => {
    card.classList.remove('selected');
    const cardTitle = card.querySelector('.design-type-title').textContent;
    if (cardTitle === currentDesignType) {
      card.classList.add('selected');
    }
  });

  // Show appropriate sections
  const plotInfo = document.getElementById('plotInfo');
  const residentialOnly = document.getElementById('residentialOnlyFields');
  const numFloorsSection = document.getElementById('numFloorsSection');
  const commonFields = document.getElementById('commonFields');

  plotInfo.classList.remove('hidden');
  numFloorsSection.classList.remove('hidden');
  commonFields.classList.remove('hidden');

  if (currentDesignType === 'Residential') {
    residentialOnly.classList.remove('hidden');
  } else {
    residentialOnly.classList.add('hidden');
  }

  // Populate plot information
  if (design.length) document.getElementById('plotLength').value = design.length;
  if (design.width) document.getElementById('plotBreadth').value = design.width;
  if (design.totalArea) document.getElementById('plotArea').value = design.totalArea;
  if (design.plotFacing) document.getElementById('plotFacing').value = design.plotFacing;

  // Populate residential-only fields
  if (design.plotLocation) document.getElementById('plotLocation').value = design.plotLocation;
  if (design.designCategory) document.getElementById('designCategory').value = design.designCategory;

  // Populate common fields
  if (design.parking) document.getElementById('vehicleParking').value = design.parking;
  if (design.builtUpArea) document.getElementById('totalBuiltUp').value = design.builtUpArea;

  // Populate floor data
  if (design.floorList && design.floorList.length > 0) {
    floors = design.floorList.map((floor, index) => ({
      id: Date.now() + index,
      name: floor.name || `Floor ${index + 1}`,
      type: floor.type || (currentDesignType === 'Semi-Commercial' ? 'Residential' : ''),
      bedrooms: floor.bedrooms || '',
      bathrooms: floor.bathrooms || '',
      kitchen: floor.kitchen || '',
      hall: floor.hall || '',
      other: floor.other || '',
      businessUnits: floor.businessUnits || '',
      unitDetails: floor.unitDetails || ''
    }));

    document.getElementById('numFloors').value = floors.length;
    document.getElementById('floorsSection').classList.remove('hidden');
    renderFloors();
  }

  // Handle existing images - show preview WITH ability to remove
  const elevationPreview = document.getElementById('elevationPreview');
  const planPreview = document.getElementById('planPreview');

  // Store existing image URLs for reference
  uploadForm.dataset.existingElevationUrls = JSON.stringify(design.elevationUrls || []);
  uploadForm.dataset.existingPlanUrls = JSON.stringify(design.twoDPlanUrls || []);

  if (design.elevationUrls && design.elevationUrls.length > 0) {
    elevationPreview.innerHTML = design.elevationUrls.map((url, idx) => `
      <div class="image-preview-item" data-existing="true" data-url="${url}">
        <img src="${url}" alt="elevation ${idx + 1}">
        <div style="position: absolute; top: 8px; right: 8px; background: rgba(59, 130, 246, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">
          Current
        </div>
        <button type="button" class="image-remove" onclick="removeExistingImage('elevation', '${url}')">
          <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  if (design.twoDPlanUrls && design.twoDPlanUrls.length > 0) {
    planPreview.innerHTML = design.twoDPlanUrls.map((url, idx) => `
      <div class="image-preview-item" data-existing="true" data-url="${url}">
        <img src="${url}" alt="plan ${idx + 1}">
        <div style="position: absolute; top: 8px; right: 8px; background: rgba(59, 130, 246, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">
          Current
        </div>
        <button type="button" class="image-remove" onclick="removeExistingImage('plan', '${url}')">
          <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  // Store the design ID for update operation
  uploadForm.dataset.editingId = id;

  // Change submit button text
  const submitBtn = document.querySelector('.btn-primary');
  if (submitBtn) {
    submitBtn.textContent = 'Update Design';
  }

  // Scroll to top of form
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

      // Check if we're editing or creating new
      const editingId = document.getElementById('uploadForm').dataset.editingId;

      if (editingId) {
        updateDesignForm(); // Call update function
      } else {
        submitDesignForm(); // Call upload function
      }
    });
  }

  // Initialize transaction filters (only set up listeners once)
  const statusFilter = document.getElementById('statusFilter');
  const typeFilter = document.getElementById('typeFilter');
  const periodFilter = document.getElementById('periodFilter');

  if (statusFilter) {
    statusFilter.addEventListener('change', filterTransactions);
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', filterTransactions);
  }
  if (periodFilter) {
    periodFilter.addEventListener('change', filterTransactions);
  }

  // Initialize pagination buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      console.log('Previous page');
      // Add your pagination logic here
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      console.log('Next page');
      // Add your pagination logic here
    });
  }

  // Initialize transaction data
  initializeTransactionData();

});


//===================== logout vendor ====================

async function logoutVendor(){
    const result = await showMessage.confirm('Are you sure you want to logout?')
    if (result) {

       const token = localStorage.getItem('vendor_token');

       try {
           await fetch('/api/auth/logout-vendor', {
               method: 'POST',
               headers: {
                   'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
               }
           });
       } catch (error) {
           showMessage.warning(error);
           //showMessage.warning('Logout request failed or not implemented on server:', error);
       }

       // Clear all local storage/session data
       localStorage.removeItem('vendor_token');
       localStorage.removeItem('user');
       localStorage.removeItem('vendor_fullName');
       localStorage.removeItem('vendor_role');
       localStorage.removeItem('vendor_id');
       sessionStorage.clear();


       // Redirect to login page
       setTimeout(() => {
           window.location.href = '/login.html';
       }, 1000);
   }
}

//==================== check token expired ===================

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

// ========== UPDATE DESIGN FUNCTION ==========

async function updateDesignForm() {

  const editingId = document.getElementById('uploadForm').dataset.editingId;

  if (!editingId) {
    await showMessage.alert('No design selected for editing');
    return;
  }

  // Validate required fields
  if (!currentDesignType) {
    await showMessage.alert('Please select a design type');
    return;
  }

  // Get file inputs
  const elevationInput = document.getElementById('elevationUpload');
  const planInput = document.getElementById('planUpload');

  const elevationFiles = elevationInput?.files || [];
  const planFiles = planInput?.files || [];

  // Get existing images that should be kept
  const uploadForm = document.getElementById('uploadForm');
  let existingElevationUrls = [];
  let existingPlanUrls = [];

  try {
    existingElevationUrls = JSON.parse(uploadForm.dataset.existingElevationUrls || '[]');
    existingPlanUrls = JSON.parse(uploadForm.dataset.existingPlanUrls || '[]');
  } catch (e) {
    console.error('Error parsing existing URLs:', e);
  }

  // Validate that we have at least some images (existing or new)
  if (existingElevationUrls.length === 0 && elevationFiles.length === 0) {
    await showMessage.alert('Please keep at least one elevation image or upload new ones');
    return;
  }
  if (existingPlanUrls.length === 0 && planFiles.length === 0) {
    await showMessage.alert('Please keep at least one plan image or upload new ones');
    return;
  }

  // Validate file sizes if new files are uploaded
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  for (let file of elevationFiles) {
    if (file.size > MAX_FILE_SIZE) {
      await showMessage.alert(`Elevation file "${file.name}" exceeds 50MB limit`);
      return;
    }
  }

  for (let file of planFiles) {
    if (file.size > MAX_FILE_SIZE) {
      await showMessage.alert(`Plan file "${file.name}" exceeds 50MB limit`);
      return;
    }
  }

  const formData = new FormData();

  // Add design ID
  formData.append('id', editingId);

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

  // Append all form fields
  Object.entries(formFields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Add floor details as JSON
  formData.append('floorList', JSON.stringify(floors));

  // Send existing image URLs to keep (as JSON strings)
  formData.append('keepElevationUrls', JSON.stringify(existingElevationUrls));
  formData.append('keepPlanUrls', JSON.stringify(existingPlanUrls));


  // Append new elevation image files (if any)
  if (elevationFiles.length > 0) {
    for (let file of elevationFiles) {
      formData.append('elevationFiles', file);
    }
  }

  // Append new plan image files (if any)
  if (planFiles.length > 0) {
    for (let file of planFiles) {
      formData.append('twoDPlanFiles', file);
    }
  }

  try {
    // Show loading state
    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;

    const token = localStorage.getItem('vendor_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`/api/designs/update/${editingId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      await showMessage.error('Failed to parse JSON. Response was:', responseText);
      throw new Error('Server returned invalid JSON: ' + responseText.substring(0, 100));
    }

    if (response.ok && result.success) {
      showMessage.success('Design updated successfully!');

      // Reset form
      resetForm();

      // Refresh designs list if function exists
      if (typeof fetchVendorDesigns === 'function') {
        await fetchVendorDesigns();
      }

      // Navigate to manage page to see the updated design
      const pages = ['upload', 'view', 'manage', 'profile'];
      pages.forEach(p => {
        document.getElementById(p + 'Page').classList.remove('active');
      });
      document.getElementById('managePage').classList.add('active');

      // Update navigation
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.textContent.trim().toLowerCase().includes('manage')) {
          item.classList.add('active');
        }
      });

      // Update page title
      document.getElementById('pageTitle').textContent = 'Manage Designs';

      // Render designs table
      if (typeof renderDesignsTable === 'function') {
        renderDesignsTable();
      }

    } else {
      // Show detailed error
      const errorMsg = result.error || result.message || 'Unknown error';
      await showMessage.alert(`Update failed: ${errorMsg}`);
    }

    // Restore button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

  } catch (error) {
    console.error('Update error:', error);
    console.error('Error stack:', error.stack);
    alert(`Error: ${error.message}`);

    // Restore button
    const submitBtn = document.querySelector('.btn-primary');
    if (submitBtn) {
      submitBtn.textContent = 'Update Design';
      submitBtn.disabled = false;
    }
  }
}

// ========== EXISTING IMAGE MANAGEMENT ==========

function removeExistingImage(type, url) {
  const uploadForm = document.getElementById('uploadForm');
  const existingUrlsKey = type === 'elevation' ? 'existingElevationUrls' : 'existingPlanUrls';

  // Get current existing URLs
  let existingUrls = [];
  try {
    existingUrls = JSON.parse(uploadForm.dataset[existingUrlsKey] || '[]');
  } catch (e) {
    console.error('Error parsing existing URLs:', e);
  }

  // Remove the URL
  existingUrls = existingUrls.filter(u => u !== url);

  // Update the dataset
  uploadForm.dataset[existingUrlsKey] = JSON.stringify(existingUrls);

  // Remove from preview
  const preview = document.getElementById(type + 'Preview');
  const itemToRemove = preview.querySelector(`[data-url="${url}"]`);
  if (itemToRemove) {
    itemToRemove.remove();
  }

  console.log(`Removed ${type} image:`, url);
}

//===================== transaction page=======================

// Store transaction data globally
function initializeTransactionData() {
  if (!window.allTransactions) {
    window.allTransactions = [
      /*{ id: '#TXN-2024-1234', date: 'Dec 08, 2024', customer: 'Rajesh Kumar', type: 'Sale', amount: 2450, status: 'completed' },
      { id: '#TXN-2024-1233', date: 'Dec 07, 2024', customer: 'Priya Sharma', type: 'Sale', amount: 1890, status: 'completed' },
      { id: '#TXN-2024-1232', date: 'Dec 06, 2024', customer: 'Amit Patel', type: 'Sale', amount: 3200, status: 'pending' },
      { id: '#TXN-2024-1231', date: 'Dec 05, 2024', customer: 'Sneha Gupta', type: 'Sale', amount: 1650, status: 'completed' },
      { id: '#TXN-2024-1230', date: 'Dec 04, 2024', customer: 'Vikram Singh', type: 'Refund', amount: -850, status: 'completed' },
      { id: '#TXN-2024-1229', date: 'Dec 03, 2024', customer: 'Meera Reddy', type: 'Sale', amount: 2100, status: 'completed' },
      { id: '#TXN-2024-1228', date: 'Dec 02, 2024', customer: 'Arjun Mehta', type: 'Sale', amount: 1450, status: 'pending' },
      { id: '#TXN-2024-1227', date: 'Dec 01, 2024', customer: 'Kavita Joshi', type: 'Withdrawal', amount: -15000, status: 'completed' },
      { id: '#TXN-2024-1226', date: 'Nov 30, 2024', customer: 'Rahul Verma', type: 'Sale', amount: 2850, status: 'failed' },
      { id: '#TXN-2024-1225', date: 'Nov 29, 2024', customer: 'Pooja Nair', type: 'Sale', amount: 1780, status: 'completed' }*/
    ];
  }
}

// Called when navigating to transactions page
function initializeTransactions() {
  // Render the current transactions
  renderTransactions(window.allTransactions || []);
}

function filterTransactions() {
  const statusFilter = document.getElementById('statusFilter');
  const typeFilter = document.getElementById('typeFilter');

  if (!window.allTransactions) return;

  let filtered = window.allTransactions;

  if (statusFilter && statusFilter.value !== 'all') {
    filtered = filtered.filter(t => t.status === statusFilter.value);
  }

  if (typeFilter && typeFilter.value !== 'all') {
    filtered = filtered.filter(t => t.type.toLowerCase() === typeFilter.value);
  }

  renderTransactions(filtered);
}

function renderTransactions(transactions) {
  const tbody = document.getElementById('transactionTableBody');

  if (!tbody) return;

  if (transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 60px 20px; color: #999;">
          <svg style="width: 80px; height: 80px; margin-bottom: 16px; opacity: 0.5;" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
          </svg>
          <p>No transactions found</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = transactions.map(t => {
    const statusClass = `status-${t.status}`;
    const amountClass = t.amount >= 0 ? 'amount-positive' : 'amount-negative';
    const amountSign = t.amount >= 0 ? '+' : '';

    return `
      <tr>
        <td>${t.id}</td>
        <td>${t.date}</td>
        <td>${t.customer}</td>
        <td>${t.type}</td>
        <td class="${amountClass}">${amountSign}₹${Math.abs(t.amount).toLocaleString()}</td>
        <td><span class="status-badge ${statusClass}">${t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span></td>
      </tr>
    `;
  }).join('');
}

// ========= menu btn for sidebar ============
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

/* Auto-close sidebar when menu item clicked (mobile only) */
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    if (window.innerWidth <= 1023) {
      document.getElementById("sidebar").classList.remove("open");
    }
  });
});
