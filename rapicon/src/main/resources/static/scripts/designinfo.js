// Get design ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const designId = urlParams.get('id');

  // Load design details
  function loadDesignDetails() {
    // Retrieve from sessionStorage
    const design = JSON.parse(sessionStorage.getItem('selectedDesign') || '{}');

    if (design.name) {
      document.getElementById('designTitle').textContent = design.name;
      /*document.getElementById('designPrice').textContent = '₹' + design.price + ' per sq ft';*/
      document.getElementById('designType').textContent = (design.type || 'House').toUpperCase();
      document.getElementById('designPrice').textContent = '₹' + design.price;
      /*document.getElementById('plotSize').textContent = design.plotSize || '1500 sq.ft';*/
      document.getElementById('builtArea').textContent = design.builtArea || '1200 sq.ft';
      document.getElementById('floors').textContent = design.floors || '2';
      document.getElementById('bedrooms').textContent = (design.bedrooms || 3) + ' Bedrooms';
      document.getElementById('bathrooms').textContent = (design.bathrooms || 2) + ' Bathrooms';
      document.getElementById('kitchens').textContent = (design.kitchens || 1) + ' Kitchen';
      document.getElementById('parking').textContent = (design.parking || 2) + ' Parking';
      document.getElementById('designDescription').textContent = design.description || 'Beautiful architectural design with modern amenities and spacious rooms.';

      if (design.image) {
        document.getElementById('mainImage').src = design.image;
      }

      // Set rating
      const rating = design.rating || 4.5;
      const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
      document.getElementById('designRating').textContent = stars;
      document.getElementById('reviewCount').textContent = `(${design.reviews || 0} reviews)`;

      // Load key features
      const features = design.features || [
        { icon: '🌞', text: 'Natural Lighting' },
        { icon: '🌿', text: 'Green Spaces' },
        { icon: '🔒', text: 'Security System' },
        { icon: '💡', text: 'Smart Home Ready' }
      ];

      const featuresContainer = document.getElementById('keyFeatures');
      featuresContainer.innerHTML = features.map(f => `
        <div class="feature-item">
          <div class="feature-icon">${f.icon}</div>
          <div>${f.text}</div>
        </div>
      `).join('');
    } else {
      // No design data found
      document.getElementById('designTitle').textContent = 'Design Not Found';
      document.getElementById('designDescription').textContent = 'Please go back and select a design.';
    }
  }

  function goBack() {
    window.location.href = '/user.html';
  }

  function viewCart() {
    window.location.href = '/addtocard.html';
  }

  async function addToCart() {
    const design = JSON.parse(sessionStorage.getItem('selectedDesign') || '{}');
    const userId = localStorage.getItem('id'); // assuming you store logged-in user info

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
      added_at: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/cart/addItem", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // if JWT is used
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



  /*function addToCart() {
    const design = JSON.parse(sessionStorage.getItem('selectedDesign') || '{}');
    if (design.name) {
      // Store design info for payment page
      sessionStorage.setItem('purchaseDesign', JSON.stringify(design));
      window.location.href = '/addtocard.html';
    } else {
      alert('Design information not found. Please go back and select a design.');
    }
  }*/

  // Load design details when page loads
  loadDesignDetails();