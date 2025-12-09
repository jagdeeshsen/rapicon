// Get design ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const designId = urlParams.get('id');

  let totalArea=0;
  let builtUpArea=0;

  // Load design details
  function loadDesignDetails() {
    const design = JSON.parse(sessionStorage.getItem('selectedDesign') || '{}');

    if (design.id) {

      // store area and built-up-area for package use
      totalArea= design.totalArea;
      builtUpArea=design.builtUpArea;

      // ✅ Basic Info
      document.getElementById('designTitle').textContent = design.category || design.type;
      document.getElementById('designType').textContent = design.type.toUpperCase() || 'House';
      document.getElementById('designPrice').textContent = design.price ? `₹${design.price}` : '₹25 sq.ft';
      document.getElementById('plotSize').textContent = design.plotSize || '1500 sq.ft';
      document.getElementById('totalArea').textContent = design.totalArea || '1200 sq.ft';
      document.getElementById('builtArea').textContent = design.builtUpArea || '1200 sq.ft';
      document.getElementById('floors').textContent = design.floors ? design.floors.length : 2;

      if(design.type.trim().toLowerCase() === "commercial"){
        document.getElementById('bedrooms').textContent = design.businessUnits + ' Business Units';
      }else{
        document.getElementById('bedrooms').textContent = design.bedrooms + ' Bedrooms';
      }

      document.getElementById('bathrooms').textContent = (design.bathrooms || 0) + ' Bathrooms';
      document.getElementById('kitchens').textContent = design.kitchens + ' Kitchen';
      document.getElementById('plotFacing').textContent = design.plotFacing || ' N/A';
      document.getElementById('plotLocation').textContent = design.plotLocation || 'N/A';
      document.getElementById('parking').textContent = design.parking;
      document.getElementById('hall').textContent = (design.hall || 0 ) + ' Hall';
      document.getElementById('designDescription').textContent = design.description ||
                   'Beautiful architectural design with modern amenities and spacious rooms.';

      // ✅ Main Image
      document.addEventListener('DOMContentLoaded', () => {
          const mainImg = document.getElementById('mainImage');
          const leftBtn = document.getElementById('leftBtn');
          const rightBtn = document.getElementById('rightBtn');

          let currentIndex = 0;

          // Initialize first image
          if (design.elevationUrls && design.elevationUrls.length > 0) {
            mainImg.src = design.elevationUrls[0];
          }

          // ✅ Scroll function
          function scrollGallery(direction) {
            const total = design.elevationUrls.length;
            currentIndex += direction;

            if (currentIndex < 0) currentIndex = total - 1;
            if (currentIndex >= total) currentIndex = 0;

            // Smooth fade effect
            mainImg.style.opacity = 0;
            setTimeout(() => {
              mainImg.src = design.elevationUrls[currentIndex];
              mainImg.style.opacity = 1;
            }, 200);
          }

          // ✅ Event listeners
          leftBtn.addEventListener('click', () => scrollGallery(-1));
          rightBtn.addEventListener('click', () => scrollGallery(1));
      });

      // ✅ Rating
      const rating = design.rating || 4.5;
      const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
      document.getElementById('designRating').textContent = stars;
      document.getElementById('reviewCount').textContent = `(${design.reviews || 0} reviews)`;

    } else {
      // ❌ No design found
      document.getElementById('designTitle').textContent = 'Design Not Found';
      document.getElementById('designDescription').textContent = 'Please go back and select a design.';
    }
  }

  function goBack() {
    window.location.href = '/user.html';
  }

  function SeePlans() {
      sessionStorage.setItem('totalArea',totalArea);
      sessionStorage.setItem('builtUpArea', builtUpArea);
      window.location.href = '/package-page.html';
  }

  function BuyNow() {
    sessionStorage.setItem('totalArea',totalArea);
    sessionStorage.setItem('builtUpArea', builtUpArea);
    window.location.href = '/package-page.html';
  }

  async function addToCart() {
    const design = JSON.parse(sessionStorage.getItem('selectedDesign') || '{}');
    const userId = localStorage.getItem('user_id'); // assuming you store logged-in user info

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

  // Load design details when page loads
  loadDesignDetails();