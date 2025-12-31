
let allDesigns = [];
let filteredDesigns = [];

// DOM elements - declare but don't initialize yet
let searchInput;
let typeFilter;
let priceFilter;
let plotSizeFilter;
let floorFilter;
let designsGrid;
let modal;
let closeModal;
let purchaseForm;
let loginHeading;
let accountHeading;
let accountMenu;
let accountToggle;
let logoutBtn;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {

  //   INIT DOM ELEMENTS

  searchInput = document.getElementById('searchInput');
  typeFilter = document.getElementById('typeFilter');
  priceFilter = document.getElementById('priceFilter');
  plotSizeFilter = document.getElementById('plotSizeFilter');
  floorFilter = document.getElementById('floorFilter');
  designsGrid = document.getElementById('designsGrid');
  modal = document.getElementById('purchaseModal');
  closeModal = document.querySelector('.close');
  purchaseForm = document.getElementById('purchaseForm');
  userIcon = document.getElementById("userIconBtn");

  loginHeading = document.getElementById("loginHeading");
  accountHeading = document.getElementById("accountHeading");
  accountMenu = document.getElementById("accountMenu");
  accountToggle = document.getElementById("accountToggle");
  logoutBtn = document.getElementById("logoutBtn");


  // AUTH UI
  updateAuthUI();

  //   ACCOUNT DROPDOWN

  if (accountToggle && accountMenu) {
    accountToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = accountMenu.style.display === "block";
      accountMenu.style.display = isOpen ? "none" : "block";
      accountToggle.classList.toggle("open", !isOpen);
    });

    accountMenu.addEventListener("click", (e) => e.stopPropagation());
  }

  document.addEventListener("click", () => {
    if (accountMenu) accountMenu.style.display = "none";
  });

  openLogout(logoutBtn);

  //   LOGIN MODAL LOGIC (MERGED)

  if (!localStorage.getItem('user_token')) {
    requestAnimationFrame(() => {
      openLoginModal();
    });
  }


  const loginCloseBtn = document.querySelector('#loginModal .close');
  if (loginCloseBtn) {
    loginCloseBtn.addEventListener('click', closeLoginModal);
  }

  window.addEventListener("click", (e) => {
    const loginModal = document.getElementById("loginModal");
    if (e.target === loginModal) {
      closeLoginModal();
    }
  });

  //   PAGE DATA + EVENTS

  renderDesigns();
  setupEventListeners();

});



function setupEventListeners() {
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    if (plotSizeFilter) plotSizeFilter.addEventListener('change', applyFilters);
    if (floorFilter) floorFilter.addEventListener('change', applyFilters);

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    if (purchaseForm) {
        purchaseForm.addEventListener('submit', handlePurchase);
    }
}


async function renderDesigns() {
    designsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #718096;">
            <div style="font-size: 3rem; margin-bottom: 20px;">⏳</div>
            <h3>Loading designs...</h3>
        </div>
    `;

    try {
        const token = localStorage.getItem('user_token');

        const response = await fetch('/api/user/approved', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            allDesigns = await response.json();

            if (allDesigns.length === 0) {
                designsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #718096;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">📭</div>
                        <h3>No Approved Designs</h3>
                        <p>There are no approved designs available at the moment.</p>
                    </div>
                `;
                return;
            }

            // Apply filters after fetching data
            applyFilters();
        } else if (response.status === 401) {
            showMessage.warning('Session expired. Please login again.', 'error');
            setTimeout(() => {
                localStorage.clear();
                window.location.href = '/otp-login.html';
            }, 2000);
        } else {
            throw new Error('Failed to fetch designs');
        }
    } catch (error) {
        console.error('Error fetching designs:', error);
        designsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #718096;">
                <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
                <h3>Error Loading Designs</h3>
                <p>Unable to load designs. Please try again later.</p>
                <button onclick="renderDesigns()" style="margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
        showMessage.error('Error loading designs. Please try again.', 'error');
    }
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedPrice = priceFilter.value;
    const selectedPlotSize = plotSizeFilter.value;
    const selectedFloors = floorFilter.value;

    // Filter from allDesigns
    filteredDesigns = allDesigns.filter(design => {
        const matchesSearch = (design.designCategory || '').toLowerCase().includes(searchTerm) ||
                            (design.designType || '').toLowerCase().includes(searchTerm);
        const matchesType = !selectedType || (design.designCategory.toLowerCase()) === selectedType;

        // Plot size filter
        const plotSize = design.length + "X" + design.width;
        const matchesPlotSize = !selectedPlotSize || plotSize === selectedPlotSize;

        // Number of floors filter
        let matchesFloors = true;
        if (selectedFloors) {
            const numFloors = design.floorList ? design.floorList.length : 0;
            if (selectedFloors === '4') {
                matchesFloors = numFloors >= 4;
            } else {
                matchesFloors = numFloors.toString() === selectedFloors;
            }
        }

        let matchesPrice = true;
        if (selectedPrice) {
            const [min, max] = selectedPrice.split('-');
            if (max === undefined) { // "15000+" case
                matchesPrice = design.builtUpArea*5 >= parseInt(min);
            } else {
                matchesPrice = design.builtUpArea*5 >= parseInt(min) && design.builtUpArea*5 <= parseInt(max);
            }
        }

        return matchesSearch && matchesType && matchesPlotSize && matchesFloors && matchesPrice;
    });

    // Render the filtered designs
    displayFilteredDesigns();
}

