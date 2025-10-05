// Sample vendor designs data
let vendorDesigns = [
    /*{
        id: 1,
        title: "Modern Villa Paradise",
        designType: "VILLA",
        price: 1850,
        bedrooms: 4,
        bathrooms: 3,
        area: "3200 sq ft",
        status: "approved",
        uploadDate: "2024-01-15",
        sales: 23,
        rating: 4.9,
        description: "Luxurious modern villa with contemporary design",
        icon: "🏡",
        //imageUrl: "https://rapicon-vendor-designs.s3.ap-south-1.amazonaws.com/designs/1758606543392-FIRST FLOOR Presentations-Model_page-0001.jpg"
    },
    // ... other designs*/
];

let filteredDesigns = [...vendorDesigns];
// Call once when page loads
window.addEventListener("DOMContentLoaded", loadMyDesigns);

// -----------------------
// Tab Switching
// -----------------------
function switchTab(tabName) {
    // Remove active classes from tabs and contents
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Activate clicked tab button
    const clickedTab = document.querySelector(`.nav-tab[onclick="switchTab('${tabName}')"]`);
    if (clickedTab) clickedTab.classList.add('active');

    // Show corresponding content
    const content = document.getElementById(tabName);
    if (content) content.classList.add('active');
}

// -----------------------
// Upload Form
// -----------------------

