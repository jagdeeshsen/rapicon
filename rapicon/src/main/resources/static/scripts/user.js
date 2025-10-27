
/// redirect to user profile
 const userIcon = document.getElementById("userIconBtn");

  userIcon.addEventListener("click", function() {
      // Redirect to profile page
       const token = localStorage.getItem('token');

       if (!token) {
           showNotification('Please login to view profile', 'error');
           setTimeout(() => {
               window.location.href = 'login.html';
           }, 1500);
           return;
       }
      window.location.href = "/userprofile.html"; // change to your profile URL
  });


 let allDesigns = [];
 let filteredDesigns = [];

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
     // Check if user is logged in
     const token = localStorage.getItem('token');
     const fullName = localStorage.getItem("fullName");

     // User is logged in
      document.getElementById("welcomeUser").textContent =fullName ? `Welcome, ${fullName}` : "Welcome, Guest";
      // Fetch designs from server
      renderDesigns();

    /* if (token && fullName) {
         // User is logged in
         document.getElementById("welcomeUser").textContent = `Welcome, ${fullName}`;
         // Fetch designs from server
         renderDesigns();
     } else {
         // Guest user - must login to see designs
         document.getElementById("welcomeUser").textContent = `Welcome, Guest`;
         showNotification('Please login to view designs', 'info');

         // Show empty state
         designsGrid.innerHTML = `
             <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #718096;">
                 <div style="font-size: 4rem; margin-bottom: 20px;">🔐</div>
                 <h3>Login Required</h3>
                 <p>Please login to view and purchase architectural designs.</p>
                 <button onclick="window.location.href='login.html'" style="margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                     Go to Login
                 </button>
             </div>
         `;
     }*/

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

 async function renderDesigns() {
     designsGrid.innerHTML = `
         <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #718096;">
             <div style="font-size: 3rem; margin-bottom: 20px;">⏳</div>
             <h3>Loading designs...</h3>
         </div>
     `;

     try {
         const token = localStorage.getItem('token');

         /*if (!token) {
             designsGrid.innerHTML = `
                 <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #718096;">
                     <div style="font-size: 4rem; margin-bottom: 20px;">🔐</div>
                     <h3>Login Required</h3>
                     <p>Please login to view designs.</p>
                 </div>
             `;
             return;
         }*/

         const response = await fetch('/api/user/approved', {
             method: 'GET',
             headers: {
                 'Authorization': `Bearer ${token}`
             }
         });

         if (response.ok) {
             allDesigns = await response.json();
             console.log('Fetched designs from server:', allDesigns);

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
             showNotification('Session expired. Please login again.', 'error');
             setTimeout(() => {
                 localStorage.clear();
                 window.location.href = 'login.html';
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
         showNotification('Error loading designs. Please try again.', 'error');
     }
 }

 function applyFilters() {
     const searchTerm = searchInput.value.toLowerCase();
     const selectedType = typeFilter.value;
     const selectedPrice = priceFilter.value;
     const selectedBedrooms = bedroomFilter.value;
     const selectedSort = sortFilter.value;

     // Filter from allDesigns
     filteredDesigns = allDesigns.filter(design => {
         const matchesSearch = (design.title || design.name || '').toLowerCase().includes(searchTerm) ||
                             (design.description || '').toLowerCase().includes(searchTerm);
         const matchesType = !selectedType || (design.designType || design.type) === selectedType;
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
                 return (b.rating || 4.5) - (a.rating || 4.5);
             case 'newest':
             default:
                 return b.id - a.id;
         }
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
                     <div class="price">₹${design.price}</div>
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
     // Check if user is logged in
     const token = localStorage.getItem('token');

     if (!token) {
         showNotification('Please login to view design details', 'error');
         setTimeout(() => {
             //window.location.href = 'login.html';
         }, 1500);
         return;
     }

     console.log('Opening design info page for design ID:', designId);

     // Look for design in allDesigns
     let design = allDesigns.find(d => d.id === designId);

     if (design) {
         // Store design in sessionStorage for the detail page
         sessionStorage.setItem('selectedDesign', JSON.stringify({
             id: design.id,
             name: design.title || design.name,
             type: design.designType || design.type,
             price: design.price,
             location: design.location || 'Not specified',
             bedrooms: design.bedrooms,
             bathrooms: design.bathrooms,
             kitchens: design.kitchens || 1,
             parking: design.parking || 2,
             plotSize: design.plotSize || '1500 sq.ft',
             builtArea: design.area || '1200 sq.ft',
             floors: design.floors || '2',
             rating: design.rating || 4.5,
             reviews: design.reviews || 0,
             image: design.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
             description: design.description || 'Beautiful architectural design.',
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
         showNotification('Design not found', 'error');
     }
 }

 // Keep your existing handlePurchase, showNotification, and getDesignIcon functions as they are

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