function displayFilteredDesigns() {
    designsGrid.innerHTML = '';

    if (filteredDesigns.length === 0) {
        designsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #718096;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
                <h3>No designs found</h3>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }

    filteredDesigns.forEach(design => {
        const designCard = createDesignCard(design);
        designsGrid.appendChild(designCard);
    });
}

function createDesignCard(design) {
    const card = document.createElement('div');
    card.className = 'design-card';

    // initialize
    let totalBathrooms = 0;
    let totalBedrooms = 0;
    let totalFloors = 0;
    let totalBusinessUnits=0;


    design.floorList.forEach(floor => {
        totalBedrooms += parseInt(floor.bedrooms || "0") || 0;
        totalBathrooms += parseInt(floor.bathrooms || "0") || 0;
        totalBusinessUnits += parseInt(floor.businessUnits || "0") || 0;
    });

    const category = (design.designType || "").toUpperCase();
    const isCommercial = category === "COMMERCIAL";
    const isResidential = category === "RESIDENTIAL" || category === "SEMI-COMMERCIAL";

    let specsHTML = `
        <div class="spec-item">
            <span class="spec-icon">📐</span>
            <span>${design.totalArea} sq ft</span>
        </div>
        <div class="spec-item">
            <span class="spec-icon">⭐</span>
            <span>${design.rating || '4.5'}/5.0</span>
        </div>
        <div class="spec-item">
            <span class="spec-icon">🏢</span>
            <span>${design.floorList.length} Floor</span>
        </div>
        <div class="spec-item">
            <span class="spec-icon">📏</span>
            <span>${design.length} X ${design.width} Plot size</span>
        </div>
    `;

    if(isResidential) {
        specsHTML = `
            <div class="spec-item">
                <span class="spec-icon">🛏️</span>
                <span>${totalBedrooms} Bedrooms</span>
            </div>
            <div class="spec-item">
                <span class="spec-icon">🚿</span>
                <span>${totalBathrooms} Bathrooms</span>
            </div>
        ` + specsHTML;
    }

    if(isCommercial) {
        specsHTML = `
            <div class="spec-item">
                <span class="spec-icon">🏬</span>
                <span>${totalBusinessUnits || 0} Business Units</span>
            </div>
            <div class="spec-item">
                <span class="spec-icon">🧭</span>
                <span>${design.plotFacing} Plot Facing</span>
            </div>
        ` + specsHTML;
    }


    card.innerHTML = `
        <div class="design-image">
            ${design.elevationUrls[0] ? `<img src="${design.elevationUrls[0]}" alt="${design.title || design.name}" class="design-thumbnail">`
                              : `<span style="position: relative; z-index: 1;">${getDesignIcon(design.designType || design.type)}</span>`}
        </div>
        <div class="design-info">
            <h3 class="design-title">${design.designCategory || design.designType}</h3>
            <span class="design-type">${(design.designType).toUpperCase()}</span>
            <div class="design-specs">
                ${specsHTML}
            </div>
            <div class="card-footer">
                <div>
                    <div class="price-label">Starting from</div>
                    <div class="price">₹${design.builtUpArea * 5}</div>
                </div>
                <button class="purchase-btn" data-design-id="${design.id}">
                    Purchase Now
                </button>
            </div>
        </div>
    `;

    // ===============================
    //  AUTO IMAGE SCROLL ON HOVER
    // ===============================
    const imageContainer = card.querySelector('.design-image');
    const imgElement = card.querySelector('.design-thumbnail');

    if (imgElement && design.elevationUrls && design.elevationUrls.length > 1) {
        let currentIndex = 0;
        let hoverInterval = null;

        function changeImage(index) {
            // preload image first
            const tempImg = new Image();
            tempImg.src = design.elevationUrls[index];

            tempImg.onload = () => {
                imgElement.style.opacity = 0;

                requestAnimationFrame(() => {
                    imgElement.src = tempImg.src;
                    imgElement.style.opacity = 1;
                });
            };
        }

        function startHoverScroll() {
            if (hoverInterval) return; // prevent multiple intervals
            hoverInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % design.elevationUrls.length;
                changeImage(currentIndex);
            }, 1500);
        }

        function stopHoverScroll() {
            clearInterval(hoverInterval);
            hoverInterval = null;
            currentIndex = 0;
            changeImage(0); // reset to first image
        }

        imageContainer.addEventListener('mouseenter', startHoverScroll);
        imageContainer.addEventListener('mouseleave', stopHoverScroll);
    }


    // Add event listener to the purchase button
    const purchaseBtn = card.querySelector('.purchase-btn');
    purchaseBtn.addEventListener('click', () => openPurchaseModal(design.id));

    return card;
}

