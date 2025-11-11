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

    async function apiCall(url,body) {
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

            if (!response.ok) throw new Error(data.message || 'Request failed');
            return { success: true, data };
        } catch (err) {
            showError(err.message || 'Something went wrong');
            console.error('API Error:', err);
            return { success: false };
        }
    }

    // Step 1: Register user
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!email || !phone) {
            showError('Please enter both email and phone number.');
            return;
        }

        registerBtn.disabled = true;
        showSuccess('Registering...');

        const registerResult = await apiCall('/api/auth/register-user', { email, phone });

        if (registerResult.success) {
            showSuccess('Account created successfully. Sending OTP...');
            localStorage.setItem('pendingPhone',phone);
            const otpResult = await apiCall('/api/auth/send-otp', { phone });

            if (otpResult.success) {
                showSuccess('OTP sent! Please verify to complete registration.');
                //otpDiv.style.display = 'block';
                window.location.href = '/otp-verification.html';
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        }

        registerBtn.disabled = false;
    });
});