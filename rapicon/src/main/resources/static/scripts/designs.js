const RC_API_URL = "/api/admin";
const RC_PAGE_SIZE = 12;


let rcAllDesigns = [];
let rcFilters = { search: "", types: [], price: "", plot: "", floor: "", sort: "relevance" };

// Pagination state
let rcPage = 0;
let rcHasMore = true;
let rcIsLoadingMore = false;

// Pre-fill from URL (?type=house) so homepage category links land here filtered
(function rcInitFromURL() {
const params = new URLSearchParams(window.location.search);
const type = params.get("type");
if (type) rcFilters.types = [type];
})();


async function rcFetchPage(page) {
const token = rcGetToken();
const res = await fetch(
  `${RC_API_URL}/designs/approved?status=APPROVED&page=${page}&size=${RC_PAGE_SIZE}`,
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }
);

if (res.status === 401) {
  window.location.href = "/otp-login.html";
  throw new Error("unauthorized"); // stop the caller's flow; redirect already in progress
}
if (!res.ok) throw new Error("Failed to load designs");

const data = await res.json();
const content = data.content || data;
const isLast = "last" in data ? data.last : true;
return { content, isLast };
}

// Initial load (or full reset, e.g. on Retry)
async function rcFetchDesigns() {
const loadingEl = document.getElementById("rcLoadingState");
const errorEl = document.getElementById("rcErrorState");
const emptyEl = document.getElementById("rcEmptyState");
const gridEl = document.getElementById("rcDesignsGrid");

rcPage = 0;
rcAllDesigns = [];
rcHasMore = true;

loadingEl.style.display = "flex";
errorEl.style.display = "none";
emptyEl.style.display = "none";
document.getElementById("rcEndOfResults").style.display = "none";
document.getElementById("rcLoadMoreError").style.display = "none";
gridEl.innerHTML = "";

try {
  const { content, isLast } = await rcFetchPage(rcPage);
  rcAllDesigns = content;
  rcHasMore = !isLast;
  rcPage++;

  loadingEl.style.display = "none";
  rcSyncSidebarFromState();
  rcApplyFilters();
} catch (err) {
  loadingEl.style.display = "none";
  if (err.message !== "unauthorized") errorEl.style.display = "flex";
}
}

// Called by the scroll sentinel once the user nears the bottom
async function rcLoadMore() {
if (!rcHasMore || rcIsLoadingMore) return;
rcIsLoadingMore = true;
document.getElementById("rcLoadMoreState").style.display = "flex";
document.getElementById("rcLoadMoreError").style.display = "none";

try {
  const { content, isLast } = await rcFetchPage(rcPage);
  rcAllDesigns = rcAllDesigns.concat(content);
  rcHasMore = !isLast;
  rcPage++;
  rcApplyFilters(); // re-render with the newly appended designs included
} catch (err) {
  if (err.message !== "unauthorized") document.getElementById("rcLoadMoreError").style.display = "block";
} finally {
  rcIsLoadingMore = false;
  document.getElementById("rcLoadMoreState").style.display = "none";
  if (!rcHasMore) document.getElementById("rcEndOfResults").style.display = "block";
}
}

function rcSyncSidebarFromState() {
document.querySelectorAll(".rc-type-check").forEach((cb) => { cb.checked = rcFilters.types.includes(cb.value); });
}

function rcApplyFilters() {
const term = rcFilters.search.toLowerCase();

let result = rcAllDesigns.filter((d) => {
  const matchSearch =
    (d.designCategory || "").toLowerCase().includes(term) ||
    (d.designType || "").toLowerCase().includes(term);

  const matchType = rcFilters.types.length === 0 || rcFilters.types.includes((d.designCategory || "").toLowerCase());

  const plotSize = `${d.length}X${d.width}`;
  const matchPlot = !rcFilters.plot || plotSize === rcFilters.plot;

  const numFloors = (d.floorList || []).length;
  const matchFloors = !rcFilters.floor ? true : rcFilters.floor === "4" ? numFloors >= 4 : numFloors.toString() === rcFilters.floor;

  const price = (d.builtUpArea || 0) * 5;
  let matchPrice = true;
  if (rcFilters.price) {
    const [min, max] = rcFilters.price.split("-");
    matchPrice = max ? (price >= parseInt(min) && price <= parseInt(max)) : price >= parseInt(min);
  }

  return matchSearch && matchType && matchPlot && matchFloors && matchPrice;
});

result = rcSortDesigns(result);
rcRenderGrid(result);
rcRenderChips();
}

