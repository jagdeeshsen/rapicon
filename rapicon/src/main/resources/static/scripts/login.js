// Login form handling
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/api/auth/login-vendor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const data = await response.json();

            // Store user data and token
            localStorage.setItem('vendor_token', data.token);
            localStorage.setItem('vendor_role', data.role);
            localStorage.setItem('vendor_id', data.id);
            localStorage.setItem('vendor_fullName', data.fullName);
            localStorage.setItem('user', JSON.stringify(data));

            // Redirect to vendor page
            if(data.role.toLowerCase()== "vendor"){
                window.location.href = 'vendor-dashboard.html';
            }
        } else {
            const errorData = await response.json();
            showError(errorData.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please check your connection.');
    }
});

// Password show/hide toggle
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle icon
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}

// Forgot password handling
const forgotPasswordLink = document.getElementById('forgotPassword');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();

        const email = prompt('Please enter your email address:');
        if (email) {
            handleForgotPassword(email);
        }
    });
}

async function handleForgotPassword(email) {
    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            showSuccess('Password reset link has been sent to your email.');
        } else {
            const errorData = await response.json();
            showError(errorData.message || 'Failed to send reset link.');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        showError('Network error. Please try again later.');
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.className = 'alert alert-danger';

        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.className = 'alert alert-success';

        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Check if user is already logged in
if (localStorage.getItem('vendor_token')) {
    window.location.href = 'vendor-dashboard.html';
}