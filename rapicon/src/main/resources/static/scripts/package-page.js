// get area for price calculation
const totalArea= localStorage.getItem('totalArea');
const builtUpArea= localStorage.getItem('builtUpArea');

// ==========================================
    // EDIT PRICES HERE - Change values as needed
    // ==========================================
    const packagesData = [
      {
        id: 'basic',
        name: 'Basic',
        price: 5,  // ← Edit this price
        description: 'A budget package with no compromise on quality that includes all construction essentials',
        highlights: [
          'Trusted brand steel & cement',
          'Standard floor tiles upto ₹50/sqft',
          'Standard flush doors and window finish',
          'Tractor Emulsion finish',
          'Essential kitchen & bathroom fittings'
        ],
        isPopular: false
      },
      {
        id: 'classic',
        name: 'Classic',
        price: 25,  // ← Edit this price
        description: 'Our best seller package with upgraded brands like Jindal Steels, Hindware etc at a considerable price',
        highlights: [
          'Superior brand steel & cement',
          'Refined floor tiles upto ₹100/sqft',
          'Elegant teak doors and window finish',
          'Tractor Shyne Emulsion finish',
          'Stylish kitchen & bathroom fittings'
        ],
        isPopular: true  // This package shows "POPULAR" badge
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 1499,  // ← Edit this price
        description: 'An elegant package crafted for modern living with extra provisions like solar heater setup, puja room door etc',
        highlights: [
          'Superior Brand steel & cement',
          'Premium floor tiles upto ₹140/sqft',
          'Designer teak doors and window finish',
          'Apcolite Premium finish',
          'Quality kitchen & bathroom fittings'
        ],
        isPopular: false
      },
      {
        id: 'royale',
        name: 'Royale',
        price: 2199,  // ← Edit this price
        description: 'An ultimate plan with high-end finishes with amenities like EV charging, copper gas connection etc',
        highlights: [
          'Superior brand steel & cement',
          'Lavish floor tiles upto ₹160/sqft',
          'Designer teak doors and window finish',
          'Apex Ultima Exterior finish',
          'Lavish Fittings for kitchen & bathroom'
        ],
        isPopular: false
      }
    ];
    // ==========================================
    // END OF EDITABLE SECTION
    // ==========================================

    // Function to render packages
    function renderPackages() {
      const grid = document.getElementById('packagesGrid');
      grid.innerHTML = '';

      packagesData.forEach(pkg => {
        const card = document.createElement('div');
        card.className = `package-card ${pkg.isPopular ? 'popular' : ''}`;

        const highlightsHTML = pkg.highlights.map(h =>
          `<div class="highlight-item">${h}</div>`
        ).join('');

        card.innerHTML = `
          ${pkg.isPopular ? '<div class="package-badge">POPULAR</div>' : ''}

          <div class="package-header">
            <div class="package-name">${pkg.name}</div>
            <div class="package-price">₹${pkg.price}</div>
            <div class="package-unit">per sqft</div>
          </div>

          <div class="package-description">
            ${pkg.description}
          </div>

          <div class="package-highlights">
            <div class="highlights-title">Highlights</div>
            ${highlightsHTML}
          </div>

          <div class="package-footer">
            <button class="btn btn-buy" onclick="handleBuy('${pkg.name}', '${pkg.price}')">Buy Now</button>
          </div>
        `;

        grid.appendChild(card);
      });
    }

    function handleBuy(packageName, packagePrice) {
      //alert(`Proceeding to purchase ${packageName} package. You'll be redirected to the booking form.`);
        packagePrice*= builtUpArea;
      // Uncomment below to redirect to a booking page with package info
      window.location.href = 'addtocard.html?price='+packagePrice;
    }

    // Initialize page
    document.addEventListener('DOMContentLoaded', renderPackages);