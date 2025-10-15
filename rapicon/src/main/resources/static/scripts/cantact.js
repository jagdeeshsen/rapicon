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

    // ✅ Strict phone number validation (10 digits only)
    if (!/^[0-9]{10}$/.test(phone)) {
      showAlert("📞 Please enter a valid 10-digit phone number.", "error");
      return;
    }

    // ✅ Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAlert("📧 Please enter a valid email address.", "error");
      return;
    }

    // --- Simulate successful message ---
    showAlert("✅ Your message has been sent successfully!", "success");

    // Reset the form
    form.reset();
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
