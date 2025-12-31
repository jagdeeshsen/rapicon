document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    const registerBtn = document.getElementById('registerBtn');

    function showSuccess(message) {
        successMsg.textContent = message;
        successMsg.style.display = 'block';
        errorMsg.style.display = 'none';
    }

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        successMsg.style.display = 'none';
    }

    async function apiCall(url, body) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            return {
                success: response.ok,
                message: data.message || 'Request completed',
                data
            };

        } catch (err) {
            console.error('API Error:', err);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    // Step 1: Register user
    /*form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();

      // Empty check
      if (!email || !phone) {
        showError('Please enter both email and phone number.');
        return;
      }

      // Email validation
      if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
      }

      // Phone validation
      if (!isValidPhone(phone)) {
        showError('Please enter a valid 10-digit mobile number.');
        return;
      }

      registerBtn.disabled = true;
      showSuccess('Registering...');

      try {
        const registerResult = await apiCall('/api/auth/register-user', { email, phone });

        if (!registerResult.success) {
          showError(registerResult.message || 'Registration failed.');
          registerBtn.disabled = false;
          return;
        }

        showSuccess('Account created successfully. Sending OTP...');
        localStorage.setItem('pendingPhone', phone);

        const otpResult = await apiCall('/api/auth/send-otp', { phone });

        if (otpResult.success) {
          showSuccess('OTP sent! Please verify to complete registration.');
          window.location.href = '/otp-verification.html';
        } else {
          showError(otpResult.message || 'Failed to send OTP.');
        }

      } catch (err) {
        showError('Something went wrong. Please try again.');
      }

      registerBtn.disabled = false;
    });*/

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!email || !phone) {
            showError('Please enter both email and phone number.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }

        if (!isValidPhone(phone)) {
            showError('Please enter a valid 10-digit mobile number.');
            return;
        }

        registerBtn.disabled = true;
        showSuccess('Registering...');

        const registerResult = await apiCall('/api/auth/register-user', { email, phone });

        if (!registerResult.success) {
            showError(registerResult.message); // ✅ REAL backend message
            registerBtn.disabled = false;
            return;
        }

        showSuccess(registerResult.message);
        localStorage.setItem('pendingPhone', phone);

        const otpResult = await apiCall('/api/auth/send-otp', { phone });

        if (!otpResult.success) {
            showError(otpResult.message);
            registerBtn.disabled = false;
            return;
        }

        showSuccess('OTP sent! Please verify to complete registration.');
        window.location.href = '/otp-verification.html';
    });
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  // Indian mobile numbers (10 digits, starts with 6–9)
  return /^[6-9]\d{9}$/.test(phone);
}
