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
            console.log("Sending OTP request for phone:", phone); // Debug log

            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
            });

            console.log("Response status:", response.status); // Debug log

            if (response.ok) {
                const data = await response.json();
                console.log("Success response:", data); // Debug log

                localStorage.setItem('pendingPhone', phone);
                alert("OTP sent successfully!");
                window.location.href = "otp-verification.html?mode=login";
            } else {
                // Handle error responses
                const contentType = response.headers.get("content-type");
                console.log("Error content-type:", contentType); // Debug log

                let message = "Something went wrong.";

                if (contentType && contentType.includes("application/json")) {
                    const errData = await response.json();
                    console.log("Error data:", errData); // Debug log
                    message = errData.message || message;
                } else {
                    const errText = await response.text();
                    console.log("Error text:", errText); // Debug log
                    message = errText || message;
                }

                // Display the error message
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';

                console.log("Displaying error:", message); // Debug log
            }
        } catch (error) {
            console.error("Caught error:", error); // Debug log
            errorMessage.textContent = "Network error. Please check your connection and try again.";
            errorMessage.style.display = 'block';
        }
    });
});

// Check if user is already logged in
if (localStorage.getItem('user_token')) {
    window.location.href = 'user.html';
}
