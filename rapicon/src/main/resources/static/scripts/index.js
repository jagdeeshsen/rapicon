const RC_API_URL = "/api/admin";
const page = 0;
const size = 8;

let rcAllDesigns = [];

// ---------- Fetch ----------
async function rcFetchDesigns() {
  const loadingEl = document.getElementById("rcLoadingState");
  const errorEl = document.getElementById("rcErrorState");
  const emptyEl = document.getElementById("rcEmptyState");
  const gridEl = document.getElementById("rcDesignsGrid");

  loadingEl.style.display = "flex";
  errorEl.style.display = "none";
  emptyEl.style.display = "none";
  gridEl.innerHTML = "";

  try {
    const token = rcGetToken();
    const res = await fetch(
      `${RC_API_URL}/designs/approved?status=APPROVED&page=${page}&size=${size}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );

    if (res.status === 401) {
      // Session expired — send to login rather than showing a raw error.
      window.location.href = "/otp-login.html";
      return;
    }
    if (!res.ok) throw new Error("Failed to load designs");
    const data = await res.json();
    rcAllDesigns = data.content;
    loadingEl.style.display = "none";
    rcRenderGrid(rcAllDesigns);
  } catch (err) {
    loadingEl.style.display = "none";
    errorEl.style.display = "flex";
  }
}

// ---------- Rendering ----------
function rcRenderGrid(designs) {
  const gridEl = document.getElementById("rcDesignsGrid");
  const emptyEl = document.getElementById("rcEmptyState");
  const countEl = document.getElementById("rcResultCount");
  if (countEl) countEl.textContent = `${designs.length} design${designs.length !== 1 ? "s" : ""}`;

  if (designs.length === 0) {
    gridEl.innerHTML = "";
    emptyEl.style.display = "flex";
    return;
  }
  emptyEl.style.display = "none";

  gridEl.innerHTML = designs.map(rcCardHTML).join("");
  if (window.lucide) lucide.createIcons();

  gridEl.querySelectorAll("[data-design-id]").forEach((card) => {
    card.addEventListener("click", () => rcHandleView(card.dataset.designId, designs));
  });
}

function rcCardHTML(d) {
  const urls = d.elevationUrls || [];
  const img = urls[0];
  const category = (d.designType || "").toUpperCase();
  const isCommercial = category === "COMMERCIAL";
  const isResidential = category === "RESIDENTIAL" || category === "SEMI-COMMERCIAL";

  let bedrooms = 0, businessUnits = 0;
  (d.floorList || []).forEach((f) => {
    bedrooms += parseInt(f.bedrooms || "0") || 0;
    businessUnits += parseInt(f.businessUnits || "0") || 0;
  });

  const floors = (d.floorList || []).length;
  const price = (d.builtUpArea || 0) * 5;

  return `
    <div class="rc-design-card" data-design-id="${d.id}">
      <div class="rc-design-media">
        ${img ? `<img src="${img}" alt="${d.designCategory || ""}" loading="lazy">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:44px;">🏠</div>`}
        <span class="rc-design-badge">${d.designType || "Residential"}</span>
      </div>
      <div class="rc-design-body">
        <h3 class="rc-design-title">${d.designCategory || d.designType}</h3>
        <div class="rc-design-specs">
          <span>${d.length} × ${d.width} ft</span><span class="sep">·</span>
          <span>${floors} ${floors === 1 ? "Floor" : "Floors"}</span>
          ${isResidential && bedrooms > 0 ? `<span class="sep">·</span><span>${bedrooms} BHK</span>` : ""}
          ${isCommercial && businessUnits > 0 ? `<span class="sep">·</span><span>${businessUnits} Units</span>` : ""}
          <span class="sep">·</span><span>${d.totalArea || ""} sq ft</span>
        </div>
        <div class="rc-design-foot">
          <div>
            <div class="rc-design-price">₹${price.toLocaleString("en-IN")}</div>
            <div class="rc-design-price-label">Starting price</div>
          </div>
          <div class="rc-design-rating"><i data-lucide="star" width="12" height="12"></i>${d.rating || "4.5"}</div>
        </div>
        <button class="rc-view-btn">View Design <i data-lucide="arrow-right" width="13" height="13"></i></button>
      </div>
    </div>`;
}

function rcHandleView(id, designs) {
  const design = designs.find((d) => String(d.id) === String(id));
  if (!rcIsLoggedIn()) {
    window.location.href = "/otp-login.html";
    return;
  }
  sessionStorage.setItem("selectedDesign", JSON.stringify(design));
  window.location.href = "details.html";
}

document.getElementById("rcRetryBtn").addEventListener("click", rcFetchDesigns);

// FAQ accordion
document.querySelectorAll(".rc-faq-item").forEach((item) => {
  item.querySelector(".rc-faq-q").addEventListener("click", () => item.classList.toggle("open"));
});

// ---------- Account icon / modal ----------
// Not logged in -> straight to login. Logged in -> a dialog with Profile
// and Logout, instead of the icon just being a plain link to login.
const rcAccountBtn = document.getElementById("rcAccountBtn");
const rcAccountModal = document.getElementById("rcAccountModal");

rcAccountBtn.addEventListener("click", () => {
  if (!rcIsLoggedIn()) {
    window.location.href = "/otp-login.html";
    return;
  }
  rcAccountModal.classList.add("active");
});

document.getElementById("rcAccountModalClose").addEventListener("click", () => {
  rcAccountModal.classList.remove("active");
});
rcAccountModal.addEventListener("click", (e) => {
  if (e.target === rcAccountModal) rcAccountModal.classList.remove("active");
});

document.getElementById("rcLogoutBtn").addEventListener("click", () => {
  localStorage.removeItem(RC_TOKEN_KEY);
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_fullName");
  window.location.href = "/";
});

// Kick off
rcFetchDesigns();
window.addEventListener("load", () => { if (window.lucide) lucide.createIcons(); });


// Auto-open chatbot on page load
window.addEventListener("load", () => {
  const tryOpen = () => {
    if (window.AIArchitectWidget) {
      window.AIArchitectWidget.open();
    } else {
      setTimeout(tryOpen, 200); // retry until widget.js finishes initializing
    }
  };
  tryOpen();
});

// Connect your existing button
document.getElementById("chatbot-open-btn").addEventListener("click", () => {
  if (window.AIArchitectWidget) window.AIArchitectWidget.open();
});

// Route the cart icon to cart.html if logged in, otherwise login page
const cartLink = document.getElementById("rcCartLink");
if (cartLink) {
  if (rcIsLoggedIn()) {
    cartLink.href = "cart.html";
    cartLink.setAttribute("aria-label", "My cart");
  } else {
    cartLink.href = "otp-login.html";
    cartLink.setAttribute("aria-label", "Log In");
  }
}