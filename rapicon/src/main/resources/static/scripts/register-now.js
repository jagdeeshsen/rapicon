const form = document.getElementById('registrationForm');
const submitBtn = document.querySelector('.submit-btn');

// Format account number (remove non-digits)
document.getElementById('accountNumber').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Format IFSC code (uppercase)
document.getElementById('ifscCode').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});

// Format PAN number (uppercase)
document.getElementById('panNumber').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});

// Format GST number (uppercase)
document.getElementById('gstNumber').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});

// Format phone number
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 2) {
            value = '(+' + value;
        } else if (value.length <= 4) {
            value = '(+' + value.slice(0, 2) + ') ' + value.slice(2);
        } else if (value.length <= 9) {
            value = '(+' + value.slice(0, 2) + ') ' + value.slice(2, 7) + ' ' + value.slice(7);
        } else {
            value = '(+' + value.slice(0, 2) + ') ' + value.slice(2, 7) + ' ' + value.slice(7, 12);
        }
    }
    e.target.value = value;
});

// Validation functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
}

function validateAccountNumber(accountNumber) {
    return /^\d{9,18}$/.test(accountNumber);
}

function validateIFSC(ifsc) {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
}

function validatePAN(pan) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
}

function validateGST(gst) {
    // GST format: 22AAAAA0000A1Z5 (15 characters)
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
}

function validateZip(zip) {
    return /^\d{6}$/.test(zip);
}

function validateUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function showError(fieldId, show) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + 'Error');

    if (show) {
        field.classList.add('error');
        error.classList.add('show');
    } else {
        field.classList.remove('error');
        error.classList.remove('show');
    }
}

function setLoadingState(loading) {
    if (loading) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';
        submitBtn.style.opacity = '0.7';
        submitBtn.style.cursor = 'not-allowed';
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register Account';
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    }
}

function showSuccessMessage(message) {
    const successMsg = document.getElementById('successMessage');
    successMsg.textContent = message;
    successMsg.classList.add('show');
    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 5000);
}

function showApiError(message) {
    const successMsg = document.getElementById('successMessage');
    successMsg.style.background = '#f8d7da';
    successMsg.style.color = '#721c24';
    successMsg.style.borderColor = '#f5c6cb';
    successMsg.textContent = message;
    successMsg.classList.add('show');

    setTimeout(() => {
        successMsg.classList.remove('show');
        // Reset to success style
        setTimeout(() => {
            successMsg.style.background = '#d4edda';
            successMsg.style.color = '#155724';
            successMsg.style.borderColor = '#c3e6cb';
        }, 300);
    }, 5000);
}

async function registerUser(formData) {
    try {
        const response = await fetch('/api/auth/create-vendor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed. Please try again.');
        }

        return {
            success: true,
            data: data
        };

    } catch (error) {
        return {
            success: false,
            error: error.message || 'Network error. Please check your connection and try again.'
        };
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    let isValid = true;

    // Validate Full Name
    const fullName = document.getElementById('fullName').value.trim();
    if (fullName.length < 2) {
        showError('fullName', true);
        isValid = false;
    } else {
        showError('fullName', false);
    }

    // Validate Username
    const userName = document.getElementById('userName').value.trim();
    if (!validateUsername(userName)) {
        showError('userName', true);
        isValid = false;
    } else {
        showError('userName', false);
    }

    // Validate Email
    const email = document.getElementById('email').value.trim();
    if (!validateEmail(email)) {
        showError('email', true);
        isValid = false;
    } else {
        showError('email', false);
    }

    // Validate Phone
    const phone = document.getElementById('phone').value;
    if (!validatePhone(phone)) {
        showError('phone', true);
        isValid = false;
    } else {
        showError('phone', false);
    }

    // Validate Password
    const password = document.getElementById('password').value;
    if (password.length < 8) {
        showError('password', true);
        isValid = false;
    } else {
        showError('password', false);
    }

    // Validate Confirm Password
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
        showError('confirmPassword', true);
        isValid = false;
    } else {
        showError('confirmPassword', false);
    }

    // Validate Company Name (optional)
    const companyName = document.getElementById('companyName').value.trim();
    // No validation required as it's optional

    // Validate Degree
    const degree = document.getElementById('degree').value.trim();
    if (degree.length < 2) {
        showError('degree', true);
        isValid = false;
    } else {
        showError('degree', false);
    }

    // Validate Experience
    const experience = document.getElementById('experience').value.trim();
    if (experience.length < 1) {
        showError('experience', true);
        isValid = false;
    } else {
        showError('experience', false);
    }

    // Validate Account Number
    const accountNumber = document.getElementById('accountNumber').value.trim();
    /*if (!validateAccountNumber(accountNumber)) {
        showError('accountNumber', true);
        isValid = false;
    } else {
        showError('accountNumber', false);
    }*/

    // Validate IFSC Code
    const ifscCode = document.getElementById('ifscCode').value.trim();
    /*if (!validateIFSC(ifscCode)) {
        showError('ifscCode', true);
        isValid = false;
    } else {
        showError('ifscCode', false);
    }*/

    // Validate Bank Name
    const bankName = document.getElementById('bankName').value.trim();
    /*if (bankName.length < 2) {
        showError('bankName', true);
        isValid = false;
    } else {
        showError('bankName', false);
    }*/

    // Validate Branch Name
    const branchName = document.getElementById('branchName').value.trim();
    /*if (branchName.length < 2) {
        showError('branchName', true);
        isValid = false;
    } else {
        showError('branchName', false);
    }*/

    // Validate PAN Number
    const panNumber = document.getElementById('panNumber').value.trim();
