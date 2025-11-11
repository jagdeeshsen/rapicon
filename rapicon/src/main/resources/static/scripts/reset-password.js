// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const resetToken = urlParams.get('token');

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const invalidToken = document.getElementById('invalidToken');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const submitBtn = document.getElementById('submitBtn');

// API Base URL - Update this to your backend URL
const API_BASE_URL = 'http://localhost:5000'; // Change for production

// Password strength indicators
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');

// Password requirements elements
const reqLength = document.getElementById('req-length');
const reqUppercase = document.getElementById('req-uppercase');
const reqLowercase = document.getElementById('req-lowercase');
const reqNumber = document.getElementById('req-number');
const reqSpecial = document.getElementById('req-special');

// Validate token on page load
window.addEventListener('DOMContentLoaded', async function() {
    if (!resetToken) {
        showInvalidToken();
        return;
    }

    await validateToken();
});

// Validate reset token
async function validateToken() {
    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch("/api/auth/validate-reset-token?token=${resetToken}", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Token is valid, show form
            loadingSpinner.style.display = 'none';
            resetPasswordForm.style.display = 'block';
        } else {
            // Token is invalid
            showInvalidToken();
        }
    } catch (error) {
        console.error('Token validation error:', error);
        showInvalidToken();
    }
}

function showInvalidToken() {
    loadingSpinner.style.display = 'none';
    resetPasswordForm.style.display = 'none';
    invalidToken.style.display = 'block';
}

// Password strength checker
newPasswordInput.addEventListener('input', function() {
    const password = this.value;
    const strength = calculatePasswordStrength(password);

    // Show strength bar and text
    document.querySelector('.password-strength').style.display = 'block';
    strengthText.style.display = 'block';

    // Update strength bar
    strengthBar.style.width = strength.percentage + '%';
    strengthBar.className = 'password-strength-bar ' + strength.class;

    // Update strength text
    strengthText.textContent = strength.text;
    strengthText.style.color = strength.color;

    // Update requirements checklist
    updateRequirements(password);
});

function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;

    if (strength <= 40) {
        return { percentage: strength, class: 'strength-weak', text: 'Weak', color: '#dc3545' };
    } else if (strength <= 70) {
        return { percentage: strength, class: 'strength-medium', text: 'Medium', color: '#ffc107' };
    } else {
        return { percentage: strength, class: 'strength-strong', text: 'Strong', color: '#28a745' };
    }
}

function updateRequirements(password) {
    // Length
    if (password.length >= 8) {
        reqLength.classList.add('valid');
    } else {
        reqLength.classList.remove('valid');
    }

    // Uppercase
    if (/[A-Z]/.test(password)) {
        reqUppercase.classList.add('valid');
    } else {
        reqUppercase.classList.remove('valid');
    }

    // Lowercase
    if (/[a-z]/.test(password)) {
        reqLowercase.classList.add('valid');
    } else {
        reqLowercase.classList.remove('valid');
    }

    // Number
    if (/[0-9]/.test(password)) {
        reqNumber.classList.add('valid');
    } else {
        reqNumber.classList.remove('valid');
    }

    // Special character
    if (/[^A-Za-z0-9]/.test(password)) {
        reqSpecial.classList.add('valid');
    } else {
        reqSpecial.classList.remove('valid');
    }
}

// Password visibility toggle
document.getElementById('toggleNewPassword').addEventListener('click', function() {
    togglePasswordVisibility(newPasswordInput, this);
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    togglePasswordVisibility(confirmPasswordInput, this);
});

function togglePasswordVisibility(input, icon) {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
}

// Form submission
resetPasswordForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match!');
        return;
    }

    // Validate password strength
    if (!validatePassword(newPassword)) {
        showError('Password does not meet the requirements!');
        return;
    }

    // Submit reset request
    await resetPassword(newPassword);
});

function validatePassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[^A-Za-z0-9]/.test(password);
}

async function resetPassword(newPassword) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting Password...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: resetToken,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Show success message
            successText.textContent = 'Password reset successful! Redirecting to login...';
            successMessage.style.display = 'block';
            resetPasswordForm.style.display = 'none';

            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            showError(data.message || 'Failed to reset password. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Reset Password';
        }
    } catch (error) {
        console.error('Reset password error:', error);
        showError('Network error. Please check your connection and try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reset Password';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}