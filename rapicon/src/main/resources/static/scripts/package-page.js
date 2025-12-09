// get area for price calculation
const totalArea= sessionStorage.getItem('totalArea');
const builtUpArea= sessionStorage.getItem('builtUpArea');

// ==========================================
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
            <button class="btn btn-learn" onclick= "addToCart('${pkg.name}', '${pkg.price}')">Add To Cart</button>
          </div>
        `;

        grid.appendChild(card);
      });
    }

    async function addToCart(pkgName, pkgPrice) {
        const design = JSON.parse(sessionStorage.getItem('selectedDesign') || '{}');
        const userId = localStorage.getItem('user_id');
        const totalAmount= pkgPrice * totalArea;


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
        console.log("Data:", data);
        try {
          const response = await fetch("/api/cart/addItem", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('user_token')}` // if JWT is used
            },
            body: JSON.stringify(data)
          });

          if (response.ok) {
            showNotification("✅ Design added successfully!", 'success');
            setTimeout(() => {
                //window.location.href = '/addtocard.html';
              }, 1500);
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
      //alert(`Proceeding to purchase ${packageName} package. You'll be redirected to the booking form.`);
       packagePrice*= builtUpArea;
       sessionStorage.setItem('selectedPackage', packageName);
       window.location.href = '/addtocard.html';
       /*if(packageName==='Basic'){
          window.location.href = 'addtocard.html?price='+packagePrice;
       }else{
          window.location.href= 'installment-payment.html?price='+packagePrice;
       }*/
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        Object.assign(notification.style, {
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: type === 'success' ? '#4caf50' : '#f44336',
          color: 'white',
          padding: '12px 18px',
          borderRadius: '8px',
          fontSize: '16px',
          zIndex: 9999,
          transition: 'opacity 0.5s ease',
          opacity: '1'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 500);
        }, 2000);
    }

    // Initialize page
    document.addEventListener('DOMContentLoaded', renderPackages);