async function handleUploadSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const token = localStorage.getItem('token');
    const editId = form.getAttribute('data-edit-id'); // check if we are editing

    try {
        let response;
        if (editId) {
            // UPDATE request
            response = await fetch(`/api/designs/update?id=${editId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
        } else {
            // NEW UPLOAD request
            response = await fetch('/api/designs/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (editId) {
            // Update local array
            const index = vendorDesigns.findIndex(d => d.id == editId);
            if (index !== -1) {
                vendorDesigns[index] = {
                    ...vendorDesigns[index],
                    title: formData.get('title'),
                    designType: formData.get('designType').toUpperCase(),
                    price: parseInt(formData.get('price')),
                    bedrooms: parseInt(formData.get('bedrooms')),
                    bathrooms: parseInt(formData.get('bathrooms')),
                    floors: parseInt(formData.get('floors')) || 1,
                    area: formData.get('area') + " sq ft",
                    description: formData.get('description'),
                    imageUrl: data.imageUrl?.trim() || vendorDesigns[index]?.imageUrl?.trim() || '',
                };
            }
            showNotification('✅ Design updated successfully!', 'success');
        } else {
            // Add new
            const newDesign = {
                id: data.id || Date.now(),
                title: formData.get('title'),
                designType: formData.get('designType').toUpperCase(),
                price: parseInt(formData.get('price')),
                bedrooms: parseInt(formData.get('bedrooms')),
                bathrooms: parseInt(formData.get('bathrooms')),
                floors: parseInt(formData.get('floors')) || 1,
                area: formData.get('area') + " sq ft",
                status: "pending",
                uploadDate: new Date().toISOString().split('T')[0],
                sales: 0,
                rating: 0,
                description: formData.get('description'),
                imageUrl: data.imageUrl?.trim() || '',
                icon: getDesignIcon(formData.get('designType').toUpperCase())
            };
            vendorDesigns.unshift(newDesign);
            showNotification('🎉 Design uploaded successfully!', 'success');
        }

        // ✅ ALWAYS reset form & file input regardless of new/edit
        form.reset();
        form.removeAttribute('data-edit-id');

        const fileInput = document.getElementById("imageFile");
        if (fileInput) fileInput.value = "";

        const fileLabel = document.querySelector('.file-upload-label');
        if (fileLabel) {
            fileLabel.innerHTML = `
                <div class="file-upload-icon">📁</div>
                <div class="file-upload-text">Click to upload design files</div>
                <div class="file-upload-subtext">PDF, DWG, Images, ZIP files</div>
            `;
            fileLabel.style.borderColor = '#e2e8f0';
            fileLabel.style.background = '#f8fafc';
        }

        filteredDesigns = [...vendorDesigns];
        renderMyDesigns();
        renderRecentDesigns();
        updateStats();

        switchTab('designs');

    } catch (err) {
        console.error("Save failed:", err);
        showNotification('❌ Failed to save design: ' + err.message, 'error');
    }
}

// -----------------------
// File Select Preview
// -----------------------
function handleFileSelect(event) {
    const files = event.target.files;
    const label = event.target.nextElementSibling;

    if (files.length > 0) {
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        label.innerHTML = `
            <div class="file-upload-icon">📁</div>
            <div class="file-upload-text">${files.length} file(s) selected</div>
            <div class="file-upload-subtext">${fileNames}</div>
        `;
        label.style.borderColor = '#667eea';
        label.style.background = 'rgba(102, 126, 234, 0.05)';
    }
}

// -----------------------
// Filters
// -----------------------
function applyDesignFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value;
    const typeFilter = document.getElementById('typeFilterDesigns')?.value;

    filteredDesigns = vendorDesigns.filter(design => {
        const matchesStatus = !statusFilter || design.status === statusFilter;
        const matchesType = !typeFilter || design.designType === typeFilter;
        return matchesStatus && matchesType;
    });

    renderMyDesigns();
}

// -----------------------
// Render Designs
// -----------------------
function renderRecentDesigns() {
    const recentDesigns = vendorDesigns.slice(0, 3);
    const container = document.getElementById('recentDesigns');
    if (!container) return;

    if (recentDesigns.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No designs yet</h3><p>Start by uploading your first design!</p></div>`;
        return;
    }

    container.innerHTML = '';
    recentDesigns.forEach(design => {
        container.appendChild(createDesignCard(design));
    });
}

function renderMyDesigns() {
    const container = document.getElementById('myDesigns');
    if (!container) return;

    if (filteredDesigns.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No designs found</h3><p>Try adjusting your filters or upload new designs.</p></div>`;
        return;
    }

    container.innerHTML = '';
    filteredDesigns.forEach(design => {
        container.appendChild(createDesignCard(design, true));
    });
}

// -----------------------
// Create Design Card
// -----------------------

function createDesignCard(design, showActions = false) {
    const card = document.createElement('div');
    card.className = 'design-card';

    const statusClass = `status-${design.status}`;
    const statusText = design.status.charAt(0).toUpperCase() + design.status.slice(1);

    card.innerHTML = `
        <div class="design-image">
            ${design.imageUrl ? `<img src="${design.imageUrl}" alt="${design.title}" class="design-thumbnail">`
                               : `<span style="position: relative; z-index: 1;">${getDesignIcon(designs.designType)}</span>`}
            <div class="design-status ${statusClass}">${statusText}</div>
        </div>
        <div class="design-info">
            <h3 class="design-title">${design.title}</h3>
            <span class="design-type">${design.designType.toUpperCase()}</span>
            <div class="design-specs">
                <div class="spec-item"><span class="spec-icon">🛏️</span><span>${design.bedrooms} Bedrooms</span></div>
                <div class="spec-item"><span class="spec-icon">🚿</span><span>${design.bathrooms} Bathrooms</span></div>
                <div class="spec-item"><span class="spec-icon">📐</span><span>${design.area}</span></div>
                <div class="spec-item"><span class="spec-icon">₹</span><span>${design.price}</span></div>
                ${design.status === 'approved' ? `
                    <div class="spec-item"><span class="spec-icon">📈</span><span>${design.sales} Sales</span></div>
                    <div class="spec-item"><span class="spec-icon">⭐</span><span>${design.rating}/5.0</span></div>
                ` : `
                    <div class="spec-item"><span class="spec-icon">📅</span><span>Uploaded: ${new Date(design.uploadDate).toLocaleDateString()}</span></div>
                    <div class="spec-item"><span class="spec-icon">⏳</span><span>Status: ${statusText}</span></div>
                `}
            </div>
            <p style="color: #718096; font-size: 0.9rem; margin-bottom: 15px;">${design.description}</p>
            ${showActions ? `
                <div class="design-actions">
                    <button class="action-btn edit-btn" onclick="editDesign(${design.id})">✏️ Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteDesign(${design.id})">🗑️ Delete</button>
                </div>
            ` : ''}
        </div>
    `;
    return card;
}

// -----------------------
// Edit & Delete
// -----------------------
function editDesign(designId) {
    const design = vendorDesigns.find(d => d.id === designId);
    if (!design) return;

    document.getElementById('title').value = design.title;
    document.getElementById('designType').value = design.designType;
    document.getElementById('price').value = design.price;
    document.getElementById('bedrooms').value = design.bedrooms;
    document.getElementById('bathrooms').value = design.bathrooms;
    document.getElementById('floors').value = design.floors || 1;
    document.getElementById('area').value = design.area.replace(' sq ft', '');
    document.getElementById('description').value = design.description;
    //document.getElementById('imageUrl').value= design.imageUrl;

     // Save current editing id
     document.getElementById('uploadForm').setAttribute('data-edit-id', design.id);

    switchTab('upload');
    showNotification('Design loaded for editing. Make changes and resubmit.', 'success');
}

function deleteDesign(designId) {
    if (confirm('Are you sure you want to delete this design?')) {
         fetch(`/api/designs/delete?id=${designId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // include JWT if needed
                    }
         })
         .then(response => {
                if (response.ok) {
                    // Remove from local array
                    const index = vendorDesigns.findIndex(d => d.id === designId);
                    if (index !== -1) {
                        vendorDesigns.splice(index, 1);
                        filteredDesigns=[...vendorDesigns];
                        renderMyDesigns();
                        renderRecentDesigns();
                        showNotification('🗑️ Design deleted permanently', 'success');
                    }
                } else {
                    showNotification('❌ Failed to delete design', 'error');
                }
         })
         .catch(err => {
                console.error(err);
                showNotification('❌ Error deleting design', 'error');
         });
    }
}

