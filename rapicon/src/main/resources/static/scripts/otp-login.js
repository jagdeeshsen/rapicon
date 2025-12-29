document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        errorMessage.textContent = "";
        errorMessage.style.display = 'none';

        const phone = document.getElementById('username').value.trim();
        if (!phone) {
            errorMessage.textContent = "Please enter your mobile number.";
            errorMessage.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem('pendingPhone', phone);
                await showMessage.alert("OTP sent successfully!", {
                    title: "success",
                    type: "success"
                });
                window.location.href = "otp-verification.html?mode=login";
            } else {
                // Handle error responses
                const contentType = response.headers.get("content-type");

                let message = "Something went wrong.";

                if (contentType && contentType.includes("application/json")) {
                    const errData = await response.json();
                    message = errData.message || message;
                } else {
                    const errText = await response.text();
                    message = errText || message;
                }

                // Display the error message
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';

            }
        } catch (error) {
            errorMessage.textContent = "Network error. Please check your connection and try again.";
            errorMessage.style.display = 'block';
        }
    });
});

// check is token expired
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // seconds → ms
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
    // ❌ expired → clear everything
    localStorage.clear();
    sessionStorage.clear();
    console.log("Expired token cleared");
  } else {
    // ✅ valid → redirect
    window.location.replace('user.html');
  }
})();

