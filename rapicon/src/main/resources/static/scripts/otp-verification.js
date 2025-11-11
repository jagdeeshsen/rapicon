document.addEventListener('DOMContentLoaded', function () {
    const verifyForm = document.getElementById('verifyForm');
    const errorMessage = document.getElementById('errorMessage');
    const resendOtpLink = document.getElementById('resendOtp');

    const phone = localStorage.getItem('pendingPhone');
    if (!phone) {
        alert("Session expired. Please login again.");
        window.location.href = "otp-login.html";
        return;
    }

    verifyForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        errorMessage.textContent = "";

        const otp = document.getElementById('otp').value.trim();
        if (!otp) {
            errorMessage.textContent = "Please enter the OTP.";
            return;
        }

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone, otp })
            });

            if (response.ok) {
                const data = await response.json();

                // Save token and user info for session
                localStorage.setItem('user_token', data.token);
                localStorage.setItem('user_id', data.id);
                localStorage.setItem('user_role', data.role);
                localStorage.setItem('user_fullName', data.fullName);
                localStorage.removeItem('pendingPhone');

                alert("Login successful!");
                window.location.href = "user.html";
            } else {
                const err = await response.json();
                errorMessage.textContent = err.message || "Invalid OTP. Please try again.";
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            errorMessage.textContent = "Something went wrong. Please try again.";
        }
    });

    // Resend OTP
    resendOtpLink.addEventListener('click', async function (e) {
        e.preventDefault();
        errorMessage.textContent = "";

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });

            if (response.ok) {
                alert("OTP resent successfully!");
            } else {
                errorMessage.textContent = "Failed to resend OTP. Try again.";
            }
        } catch (error) {
            console.error("Error resending OTP:", error);
            errorMessage.textContent = "Error resending OTP. Try again.";
        }
    });
});
