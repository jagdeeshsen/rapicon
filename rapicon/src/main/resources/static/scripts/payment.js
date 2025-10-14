let selectedPaymentMethod = '';

    // Load design details
    function loadOrderSummary() {
      const design = JSON.parse(sessionStorage.getItem('purchaseDesign') || '{}');

      if (design.name) {
        document.getElementById('designName').textContent = design.name;
        document.getElementById('designPrice').textContent = '₹' + design.price;

        if (design.image) {
          document.getElementById('designImage').src = design.image;
        }

        // Calculate total
        const basePrice = parseFloat(design.price);
        const serviceFee = 50;
        const gst = (basePrice + serviceFee) * 0.18;
        const total = basePrice + serviceFee + gst;

        document.getElementById('serviceFee').textContent = '₹' + serviceFee;
        document.getElementById('gst').textContent = '₹' + gst.toFixed(2);
        document.getElementById('totalAmount').textContent = '₹' + total.toFixed(2);
      } else {
        alert('No design selected. Redirecting to dashboard...');
        window.location.href = '/user.html';
      }
    }

    // Setup payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
      method.addEventListener('click', function() {
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
        this.classList.add('selected');
        selectedPaymentMethod = this.dataset.method;
        document.getElementById('paymentMethod').value = selectedPaymentMethod;
      });
    });

    function goBack() {
      window.history.back();
    }

    // Handle form submission
    document.getElementById('paymentForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      if (!selectedPaymentMethod) {
        showNotification('Please select a payment method', 'error');
        return;
      }

      const design = JSON.parse(sessionStorage.getItem('purchaseDesign') || '{}');
      const token = localStorage.getItem('token');

      // Get form data
      const purchaseData = {
        designId: design.id,
        designName: design.name,
        price: document.getElementById('totalAmount').textContent.replace('₹', ''),
        customerName: document.getElementById('customerName').value,
        customerEmail: document.getElementById('customerEmail').value,
        customerPhone: document.getElementById('customerPhone').value,
        projectLocation: document.getElementById('projectLocation').value,
        paymentMethod: selectedPaymentMethod,
        specialRequirements: document.getElementById('specialRequirements').value
      };

      // Disable button and show loading
      const submitBtn = this.querySelector('.btn-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(purchaseData)
        });

        const result = await response.json();

        if (response.ok) {
          showNotification('✅ Order created successfully! Our team will contact you within 24 hours.', 'success');

          // Clear session storage
          sessionStorage.removeItem('purchaseDesign');
          sessionStorage.removeItem('selectedDesign');

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            window.location.href = '/user.html';
          }, 2000);
        } else {
          showNotification(result.message || 'Error creating order. Please try again.', 'error');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      } catch (error) {
        console.error('Purchase error:', error);
        showNotification('Error processing order. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });

    // Notification function
    function showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
        <div class="notification-content">
          <span class="notification-message">${message}</span>
          <button class="notification-close">&times;</button>
        </div>
      `;

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

      document.body.appendChild(notification);

      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      });

      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideOutRight 0.3s ease';
          setTimeout(() => notification.remove(), 300);
        }
      }, 5000);
    }

    // Load order summary on page load
    loadOrderSummary();