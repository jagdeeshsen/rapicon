// get area for price calculation
const totalArea = sessionStorage.getItem('totalArea');
const builtUpArea = sessionStorage.getItem('builtUpArea');

// EDIT PRICES HERE - Change values as needed
    // ==========================================
    const packagesData = [
      {
        id: '1',
        name: 'Basic',
        price: 5,  // ← Edit this price
        description: 'A budget-friendly package that delivers all essential construction drawings and quality design without any compromise.',
        highlights: [
          'Complete 2D Architectural Floor Plan',
          'Full Structural, Electrical & Plumbing Drawings',
          'Furniture Layout & Interior Planning',
          'Realistic Front Elevation + VR Walkthrough Video',
          'Door & Window Schedule Drawings'
        ],
        isPopular: false
      },
      {
        id: '2',
        name: 'Classic',
        price: 25,  // ← Edit this price
        description: 'A classic package with 2D + 3D designs, unlimited customizations, and VR walkthrough for a complete planning experience.',
        highlights: [
          'Complete 2D+3D Architectural Floor Plan',
          'Full Structural, Electrical & Plumbing Drawings',
          'Full 3D Interior Working Drawings',
          'Unlimited Customization and Virtual Reality Visits',
          'Detailed Door & Window Schedule Drawings'
        ],
        isPopular: true  // This package shows "POPULAR" badge
      },
      {
        id: '3',
        name: 'Premium',
        price: 1830,  // ← Edit this price
        description: 'An elegant package crafted for modern living with extra provisions like solar heater setup, puja room door etc',
        highlights: [
          'Superior Brand steel & cement',
          'Premium floor tiles upto ₹140/sqft',
          'Designer teak doors and window finish',
          'Apcolite Premium finish',
          'Quality kitchen & bathroom fittings',
          'Unlimited Customization and Virtual Reality Visits'
        ],
        isPopular: false
      },
      {
        id: '4',
        name: 'Royale',
        price: 2100,  // ← Edit this price
        description: 'An ultimate plan with high-end finishes with amenities like EV charging, copper gas connection etc',
        highlights: [
          'Superior brand steel & cement',
          'Lavish floor tiles upto ₹140/sqft',
          'Designer teak doors and window finish',
          'Apex Ultima Exterior finish',
          'Lavish Fittings for kitchen & bathroom',
          'Unlimited Customization and Virtual Reality Visits'
        ],
        isPopular: false
      }
    ];
    // ==========================================
    // END OF EDITABLE SECTION
    // ==========================================

let packages = [];

async function loadPackages() {
  try {
    const token = localStorage.getItem('user_token');
    const response = await fetch("/api/v1/packages", {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        rcLogout("otp-login.html");
        return;
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    //packages = data;
    renderPackages()

  } catch (error) {
    console.error("Failed to load data:", error);
    // Show an inline error state instead of a blank page
  }
}

// Function to render packages
function renderPackages() {
  const grid = document.getElementById('packagesGrid');
  grid.innerHTML = '';

  packagesData.forEach(pkg => {
    const card = document.createElement('div');
    card.className = `rc-pkg-card ${pkg.isPopular ? 'popular' : ''}`;

    const highlightsHTML = pkg.highlights.map(h =>
      `<div class="rc-pkg-highlight-item">${h}</div>`
    ).join('');

    card.innerHTML = `
      ${pkg.isPopular ? '<div class="rc-pkg-badge">POPULAR</div>' : ''}

      <div class="rc-pkg-header">
        <div class="rc-pkg-name">${pkg.name}</div>
        <div class="rc-pkg-price">₹${pkg.price}</div>
        <div class="rc-pkg-unit">per sqft</div>
      </div>

      <div class="rc-pkg-desc">
        ${pkg.description}
      </div>

      <div class="rc-pkg-highlights">
        <div class="rc-pkg-highlights-title">Highlights</div>
        ${highlightsHTML}
      </div>

      <div class="rc-pkg-footer">
        <button class="btn-gold" onclick="handleBuy('${pkg.name}', '${pkg.price}')">Buy Now</button>
        <button class="btn-outline-ink" onclick="addToCart('${pkg.name}', '${pkg.price}')">Add To Cart</button>
      </div>
    `;

    grid.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

async function addToCart(pkgName, pkgPrice) {
    const design = JSON.parse(sessionStorage.getItem('selectedDesign') || '{}');
    const userId = rcGetUserId();
    const totalAmount = pkgPrice * totalArea;

    if (!userId) {
      alert('Please log in to save your design.');
      return;
    }

    if (!design.id) {
      alert('Design information not found. Please select a design first.');
      return;
    }

    // Prepare data for backend
    const data = {
      userId: userId,
      design: design,
      added_at: new Date().toISOString(),
      totalAmount: totalAmount,
      packageName: pkgName,
      totalInstallments: 10
    };

    try {
      const token = localStorage.getItem('user_token');
      const response = await fetch("/api/cart/addItem", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showNotification("Design added successfully!", 'success');
        window.location.href = '/cart.html';
      } else if (response.status === 401) {
        alert('Session expired. Please log in again.');
      } else {
        const err = await response.text();
        console.error('Failed to add to cart:', err);
        alert('Error saving design.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Something went wrong. Please try again later.');
    }
}

function handleBuy(packageName, packagePrice) {
   packagePrice *= builtUpArea;
   sessionStorage.setItem('selectedPackage', packageName);
   sessionStorage.setItem('selectedPackageTotal', packagePrice); // FIXED: was computed and discarded
   window.location.href = '/cart.html';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `rc-notification ${type}`;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadPackages();
});