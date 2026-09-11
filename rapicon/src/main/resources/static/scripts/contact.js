const rcForm = document.getElementById("rcContactForm");
const rcAlert = document.getElementById("rcAlert");
const rcSubmitBtn = document.getElementById("rcSubmitBtn");

function rcShowAlert(message, type) {
  rcAlert.className = `rc-alert ${type}`;
  rcAlert.style.display = "flex";
  const icon = type === "success" ? "check-circle" : "alert-circle";
  rcAlert.innerHTML = `<i data-lucide="${icon}" width="16" height="16"></i><span>${message}</span>`;
  if (window.lucide) lucide.createIcons();

  if (type === "success" || type === "error") {
    setTimeout(() => { rcAlert.style.display = "none"; }, 4000);
  }
}

rcForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("rcName").value.trim();
  const phone = document.getElementById("rcPhone").value.trim();
  const email = document.getElementById("rcEmail").value.trim();
  const message = document.getElementById("rcMessage").value.trim();

  if (!name || !phone || !email || !message) {
    rcShowAlert("Please fill in all fields.", "error");
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    rcShowAlert("Please enter a valid 10-digit phone number.", "error");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    rcShowAlert("Please enter a valid email address.", "error");
    return;
  }

  rcSubmitBtn.disabled = true;
  rcSubmitBtn.innerHTML = `<i data-lucide="loader" width="15" height="15" class="rc-spin"></i> Sending...`;
  if (window.lucide) lucide.createIcons();

  try {
    const res = await fetch("/api/v1/customer/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: name, phone, email, query: message }),
    });
    const data = await res.json();

    if (res.ok) {
      rcShowAlert(data.message || "Message sent successfully! We'll get back to you soon.", "success");
      rcForm.reset();
    } else {
      rcShowAlert(data.message || "Failed to send message. Please try again.", "error");
    }
  } catch {
    rcShowAlert("Network error. Please check your connection and try again.", "error");
  } finally {
    rcSubmitBtn.disabled = false;
    rcSubmitBtn.textContent = "Send Message";
  }
});

window.addEventListener("load", () => { if (window.lucide) lucide.createIcons(); });