function openPurchaseModal(designId) {
    // Check if user is logged in
    const token = localStorage.getItem('user_token');

    if (!token || isTokenExpired(token)) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_fullName');
        showMessage.warning('Session expired Please login to view design details', 'error');
        setTimeout(() => {
            window.location.href = '/otp-login.html';
        }, 1500);
        return;
    }

    // Look for design in allDesigns
    let design = allDesigns.find(d => d.id === designId);

    if (design) {
        // Calculate totals for this design
        let designBedrooms = 0;
        let designBathrooms = 0;
        let designKitchens = 0;
        let designHall = 0;
        let description="";
        let businessUnits=0;

        design.floorList.forEach(floor => {
            designBedrooms += parseInt(floor.bedrooms);
            designBathrooms += parseInt(floor.bathrooms);
            designHall += parseInt(floor.hall);
            designKitchens += parseInt(floor.kitchen);
            description += floor.name.toUpperCase()+": "+ floor.other+". ";
            businessUnits += parseInt(floor.businessUnits);
        });

        // Store design in sessionStorage for the detail page
        sessionStorage.setItem('selectedDesign', JSON.stringify({
            id: design.id,
            category: design.designCategory,
            type: design.designType || design.type,
            plotLocation: design.plotLocation || 'Not specified',
            plotFacing: design.plotFacing || 'Not specified',
            bedrooms: designBathrooms,
            bathrooms: designBedrooms,
            kitchens: designKitchens || 0,
            hall: designHall,
            parking: design.parking || 0,
            plotSize: design.length + "X" + design.width || '1500 sq.ft',
            totalArea: design.totalArea || 'N/A sq.ft',
            builtUpArea: design.builtUpArea || 'N/A sq.ft',
            price: design.builtUpArea * 5,
            elevationUrls: design.elevationUrls,
            twoDPlanUrls: design.twoDPlanUrls,
            businessUnits: businessUnits,
            floors: design.floorList || '0',
            rating: design.rating || 4.5,
            reviews: design.reviews || 0,
            image: design.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
            description: description || 'Beautiful architectural design.',
            features: design.features || [
                { icon: '🌞', text: 'Natural Lighting' },
                { icon: '🌿', text: 'Green Spaces' },
                { icon: '🔒', text: 'Security System' },
                { icon: '💡', text: 'Smart Home Ready' }
            ]
        }));

        // Redirect to design info page
        window.location.href = 'designinfo.html?id=' + designId;
    } else {
        showMassage.warning('Design not found', 'error');
    }
}

async function handlePurchase(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const designId = modal.dataset.designId;

    const purchaseData = {
        designId: designId,
        designName: document.getElementById('modalDesignName')?.value || '',
        price: document.getElementById('modalPrice')?.value || '',
        customerName: document.getElementById('customerName')?.value || '',
        customerEmail: document.getElementById('customerEmail')?.value || '',
        customerPhone: document.getElementById('customerPhone')?.value || '',
        projectLocation: document.getElementById('projectLocation')?.value || '',
        paymentMethod: document.getElementById('paymentMethod')?.value || '',
        specialRequirements: document.getElementById('specialRequirements')?.value || ''
    };

    try {
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        const token = localStorage.getItem('user_token');
        const response = await fetch("/api/orders/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(purchaseData)
        });

        const result = await response.json();
        if (response.ok) {
            showMassage.success('Order created successfully! Our team will contact you within 24 hours.', 'success');
            modal.style.display = 'none';
            purchaseForm.reset();
        } else {
            showNotification('Error creating order. Please try again.', 'error');
        }

        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

    } catch (error) {
        showMessage.error('Error processing order. Please try again.', 'error');

        // Reset button
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Purchase Now';
        submitBtn.disabled = false;
    }
}

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

function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (!modal) return;
  modal.style.display = "block";
  modal.style.pointerEvents = "auto";
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (!modal) return;
  modal.style.display = "none";
  modal.style.pointerEvents = "none";
}


document.getElementById("goLogin").addEventListener("click", () => {
  window.location.href = "/otp-login.html";
});

async function openLogout(logoutBtn) {
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const result = await showMessage.confirm(
      'Are you sure you want to logout?'
    );

    if (!result) return;

    const token = localStorage.getItem('user_token');

    try {
      await fetch('/api/auth/logout-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.warn('Logout API failed:', err);
    }

    localStorage.clear();
    sessionStorage.clear();

    window.location.href = "/";
  });
}

function openCart() {
    const token = localStorage.getItem('user_token');

    // No token or expired token
    if (!token || isTokenExpired(token)) {
        localStorage.clear(); // optional but recommended
        showMessage.alert("Session expired. Please login first.");
        return;
    }

    // Token valid
    window.location.href = "addtocard.html";
}


function updateAuthUI() {
  const token = localStorage.getItem('user_token');

  if (token && !isTokenExpired(token)) {
    loginHeading.style.display = "none";
    accountHeading.style.display = "block";
  } else {
    loginHeading.style.display = "block";
    accountHeading.style.display = "none";
  }
}
