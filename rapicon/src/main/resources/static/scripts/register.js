    // Toggle vendor-specific fields
    function toggleVendorFields() {
        const role = document.getElementById('role').value;
        //const vendorFields = document.getElementById('vendorFields');

    }

    // Check password strength
    function checkPasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthDiv = document.getElementById('passwordStrength');

        if (password.length === 0) {
            strengthDiv.textContent = '';
            return;
        }

        let strength = 0;

        // Length check
        if (password.length >= 8) strength++;

        // Contains lowercase
        if (/[a-z]/.test(password)) strength++;

        // Contains uppercase
        if (/[A-Z]/.test(password)) strength++;

        // Contains numbers
        if (/\d/.test(password)) strength++;

        // Contains special characters
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        if (strength < 3) {
            strengthDiv.textContent = 'Password strength: Weak';
            strengthDiv.className = 'password-strength strength-weak';
        } else if (strength < 5) {
            strengthDiv.textContent = 'Password strength: Medium';
            strengthDiv.className = 'password-strength strength-medium';
        } else {
            strengthDiv.textContent = 'Password strength: Strong';
            strengthDiv.className = 'password-strength strength-strong';
        }
    }

    // Check password match
    function checkPasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const matchDiv = document.getElementById('passwordMatch');

        if (confirmPassword.length === 0) {
            matchDiv.textContent = '';
            return;
        }

        if (password === confirmPassword) {
            matchDiv.textContent = 'Passwords match';
            matchDiv.className = 'password-strength strength-strong';
        } else {
            matchDiv.textContent = 'Passwords do not match';
            matchDiv.className = 'password-strength strength-weak';
        }
    }

    // Form submission
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const registerBtn = document.getElementById('registerBtn');
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');

        // Hide previous messages
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        // Validate passwords match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        // Check password strength
        if (password.length < 8) {
            showError('Password must be at least 8 characters long');
            return;
        }

        // Disable submit button
        registerBtn.disabled = true;
        registerBtn.textContent = 'Creating Account...';

        const formData = new FormData(this);
        const userData = {
            username: formData.get('username'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    firstname: formData.get('firstName'),
                    lastname: formData.get('lastName'),
                    phone: formData.get('phone'),
                    role: formData.get('role').toUpperCase()
        };


        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.text();

            if (response.ok) {
                 showSuccess(data);
                //showSuccess('Account created successfully! Please check your email to verify your account.');

                // Clear form
                document.getElementById('registerForm').reset();
                toggleVendorFields();

                // Redirect after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                showError(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            // Re-enable submit button
            registerBtn.disabled = false;
            registerBtn.textContent = 'Create Account';
        }
    });

    // Show error message
    function showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Scroll to error message
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Hide error after 10 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 10000);
    }

    // Show success message
    function showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        successElement.textContent = message;
        successElement.style.display = 'block';

        // Scroll to success message
        successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Show terms modal (placeholder)
    function showTerms() {
        alert('Terms of Service would be displayed in a modal or separate page.');
    }

    // Show privacy modal (placeholder)
    function showPrivacy() {
        alert('Privacy Policy would be displayed in a modal or separate page.');
    }

    // Check if user is already logged in
    if (localStorage.getItem('token')) {
        const user = JSON.parse(localStorage.getItem('user'));
        switch(user.role.toLowerCase()) {
            case 'admin':
                window.location.href = 'admin.html';
                break;
            case 'vendor':
                window.location.href = 'vendor.html';
                break;
            case 'user':
                window.location.href = 'user.html';
                break;
        }
    }