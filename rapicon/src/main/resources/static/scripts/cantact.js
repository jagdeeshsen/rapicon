// contact.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".contact-form form");

 form.addEventListener("submit", function (e) {
     e.preventDefault();

     const name = form.querySelector('input[placeholder="Enter your name"]').value.trim();
     const phone = form.querySelector('input[placeholder="Enter your phone"]').value.trim();
     const email = form.querySelector('input[placeholder="Enter your email"]').value.trim();
     const message = form.querySelector("textarea").value.trim();

     // --- Validation ---
     if (!name || !phone || !email || !message) {
         showAlert("⚠️ Please fill in all fields.", "error");
         return;
     }

     if (!/^[0-9]{10}$/.test(phone)) {
         showAlert("📞 Please enter a valid 10-digit phone number.", "error");
         return;
     }

     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         showAlert("📧 Please enter a valid email address.", "error");
         return;
     }

     // --- Send POST request to backend ---
     fetch("/api/v1/customer/query", {
         method: "POST",
         headers: {
             "Content-Type": "application/json"
         },
         body: JSON.stringify({
             fullName: name,
             phone: phone,
             email: email,
             query: message
         })
     })
     .then(response => response.json())
     .then(data => {
         showAlert(data.message, "success"); // show success message from backend
         form.reset(); // reset form
     })
     .catch(error => {
         console.error(error);
         showAlert("❌ Failed to send query. Please try again.", "error");
     });
 });

  // --- Helper for showing alert messages ---
  function showAlert(message, type) {
    const oldAlert = document.querySelector(".alert-msg");
    if (oldAlert) oldAlert.remove();

    const alert = document.createElement("div");
    alert.className = `alert-msg ${type}`;
    alert.textContent = message;
    form.prepend(alert);

    setTimeout(() => alert.remove(), 4000);
  }
});