function rcSortDesigns(list) {
const sorted = list.slice();
const priceOf = (d) => (d.builtUpArea || 0) * 5;
switch (rcFilters.sort) {
  case "price-asc": sorted.sort((a, b) => priceOf(a) - priceOf(b)); break;
  case "price-desc": sorted.sort((a, b) => priceOf(b) - priceOf(a)); break;
  case "rating-desc": sorted.sort((a, b) => (parseFloat(b.rating) || 4.5) - (parseFloat(a.rating) || 4.5)); break;
  case "area-desc": sorted.sort((a, b) => (b.totalArea || 0) - (a.totalArea || 0)); break;
  default: break; // relevance/featured: keep API order
}
return sorted;
}

function rcRenderGrid(designs) {
const gridEl = document.getElementById("rcDesignsGrid");
const emptyEl = document.getElementById("rcEmptyState");
const countEl = document.getElementById("rcToolbarCount");

countEl.innerHTML = `<strong>${designs.length}</strong> design${designs.length !== 1 ? "s" : ""} found`;

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

// Image protection (deterrents only — see chat: no web page can truly
// block a screenshot). draggable="false" + oncontextmenu blocks the
// easy "save image" paths; the watermark overlay is the one thing
// that survives an actual screenshot.
return `
  <div class="rc-design-card" data-design-id="${d.id}">
    <div class="rc-design-media rc-protected-media">
      ${img ? `<img src="${img}" alt="${d.designCategory || ""}" loading="lazy" draggable="false" oncontextmenu="return false;">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:44px;">🏠</div>`}
      <div class="rc-watermark-overlay"></div>
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

// ---------- Active filter chips ----------
const RC_TYPE_LABELS = { house: "House", villa: "Villa", apartment: "Apartment", "form-house": "Farm House", row_house: "Row House", duplex: "Duplex", commercial: "Commercial", "semi-commercial": "Semi-Commercial" };
const RC_PRICE_LABELS = { "0-5000": "₹0–₹5,000", "5000-10000": "₹5,000–₹10,000", "10000-15000": "₹10,000–₹15,000", "15000+": "₹15,000+" };

function rcRenderChips() {
const row = document.getElementById("rcChipRow");
const chips = [];

rcFilters.types.forEach((t) => chips.push({ label: RC_TYPE_LABELS[t] || t, clear: () => rcToggleType(t, false) }));
if (rcFilters.price) chips.push({ label: RC_PRICE_LABELS[rcFilters.price] || rcFilters.price, clear: () => { rcFilters.price = ""; document.querySelector('input[name="rcPrice"][value=""]').checked = true; rcApplyFilters(); } });
if (rcFilters.plot) chips.push({ label: rcFilters.plot.replace("X", " × "), clear: () => { rcFilters.plot = ""; document.querySelector('input[name="rcPlot"][value=""]').checked = true; rcApplyFilters(); } });
if (rcFilters.floor) chips.push({ label: `${rcFilters.floor}${rcFilters.floor === "4" ? "+" : ""} Floor${rcFilters.floor === "1" ? "" : "s"}`, clear: () => { rcFilters.floor = ""; document.querySelector('input[name="rcFloor"][value=""]').checked = true; rcApplyFilters(); } });
if (rcFilters.search) chips.push({ label: `"${rcFilters.search}"`, clear: () => { rcFilters.search = ""; document.getElementById("rcSideSearch").value = ""; rcApplyFilters(); } });

row.innerHTML = "";
chips.forEach((c) => {
  const el = document.createElement("span");
  el.className = "rc-chip";
  el.innerHTML = `${c.label} <button aria-label="Remove filter">&times;</button>`;
  el.querySelector("button").addEventListener("click", c.clear);
  row.appendChild(el);
});
}

function rcToggleType(value, checked) {
if (checked) {
  if (!rcFilters.types.includes(value)) rcFilters.types.push(value);
} else {
  rcFilters.types = rcFilters.types.filter((t) => t !== value);
}
rcSyncSidebarFromState();
rcApplyFilters();
}

// ---------- Wiring ----------
document.getElementById("rcSideSearch").addEventListener("input", (e) => { rcFilters.search = e.target.value; rcApplyFilters(); });
document.querySelectorAll(".rc-type-check").forEach((cb) => cb.addEventListener("change", (e) => rcToggleType(e.target.value, e.target.checked)));
document.querySelectorAll('input[name="rcPrice"]').forEach((r) => r.addEventListener("change", (e) => { rcFilters.price = e.target.value; rcApplyFilters(); }));
document.querySelectorAll('input[name="rcPlot"]').forEach((r) => r.addEventListener("change", (e) => { rcFilters.plot = e.target.value; rcApplyFilters(); }));
document.querySelectorAll('input[name="rcFloor"]').forEach((r) => r.addEventListener("change", (e) => { rcFilters.floor = e.target.value; rcApplyFilters(); }));
document.getElementById("rcSort").addEventListener("change", (e) => { rcFilters.sort = e.target.value; rcApplyFilters(); });
document.getElementById("rcRetryBtn").addEventListener("click", rcFetchDesigns);
document.getElementById("rcLoadMoreRetryBtn").addEventListener("click", rcLoadMore);
document.getElementById("rcSidebarClear").addEventListener("click", () => {
rcFilters = { search: "", types: [], price: "", plot: "", floor: "", sort: rcFilters.sort };
document.getElementById("rcSideSearch").value = "";
document.querySelectorAll(".rc-type-check").forEach((cb) => (cb.checked = false));
document.querySelector('input[name="rcPrice"][value=""]').checked = true;
document.querySelector('input[name="rcPlot"][value=""]').checked = true;
document.querySelector('input[name="rcFloor"][value=""]').checked = true;
rcApplyFilters();
});

// Mobile filter drawer
const rcSidebar = document.getElementById("rcSidebar");
const rcBackdrop = document.getElementById("rcFilterBackdrop");
document.getElementById("rcFilterToggle").addEventListener("click", () => { rcSidebar.classList.add("open"); rcBackdrop.classList.add("open"); });
rcBackdrop.addEventListener("click", () => { rcSidebar.classList.remove("open"); rcBackdrop.classList.remove("open"); });

// Infinite scroll: watch the sentinel below the grid, load the next page
// once it's ~400px from entering the viewport.
const rcScrollObserver = new IntersectionObserver((entries) => {
if (entries[0].isIntersecting) rcLoadMore();
}, { rootMargin: "400px" });
rcScrollObserver.observe(document.getElementById("rcScrollSentinel"));

// Extra deterrent: block right-click anywhere over a design image
// specifically (not the whole page, so normal browsing/text-selection
// elsewhere is unaffected).
document.addEventListener("contextmenu", (e) => {
if (e.target.closest(".rc-protected-media")) e.preventDefault();
});

// Kick off
rcFetchDesigns();
window.addEventListener("load", () => { if (window.lucide) lucide.createIcons(); });

// check token is expired
function rcIsTokenExpired(token) {
if (!token) return true;

try {
  const payloadBase64 = token.split(".")[1];
  if (!payloadBase64) return true;

  // JWTs use base64url — swap chars back to standard base64 before decoding
  const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
  const payload = JSON.parse(atob(base64));

  if (!payload.exp) return true; // no expiry claim = treat as expired/invalid

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowInSeconds;
} catch (error) {
  console.warn("RC: Could not decode token, treating as expired.", error);
  return true;
}
}