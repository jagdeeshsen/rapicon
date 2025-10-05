  // Sample design data
  const designs = [
      {
          id: 1,
          name: "Modern Villa Paradise",
          type: "villa",
          price: 1850,
          bedrooms: 4,
          bathrooms: 3,
          area: "3200 sq ft",
          rating: 4.9,
          description: "Luxurious modern villa with contemporary design, perfect for large families.",
          icon: "🏡"
      },
      {
          id: 2,
          name: "Cozy Farmhouse Retreat",
          type: "farmhouse",
          price: 1200,
          bedrooms: 3,
          bathrooms: 2,
          area: "2400 sq ft",
          rating: 4.7,
          description: "Rustic farmhouse design with modern amenities and spacious interiors.",
          icon: "🏚️"
      },
      {
          id: 3,
          name: "Urban Apartment Complex",
          type: "apartment",
          price: 680,
          bedrooms: 2,
          bathrooms: 2,
          area: "1200 sq ft",
          rating: 4.5,
          description: "Efficient apartment design optimized for urban living and space utilization.",
          icon: "🏢"
      },
      {
          id: 4,
          name: "Classic Family House",
          type: "house",
          price: 950,
          bedrooms: 3,
          bathrooms: 2,
          area: "1800 sq ft",
          rating: 4.6,
          description: "Traditional family house with classic architecture and functional layout.",
          icon: "🏠"
      },
      {
          id: 5,
          name: "Elegant Row House",
          type: "rowhouse",
          price: 1400,
          bedrooms: 3,
          bathrooms: 3,
          area: "2000 sq ft",
          rating: 4.8,
          description: "Sophisticated row house design with optimal space utilization and modern features.",
          icon: "🏘️"
      },
      {
          id: 6,
          name: "Luxury Duplex Estate",
          type: "duplex",
          price: 2200,
          bedrooms: 4,
          bathrooms: 4,
          area: "3800 sq ft",
          rating: 5.0,
          description: "Premium duplex with luxury finishes and spacious living areas.",
          icon: "🏰"
      },
      {
          id: 7,
          name: "Minimalist Modern House",
          type: "house",
          price: 1100,
          bedrooms: 2,
          bathrooms: 2,
          area: "1600 sq ft",
          rating: 4.4,
          description: "Clean, minimalist design with focus on natural light and open spaces.",
          icon: "🏠"
      },
      {
          id: 8,
          name: "Beachside Villa",
          type: "villa",
          price: 2800,
          bedrooms: 5,
          bathrooms: 4,
          area: "4200 sq ft",
          rating: 4.9,
          description: "Stunning beachside villa with panoramic views and luxury amenities.",
          icon: "🏖️"
      }
  ];

  let filteredDesigns = [...designs];
  let approvedDesigns = [];

  // DOM elements
  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const priceFilter = document.getElementById('priceFilter');
  const bedroomFilter = document.getElementById('bedroomFilter');
  const sortFilter = document.getElementById('sortFilter');
  const designsGrid = document.getElementById('designsGrid');
  const modal = document.getElementById('purchaseModal');
  const closeModal = document.querySelector('.close');
  const purchaseForm = document.getElementById('purchaseForm');

  // Initialize dashboard
  document.addEventListener('DOMContentLoaded', function() {
      // Get full name from localStorage
      const fullName = localStorage.getItem("fullName") || "Guest";

      // Set the welcome text with full name
      document.getElementById("welcomeUser").textContent = `Welcome, ${fullName}`;
      renderDesigns();
      setupEventListeners();
  });

  function setupEventListeners() {
      searchInput.addEventListener('input', applyFilters);
      typeFilter.addEventListener('change', applyFilters);
      priceFilter.addEventListener('change', applyFilters);
      bedroomFilter.addEventListener('change', applyFilters);
      sortFilter.addEventListener('change', applyFilters);

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

  function applyFilters() {
      const searchTerm = searchInput.value.toLowerCase();
      const selectedType = typeFilter.value;
      const selectedPrice = priceFilter.value;
      const selectedBedrooms = bedroomFilter.value;
      const selectedSort = sortFilter.value;

      approvedDesigns = designs.filter(design => {
          const matchesSearch = design.name.toLowerCase().includes(searchTerm) ||
                              design.description.toLowerCase().includes(searchTerm);
          const matchesType = !selectedType || design.type === selectedType;
          const matchesBedrooms = !selectedBedrooms || design.bedrooms.toString() === selectedBedrooms;

          let matchesPrice = true;
          if (selectedPrice) {
              const [min, max] = selectedPrice.split('-');
              if (max === undefined) { // "2000+" case
                  matchesPrice = design.price >= parseInt(min);
              } else {
                  matchesPrice = design.price >= parseInt(min) && design.price <= parseInt(max);
              }
          }

          return matchesSearch && matchesType && matchesBedrooms && matchesPrice;
      });

      // Apply sorting
      approvedDesigns.sort((a, b) => {
          switch (selectedSort) {
              case 'price-low':
                  return a.price - b.price;
              case 'price-high':
                  return b.price - a.price;
              case 'rating':
                  return b.rating - a.rating;
              case 'newest':
              default:
                  return b.id - a.id;
          }
      });

      renderDesigns();
  }

  async function renderDesigns() {
      designsGrid.innerHTML = '';

      try {
          const token = localStorage.getItem('token');
          if (token) {
              const response = await fetch('/api/user/approved', {
                  method: 'GET',
                  headers: {
                      'Authorization': `Bearer ${token}`
                  }
              });

              if (response.ok) {
                  approvedDesigns = await response.json();
              } else {
                  // Fallback to sample data if API fails
                  approvedDesigns = designs;
              }
          } else {
              // Use sample data if no token
              approvedDesigns = designs;
          }
      } catch (error) {
          console.error('Error fetching designs:', error);
          // Fallback to sample data
          approvedDesigns = designs;
      }

      if (approvedDesigns.length === 0) {
          designsGrid.innerHTML = `
              <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #718096;">
                  <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
                  <h3>No designs found</h3>
                  <p>Try adjusting your filters or search terms.</p>
              </div>
          `;
          return;
      }

      approvedDesigns.forEach(design => {
          const designCard = createDesignCard(design);
          designsGrid.appendChild(designCard);
      });
  }

  function createDesignCard(design) {
      const card = document.createElement('div');
      card.className = 'design-card';

      // Fix: Use correct property names and add event listener instead of onclick
      card.innerHTML = `
          <div class="design-image">
              ${design.imageUrl ? `<img src="${design.imageUrl}" alt="${design.title || design.name}" class="design-thumbnail">`
                                : `<span style="position: relative; z-index: 1;">${getDesignIcon(design.designType || design.type)}</span>`}
          </div>
          <div class="design-info">
              <h3 class="design-title">${design.title || design.name}</h3>
              <span class="design-type">${(design.designType || design.type).toUpperCase()}</span>
              <div class="design-specs">
                  <div class="spec-item">
                      <span class="spec-icon">🛏️</span>
                      <span>${design.bedrooms} Bedrooms</span>
                  </div>
                  <div class="spec-item">
                      <span class="spec-icon">🚿</span>
                      <span>${design.bathrooms} Bathrooms</span>
                  </div>
                  <div class="spec-item">
                      <span class="spec-icon">📐</span>
                      <span>${design.area} sq ft</span>
                  </div>
                  <div class="spec-item">
                      <span class="spec-icon">⭐</span>
                      <span>${design.rating || '4.5'}/5.0</span>
                  </div>
              </div>
              <p class="design-description">${design.description}</p>
              <div class="card-footer">
                  <div>
                      <div class="price-label">Starting from</div>
                      <div class="price">₹${design.price} sq ft</div>
                  </div>
                  <button class="purchase-btn" data-design-id="${design.id}">
                      Purchase Now
                  </button>
              </div>
          </div>
      `;

      // Add event listener to the purchase button
      const purchaseBtn = card.querySelector('.purchase-btn');
      purchaseBtn.addEventListener('click', () => openPurchaseModal(design.id));

      return card;
  }

  function openPurchaseModal(designId) {
      console.log('Opening modal for design ID:', designId);

      // Look for design in both approvedDesigns and designs arrays
      let design = approvedDesigns.find(d => d.id === designId);
      if (!design) {
          design = designs.find(d => d.id === designId);
      }

      if (design && modal) {
          // Populate modal fields - handle both property name variations
          const modalDesignName = document.getElementById('modalDesignName');
          const modalPrice = document.getElementById('modalPrice');

          if (modalDesignName) {
              modalDesignName.value = design.title || design.name;
          }
          if (modalPrice) {
              modalPrice.value = `₹${design.price}`;
          }

          // Store design ID for form submission
          modal.dataset.designId = designId;

          // Show modal
          modal.style.display = 'block';
          console.log('Modal should be visible now');
      } else {
          console.error('Design not found or modal element missing:', designId);
          showNotification('Error: Design not found', 'error');
      }
  }

  async function handlePurchase(event) {
      event.preventDefault();
      console.log('Form submitted');

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

      console.log('Purchase Data:', purchaseData);

      try {
          // Show loading state
          const submitBtn = event.target.querySelector('button[type="submit"]');
          const originalText = submitBtn.textContent;
          submitBtn.textContent = 'Processing...';
          submitBtn.disabled = true;

          // Simulate API call (replace with actual API call)
          //const response = await simulateApiCall(purchaseData);
          const token= localStorage.getItem('token');
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
              showNotification('✅ Order created successfully! Our team will contact you within 24 hours.', 'success');
              modal.style.display = 'none';
              purchaseForm.reset();
          } else {
              showNotification('Error creating order. Please try again.', 'error');
          }

          // Reset button
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;

      } catch (error) {
          console.error('Purchase error:', error);
          showNotification('Error processing order. Please try again.', 'error');

          // Reset button
          const submitBtn = event.target.querySelector('button[type="submit"]');
          submitBtn.textContent = 'Purchase Now';
          submitBtn.disabled = false;
      }
  }

  // Simulate API call - replace with actual backend call
 /* async function simulateApiCall(purchaseData) {
      return new Promise((resolve) => {
          setTimeout(() => {
              // Simulate successful response
              resolve({
                  success: true,
                  orderId: Math.random().toString(36).substr(2, 9),
                  message: 'Order created successfully'
              });
          }, 2000);
      });
  }*/

  // Notification function
  function showNotification(message, type = 'success') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
          <div class="notification-content">
              <span class="notification-message">${message}</span>
              <button class="notification-close">&times;</button>
          </div>
      `;

      // Add styles
      notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${type === 'success' ? '#4CAF50' : '#f44336'};
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          max-width: 400px;
          animation: slideInRight 0.3s ease;
      `;

      // Add animation styles
      const style = document.createElement('style');
      style.textContent = `
          @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOutRight {
              from { transform: translateX(0); opacity: 1; }
              to { transform: translateX(100%); opacity: 0; }
          }
          .notification-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
          }
          .notification-close {
              background: none;
              border: none;
              color: white;
              font-size: 20px;
              cursor: pointer;
              margin-left: 15px;
          }
      `;

      if (!document.querySelector('#notification-styles')) {
          style.id = 'notification-styles';
          document.head.appendChild(style);
      }

      // Add to body
      document.body.appendChild(notification);

      // Close functionality
      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => {
          notification.style.animation = 'slideOutRight 0.3s ease';
          setTimeout(() => notification.remove(), 300);
      });

      // Auto remove after 5 seconds
      setTimeout(() => {
          if (notification.parentNode) {
              notification.style.animation = 'slideOutRight 0.3s ease';
              setTimeout(() => notification.remove(), 300);
          }
      }, 5000);
  }

  // Get icon method
  function getDesignIcon(type) {
      const icons = {
          HOUSE: '🏠',
          house: '🏠',
          VILLA: '🏡',
          villa: '🏡',
          APARTMENT: '🏢',
          apartment: '🏢',
          FORM_HOUSE: '🏚️',
          farmhouse: '🏚️',
          ROW_HOUSE: '🏘️',
          rowhouse: '🏘️',
          DUPLEX: '🏰',
          duplex: '🏰',
          COMMERCIAL: '🏢'
      };
      return icons[type] || '🏠';
  }
















  /*const designs = [
      {
          id: 1,
          name: "Modern Villa Paradise",
          type: "villa",
          price: 1850,
          bedrooms: 4,
          bathrooms: 3,
          area: "3200 sq ft",
          rating: 4.9,
          description: "Luxurious modern villa with contemporary design, perfect for large families.",
          icon: "🏡"
      },
      {
          id: 2,
          name: "Cozy Farmhouse Retreat",
          type: "farmhouse",
          price: 1200,
          bedrooms: 3,
          bathrooms: 2,
          area: "2400 sq ft",
          rating: 4.7,
          description: "Rustic farmhouse design with modern amenities and spacious interiors.",
          icon: "🏚️"
      },
      {
          id: 3,
          name: "Urban Apartment Complex",
          type: "apartment",
          price: 680,
          bedrooms: 2,
          bathrooms: 2,
          area: "1200 sq ft",
          rating: 4.5,
          description: "Efficient apartment design optimized for urban living and space utilization.",
          icon: "🏢"
      },
      {
          id: 4,
          name: "Classic Family House",
          type: "house",
          price: 950,
          bedrooms: 3,
          bathrooms: 2,
          area: "1800 sq ft",
          rating: 4.6,
          description: "Traditional family house with classic architecture and functional layout.",
          icon: "🏠"
      },
      {
          id: 5,
          name: "Elegant Row House",
          type: "rowhouse",
          price: 1400,
          bedrooms: 3,
          bathrooms: 3,
          area: "2000 sq ft",
          rating: 4.8,
          description: "Sophisticated row house design with optimal space utilization and modern features.",
          icon: "🏘️"
      },
      {
          id: 6,
          name: "Luxury Duplex Estate",
          type: "duplex",
          price: 2200,
          bedrooms: 4,
          bathrooms: 4,
          area: "3800 sq ft",
          rating: 5.0,
          description: "Premium duplex with luxury finishes and spacious living areas.",
          icon: "🏰"
      },
      {
          id: 7,
          name: "Minimalist Modern House",
          type: "house",
          price: 1100,
          bedrooms: 2,
          bathrooms: 2,
          area: "1600 sq ft",
          rating: 4.4,
          description: "Clean, minimalist design with focus on natural light and open spaces.",
          icon: "🏠"
      },
      {
          id: 8,
          name: "Beachside Villa",
          type: "villa",
          price: 2800,
          bedrooms: 5,
          bathrooms: 4,
          area: "4200 sq ft",
          rating: 4.9,
          description: "Stunning beachside villa with panoramic views and luxury amenities.",
          icon: "🏖️"
      }
  ];

  let filteredDesigns = [...designs];
  let approvedDesigns=[];

  // DOM elements
  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const priceFilter = document.getElementById('priceFilter');
  const bedroomFilter = document.getElementById('bedroomFilter');
  const sortFilter = document.getElementById('sortFilter');
  const designsGrid = document.getElementById('designsGrid');
  const modal = document.getElementById('purchaseModal');
  const closeModal = document.querySelector('.close');
  const purchaseForm = document.getElementById('purchaseForm');

  // Initialize dashboard
  document.addEventListener('DOMContentLoaded', function() {
      renderDesigns();
      setupEventListeners();
  });

  function setupEventListeners() {
      searchInput.addEventListener('input', applyFilters);
      typeFilter.addEventListener('change', applyFilters);
      priceFilter.addEventListener('change', applyFilters);
      bedroomFilter.addEventListener('change', applyFilters);
      sortFilter.addEventListener('change', applyFilters);

      closeModal.addEventListener('click', () => {
          modal.style.display = 'none';
      });

      window.addEventListener('click', (event) => {
          if (event.target === modal) {
              modal.style.display = 'none';
          }
      });

      purchaseForm.addEventListener('submit', handlePurchase);
  }

  function applyFilters() {
      const searchTerm = searchInput.value.toLowerCase();
      const selectedType = typeFilter.value;
      const selectedPrice = priceFilter.value;
      const selectedBedrooms = bedroomFilter.value;
      const selectedSort = sortFilter.value;

      filteredDesigns = designs.filter(design => {
          const matchesSearch = design.name.toLowerCase().includes(searchTerm) ||
                              design.description.toLowerCase().includes(searchTerm);
          const matchesType = !selectedType || design.type === selectedType;
          const matchesBedrooms = !selectedBedrooms || design.bedrooms.toString() === selectedBedrooms;

          let matchesPrice = true;
          if (selectedPrice) {
              const [min, max] = selectedPrice.split('-');
              if (max === undefined) { // "2000+" case
                  matchesPrice = design.price >= parseInt(min);
              } else {
                  matchesPrice = design.price >= parseInt(min) && design.price <= parseInt(max);
              }
          }

          return matchesSearch && matchesType && matchesBedrooms && matchesPrice;
      });

      // Apply sorting
      filteredDesigns.sort((a, b) => {
          switch (selectedSort) {
              case 'price-low':
                  return a.price - b.price;
              case 'price-high':
                  return b.price - a.price;
              case 'rating':
                  return b.rating - a.rating;
              case 'newest':
              default:
                  return b.id - a.id;
          }
      });

      renderDesigns();
  }

  async function renderDesigns() {
      designsGrid.innerHTML = '';

      const token= localStorage.getItem('token');
      const response= await fetch('/api/user/approved',
      {
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${token}`
            }
      });

      approvedDesigns= await response.json();
      if (approvedDesigns.length === 0) {
          designsGrid.innerHTML = `
              <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #718096;">
                  <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
                  <h3>No designs found</h3>
                  <p>Try adjusting your filters or search terms.</p>
              </div>
          `;
          return;
      }

      approvedDesigns.forEach(design => {
          const designCard = createDesignCard(design);
          designsGrid.appendChild(designCard);
      });
  }

  function createDesignCard(design) {
      const card = document.createElement('div');
      card.className = 'design-card';
      card.innerHTML = `
          <div class="design-image">
              ${design.imageUrl ? `<img src="${design.imageUrl}" alt="${design.title}" class="design-thumbnail">`
                                : `<span style="position: relative; z-index: 1;">${getDesignIcon(designs.designType)}</span>`}
          </div>
          <div class="design-info">
              <h3 class="design-title">${design.title}</h3>
              <span class="design-type">${design.designType.toUpperCase()}</span>
              <div class="design-specs">
                  <div class="spec-item">
                      <span class="spec-icon">🛏️</span>
                      <span>${design.bedrooms} Bedrooms</span>
                  </div>
                  <div class="spec-item">
                      <span class="spec-icon">🚿</span>
                      <span>${design.bathrooms} Bathrooms</span>
                  </div>
                  <div class="spec-item">
                      <span class="spec-icon">📐</span>
                      <span>${design.area} sq ft</span>
                  </div>
                  <div class="spec-item">
                      <span class="spec-icon">⭐</span>
                      <span>4.5/5.0</span>
                  </div>
              </div>
              <p class="design-description">${design.description}</p>
              <div class="card-footer">
                  <div>
                      <div class="price-label">Starting from</div>
                      <div class="price">₹${design.price} sq ft</div>
                  </div>
                  <button class="purchase-btn" onclick="openPurchaseModal(${design.id})">
                      Purchase Now
                  </button>
              </div>
          </div>
      `;
      return card;
  }

  function openPurchaseModal(designId) {
      const design = designs.find(d => d.id === designId);
      if (design) {
          document.getElementById('modalDesignName').value = design.name;
          document.getElementById('modalPrice').value = `$${design.price}`;
          modal.style.display = 'block';
      }
  }

  function handlePurchase(event) {
      event.preventDefault();

      const formData = new FormData(event.target);
      const purchaseData = {
          designName: document.getElementById('modalDesignName').value,
          price: document.getElementById('modalPrice').value,
          customerName: document.getElementById('customerName').value,
          customerEmail: document.getElementById('customerEmail').value,
          customerPhone: document.getElementById('customerPhone').value,
          projectLocation: document.getElementById('projectLocation').value,
          paymentMethod: document.getElementById('paymentMethod').value,
          specialRequirements: document.getElementById('specialRequirements').value
      };

      // Simulate API call
      console.log('Purchase Data:', purchaseData);

      // Here you would typically send the data to your Spring Boot backend
      // fetch('/api/purchases', {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(purchaseData)
      // })

      alert('🎉 Purchase successful! You will receive design files via email within 24 hours.');
      modal.style.display = 'none';
      purchaseForm.reset();
  }

   // get icon method
    function getDesignIcon(type) {
         const icons = { HOUSE: '🏠', VILLA: '🏡', APARTMENT: '🏢', FORM_HOUSE: '🏚️', ROW_HOUSE: '🏘️', DUPLEX: '🏰', COMMERCIAL: '🏢' };
         return icons[type] || '🏠';
     }*/