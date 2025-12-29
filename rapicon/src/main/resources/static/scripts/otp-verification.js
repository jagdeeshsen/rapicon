document.addEventListener('DOMContentLoaded', async function () {
    const verifyForm = document.getElementById('verifyForm');
    const errorMessage = document.getElementById('errorMessage');
    const resendOtpLink = document.getElementById('resendOtp');

    const phone = localStorage.getItem('pendingPhone');
    if (!phone) {
        await showMessage.alert("Session expired. Please login again.");
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

                showMessage.success("Login successfully!");
                // Wait 2 seconds before redirect
                setTimeout(() => {
                    window.location.replace("user.html");
                }, 2000);
            } else {
                const err = await response.json();
                errorMessage.textContent = err.message || "Invalid OTP. Please try again.";
            }
        } catch (error) {
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
                await showMessage.alert("OTP resent successfully!",{
                    title: 'success',
                    type: 'success'
                });
            } else {
                errorMessage.textContent = "Failed to resend OTP. Try again.";
            }
        } catch (error) {
            errorMessage.textContent = "Error resending OTP. Try again.";
        }
    });
});
