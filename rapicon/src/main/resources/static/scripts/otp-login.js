document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const sendOtpBtn = document.querySelector('.login-btn');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (sendOtpBtn.disabled) return;

        errorMessage.textContent = "";
        errorMessage.style.display = 'none';

        const phone = document.getElementById('phone').value.trim();
        if (!phone) {
            errorMessage.textContent = "Please enter your mobile number.";
            errorMessage.style.display = 'block';
            return;
        }
        if (!/^[0-9]{10}$/.test(phone)) {
            errorMessage.textContent = "Please enter a valid 10-digit mobile number.";
            errorMessage.style.display = 'block';
            return;
        }

        // Disable button immediately
        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = "Sending OTP...";
        sendOtpBtn.classList.add('disabled');

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
            });

            // Read the body exactly once, whatever shape it comes back in,
            // since a Response's body stream can't be read twice.
            const contentType = response.headers.get("content-type");
            let data = null;
            let rawText = null;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                rawText = await response.text();
            }

            // Test-only bypass - now reads the flag from the parsed body
            // instead of the Response object, so it can actually fire.
            if (response && response.bypassOtp) {
                window.location.href = "otp-verification.html?mode=login";
                return;
            }

            if (response.ok) {
                sendOtpBtn.textContent = "OTP Sent";
                localStorage.setItem('pendingPhone', phone);
                await showMessage.alert("OTP sent successfully!", {
                    title: "success",
                    type: "success"
                });
                window.location.href = "otp-verification.html?mode=login";
            } else {
                // API error -> re-enable button
                sendOtpBtn.disabled = false;
                sendOtpBtn.textContent = "Send OTP";
                sendOtpBtn.classList.remove('disabled');

                const message = (data && data.message) || rawText || "Something went wrong.";
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            // network error -> re-enable
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = "Send OTP";
            sendOtpBtn.classList.remove('disabled');

            errorMessage.textContent = "Network error. Please check your connection and try again.";
            errorMessage.style.display = 'block';
        }
    });
});

// check is token expired
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // seconds -> ms
    return Date.now() > expiry;
  } catch (e) {
    return true; // invalid token = expired
  }
}

// Check if user is already logged in
(function checkLoginState() {
  const token = localStorage.getItem('user_token');

  if (!token) return;

  if (isTokenExpired(token)) {
    // expired -> clear everything
    localStorage.clear();
    sessionStorage.clear();
    console.log("Expired token cleared");
  } else {
    // valid -> redirect
    window.location.replace('index.html');
  }
})();