/*    if (!validatePAN(panNumber)) {
        showError('panNumber', true);
        isValid = false;
    } else {
        showError('panNumber', false);
    }*/

    // Validate GST Number (optional)
    const gstNumber = document.getElementById('gstNumber').value.trim();
    /*if (gstNumber && !validateGST(gstNumber)) {
        showError('gstNumber', true);
        isValid = false;
    } else {
        showError('gstNumber', false);
    }*/

    // Validate Street
    const street = document.getElementById('street').value.trim();
    if (street.length < 3) {
        showError('street', true);
        isValid = false;
    } else {
        showError('street', false);
    }

    // Validate City
    const city = document.getElementById('city').value.trim();
    if (city.length < 2) {
        showError('city', true);
        isValid = false;
    } else {
        showError('city', false);
    }

    // Validate State
    const state = document.getElementById('state').value.trim();
    if (state.length < 2) {
        showError('state', true);
        isValid = false;
    } else {
        showError('state', false);
    }

    // Validate ZIP
    const zip = document.getElementById('zip').value.trim();
    if (!validateZip(zip)) {
        showError('zip', true);
        isValid = false;
    } else {
        showError('zip', false);
    }

    // Validate Country
    const country = document.getElementById('country').value;
    if (!country) {
        showError('country', true);
        isValid = false;
    } else {
        showError('country', false);
    }

    // If validation fails, scroll to first error
    if (!isValid) {
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Prepare data for API call
    const registrationData = {
        fullName: fullName,
        username: userName,
        email: email,
        phone: phone.replace(/\D/g, ''),
        password: password,
        companyName: companyName || null,
        degree: degree,
        experience: experience,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        bankName: bankName,
        branchName: branchName,
        panNumber: panNumber,
        gstNumber: gstNumber || null,
        streetAddress: street,
        city: city,
        state: state,
        zipCode: zip,
        country: country
    };

    // Show loading state
    setLoadingState(true);

    // Make API call
    const result = await registerUser(registrationData);

    // Hide loading state
    setLoadingState(false);

    if (result.success) {
        // Success - show message and reset form
        showSuccessMessage('Registration successful! Your account has been created.');
        form.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Optional: Redirect to login or dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    } else {
        // Error - show error message
        showApiError(result.error);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Optional: Real-time password strength checker
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const confirmPassword = document.getElementById('confirmPassword');

    // Check if passwords match when confirm password has value
    if (confirmPassword.value) {
        if (password === confirmPassword.value) {
            showError('confirmPassword', false);
        } else {
            showError('confirmPassword', true);
        }
    }
});

// Optional: Real-time confirm password checker
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;

    if (password === confirmPassword) {
        showError('confirmPassword', false);
    } else {
        showError('confirmPassword', true);
    }
});

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = event.currentTarget; // Get the button that was clicked

    if (field.type === 'password') {
        field.type = 'text';
        button.textContent = '🙈';
    } else {
        field.type = 'password';
        button.textContent = '👁️';
    }
}