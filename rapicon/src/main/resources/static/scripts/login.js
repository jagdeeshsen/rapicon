
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
            localStorage.setItem('vendor_email', data.email);
            localStorage.setItem('user', JSON.stringify(data));

            // Redirect to vendor page
            if (data.role.toLowerCase() === "vendor") {

                showMessage.success("Login successful!");

                // Wait 2 seconds before redirect
                setTimeout(() => {
                    window.location.href = 'vendor-dashboard.html';
                }, 2000);
            }
        } else {
            const errorData = await response.json();
            showMessage.error(errorData.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        showMessage.error('Network error. Please check your connection.');
    }
});

// Password show/hide toggle - SIMPLE VERSION WITH EMOJI
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function(e) {
        e.preventDefault();

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            this.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            this.textContent = "👁️";
        }
    });
}
// Forgot password handling
const forgotPasswordLink = document.getElementById('forgotPassword');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', async function(e) {
        e.preventDefault();

        const email= await showMessage.prompt('Please enter you registered email:');
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
            await showMessage.alert('Password reset link has been sent to your registered email.',{
                title: 'success',
                type: 'success'
            });
        } else {
            const errorData = await response.json();
            showMessage.error(errorData.message || 'Failed to send reset link.');
        }
    } catch (error) {
        showMessage.error('Network error. Please try again later.');
    }
}

// Check if user is already logged in
if (localStorage.getItem('vendor_token')) {
    window.location.href = 'vendor-dashboard.html';
}