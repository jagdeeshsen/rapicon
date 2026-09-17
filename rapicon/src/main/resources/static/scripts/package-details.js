// get area for price calculation
const totalArea = sessionStorage.getItem('totalArea');
const builtUpArea = sessionStorage.getItem('builtUpArea');
const token = rcGetToken();

let packages = [];

// Defines the display order for packages by name
const PACKAGE_ORDER = ['Basic', 'Classic', 'Premium', 'Royale'];

function sortPackages(pkgList) {
  return [...pkgList].sort((a, b) => {
    const indexA = PACKAGE_ORDER.indexOf(a.name);
    const indexB = PACKAGE_ORDER.indexOf(b.name);

    // Unknown names (not in PACKAGE_ORDER) are pushed to the end
    const safeIndexA = indexA === -1 ? PACKAGE_ORDER.length : indexA;
    const safeIndexB = indexB === -1 ? PACKAGE_ORDER.length : indexB;

    return safeIndexA - safeIndexB;
  });
}

async function loadPackages() {
  try {
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
    packages = sortPackages(data);
    renderPackages();

  } catch (error) {
    console.error("Failed to load data:", error);
    // Show an inline error state instead of a blank page
  }
}

// Function to render packages
function renderPackages() {
  const grid = document.getElementById('packagesGrid');
  grid.innerHTML = '';

  packages.forEach(pkg => {
    const card = document.createElement('div');
    card.className = `rc-pkg-card ${pkg.isPopular ? 'popular' : ''}`;

    const highlightsHTML = pkg.highlights.map(h =>
      `<div class="rc-pkg-highlight-item">${h}</div>`
    ).join('');

    card.innerHTML = `
      ${pkg.isPopular ? '<div class="rc-pkg-badge">POPULAR</div>' : ''}

      <div class="rc-pkg-header">
        <div class="rc-pkg-name">${pkg.name}</div>
        <div class="rc-pkg-price">₹${pkg.packageAmount}</div>
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
        <button class="btn-gold" onclick="handleBuy('${pkg.name}', '${pkg.packageAmount}', '${pkg.noOfInstallments}')">Buy Now</button>
        <button class="btn-outline-ink" onclick="addToCart('${pkg.name}', '${pkg.packageAmount}', '${pkg.noOfInstallments}')">Add To Cart</button>
      </div>
    `;

    grid.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

async function addToCart(pkgName, pkgPrice, pkgInstallments) {
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
      totalInstallments: pkgInstallments
    };

    try {
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