// -----------------------
// Helper Functions
// -----------------------
function getDesignIcon(type) {
    const icons = { HOUSE: '🏠', VILLA: '🏡', APARTMENT: '🏢', FORM_HOUSE: '🏚️', ROW_HOUSE: '🏘️', DUPLEX: '🏰', COMMERCIAL: '🏢' };
    return icons[type] || '🏠';
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => { notification.classList.remove('show');
                       notification.textContent=' ';
                     }, 4000);
}

// -----------------------
// Update Stats
// -----------------------
function updateStats() {
    const approved = vendorDesigns.filter(d => d.status === 'approved').length;
    const pending = vendorDesigns.filter(d => d.status === 'pending').length;
    const totalSales = vendorDesigns.reduce((sum, d) => sum + d.sales, 0);
    const totalEarnings = vendorDesigns.reduce((sum, d) => sum + (d.sales * d.price), 0);
    console.log('Stats updated:', { approved, pending, totalSales, totalEarnings });
}

// -----------------------
// Initialize
// -----------------------
document.addEventListener('DOMContentLoaded', async () => {

    // Get full name from localStorage
    const fullName = localStorage.getItem("fullName") || "Guest";

    // Set the welcome text with full name
    document.getElementById("welcomeUser").textContent = `Welcome, ${fullName}`;

    const uploadForm = document.getElementById("uploadForm");
    if (uploadForm) uploadForm.addEventListener("submit", handleUploadSubmit);

    const fileInput = document.getElementById("imageFile");
    if (fileInput) fileInput.addEventListener("change", handleFileSelect);

    // Optional: attach filters
    const statusFilter = document.getElementById('statusFilter');
    if(statusFilter) statusFilter.addEventListener('change', applyDesignFilters);
    const typeFilter = document.getElementById('typeFilterDesigns');
    if(typeFilter) typeFilter.addEventListener('change', applyDesignFilters);

    renderRecentDesigns();
    //renderMyDesigns();
    await loadMyDesigns();
    updateStats();
});

/// ----- load my designs -----///


async function loadMyDesigns() {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch('/api/designs/fetch', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch designs: ${response.status}`);

        const designs = await response.json();
        console.log("Raw designs from server:", designs);

        // Map backend data with enhanced logging
        vendorDesigns = designs.map(d => {
            console.log(`Processing design ${d.id}:`, {
                title: d.title,
                imageUrl: d.imageUrl,
                imageUrlType: typeof d.imageUrl,
                imageUrlLength: d.imageUrl?.length
            });

            return {
                id: d.id,
                title: d.title,
                description: d.description,
                price: parseFloat(d.price),
                bedrooms: d.bedrooms,
                bathrooms: d.bathrooms,
                floors: d.floors || 1,
                area: d.area + " sq ft",
                designType: d.designType.toUpperCase(),
                status: d.status,
                vendor: d.vendor,
                uploadDate: d.uploadDate || new Date().toISOString().split('T')[0],
                sales: d.sales || 0,
                rating: d.rating || 0,
                imageUrl: d.imageUrl?.trim() || '',
                icon: getDesignIcon(d.designType.toUpperCase())
            };
        });

        filteredDesigns = [...vendorDesigns];
        renderMyDesigns();
        renderRecentDesigns();

        console.log("Processed vendorDesigns:", vendorDesigns);

    } catch (err) {
        console.error("Error loading designs:", err);
        showNotification("Could not load your designs: " + err.message, "error");
    }
}

function debugImageUrl(designId) {
    const design = vendorDesigns.find(d => d.id === designId);
    if (!design) return;

    console.log('=== IMAGE DEBUG INFO ===');
    console.log('Design ID:', design.id);
    console.log('Title:', design.title);
    console.log('Raw imageUrl:', design.imageUrl);
    console.log('Trimmed imageUrl:', design.imageUrl?.trim());
    console.log('imageUrl length:', design.imageUrl?.length);
    console.log('imageUrl type:', typeof design.imageUrl);

    const imageUrl = design.imageUrl?.trim();
    if (imageUrl) {
        // Test if URL is accessible
        const testImg = new Image();
        testImg.onload = () => {
            console.log('✅ Image loads successfully');
            console.log('Image dimensions:', testImg.naturalWidth, 'x', testImg.naturalHeight);
        };
        testImg.onerror = (error) => {
            console.log('❌ Image failed to load');
            console.log('Error:', error);
        };
        testImg.src = imageUrl;

        // Also try opening in new tab
        window.open(imageUrl, '_blank');
    } else {
        console.log('❌ No image URL found');
    }

    showNotification(`Debug info logged to console for ${design.title}`, 'success');
}
