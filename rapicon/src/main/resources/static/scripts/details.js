const RC_TOKEN_KEY = "user_token";
  function rcGetToken() { return localStorage.getItem(RC_TOKEN_KEY); }
  function rcIsLoggedIn() { return !!rcGetToken(); }

  /* ==========================================================================
     Normalize whatever was stored in sessionStorage("selectedDesign") into
     the flatter shape this page renders.
     ========================================================================== */
  function rcNormalizeDesign(raw) {
    if (!raw) return null;
    const floors = raw.floors || raw.floorList || [];

    let bedrooms = 0, bathrooms = 0, hall = 0, kitchens = 0, businessUnits = 0;
    floors.forEach((f) => {
      bedrooms += parseInt(f.bedrooms || "0") || 0;
      bathrooms += parseInt(f.bathrooms || "0") || 0;
      hall += parseInt(f.hall || "0") || 0;
      kitchens += parseInt(f.kitchen || f.kitchens || "0") || 0;
      businessUnits += parseInt(f.businessUnits || "0") || 0;
    });

    const builtUpArea = raw.builtUpArea || 0;

    return {
      id: raw.id,
      category: raw.category || raw.designCategory || "",
      type: raw.type || raw.designType || "Residential",
      plotSize: raw.plotSize || `${raw.length || "?"}X${raw.width || "?"}`,
      totalArea: raw.totalArea || "",
      builtUpArea,
      price: raw.price || builtUpArea * 5,
      elevationUrls: raw.elevationUrls || [],
      twoDPlanUrls: raw.twoDPlanUrls || [],
      floors,
      bedrooms: raw.bedrooms ?? bedrooms,
      bathrooms: raw.bathrooms ?? bathrooms,
      hall: raw.hall ?? hall,
      kitchens: raw.kitchens ?? kitchens,
      businessUnits: raw.businessUnits ?? businessUnits,
      parking: raw.parking || "",
      plotFacing: raw.plotFacing || "",
      plotLocation: raw.plotLocation || "",
      description: raw.description || "",
    };
  }

  let design = null;
  let activeImage = 0;
  let allImages = [];

  function rcInit() {
    const raw = sessionStorage.getItem("selectedDesign");
    if (!raw) { rcShowEmpty(); return; }
    try {
      design = rcNormalizeDesign(JSON.parse(raw));
    } catch {
      rcShowEmpty();
      return;
    }
    if (!design) { rcShowEmpty(); return; }

    allImages = [...(design.elevationUrls || [])];
    document.getElementById("rcDetailRoot").style.display = "block";
    rcRenderAll();
  }

  function rcShowEmpty() {
    document.getElementById("rcDetailEmpty").style.display = "flex";
    if (window.lucide) lucide.createIcons();
  }

  function rcRenderAll() {
    const isCommercial = (design.type || "").toUpperCase() === "COMMERCIAL";
    const isResidential = ["RESIDENTIAL", "SEMI-COMMERCIAL"].includes((design.type || "").toUpperCase());

    // Breadcrumb
    document.getElementById("rcCrumbType").textContent = (design.type || "Designs").toLowerCase();
    document.getElementById("rcCrumbCategory").textContent = design.category;

    // Gallery
    rcRenderGallery();

    // Title
    document.getElementById("rcTitle").textContent = design.category;
    document.getElementById("rcGalleryBadge").textContent = design.type || "Residential";

    // Specs mini grid
    const floorsCount = (design.floors || []).length;
    const specs = [
      { icon: "map-pin", label: "Plot", value: `${design.plotSize} ft` },
      { icon: "layers", label: "Floors", value: `${floorsCount} Floor${floorsCount !== 1 ? "s" : ""}` },
      { icon: "maximize", label: "Total Area", value: `${design.totalArea} sq ft` },
    ];
    if (isResidential) {
      specs.push({ icon: "bed-double", label: "Bedrooms", value: `${design.bedrooms} BHK` });
      specs.push({ icon: "bath", label: "Bathrooms", value: `${design.bathrooms} Bath` });
    }
    if (isCommercial) specs.push({ icon: "building", label: "Bus. Units", value: `${design.businessUnits}` });
    specs.push({ icon: "compass", label: "Facing", value: design.plotFacing || "N/A" });

    document.getElementById("rcSpecsMini").innerHTML = specs.map((s) =>
      `<div class="rc-spec-mini"><i data-lucide="${s.icon}" width="14" height="14"></i><div class="label">${s.label}</div><div class="value">${s.value}</div></div>`
    ).join("");

    // Price box
    document.getElementById("rcPrice").textContent = `₹${(design.price || 0).toLocaleString("en-IN")}`;
    document.getElementById("rcPriceSub").textContent = `Based on ${design.builtUpArea} sq ft built-up area · No hidden charges.`;
    document.getElementById("rcMobilePrice").textContent = `₹${(design.price || 0).toLocaleString("en-IN")}`;

    // Overview tab
    document.getElementById("rcDescription").textContent = design.description ||
      `A thoughtfully designed ${design.category} for a ${design.plotSize} ft plot, offering modern aesthetics and practical functionality across ${floorsCount} floor${floorsCount !== 1 ? "s" : ""}.`;
    const overviewCells = [
      { label: "Plot Size", value: `${design.plotSize} ft` },
      { label: "Total Area", value: `${design.totalArea} sq ft` },
      { label: "Built-Up Area", value: `${design.builtUpArea} sq ft` },
      { label: "No. of Floors", value: `${floorsCount}` },
      { label: "Plot Facing", value: design.plotFacing || "N/A" },
      { label: "Plot Location", value: design.plotLocation || "N/A" },
    ];
    document.getElementById("rcOverviewGrid").innerHTML = overviewCells.map((s) =>
      `<div class="rc-overview-cell"><div class="label">${s.label}</div><div class="value">${s.value}</div></div>`
    ).join("");

    // Floor plans tab — blurred so full detail isn't visible pre-purchase
    const planGrid = document.getElementById("rcPlanGrid");
    const noPlans = document.getElementById("rcNoPlans");
    if ((design.twoDPlanUrls || []).length > 0) {
      planGrid.innerHTML = design.twoDPlanUrls.map((url, i) =>
        `<div class="rc-plan-card"><img src="${url}" alt="Floor plan ${i+1}" class="rc-plan-blur" draggable="false"><div class="cap">${(design.floors[i] && design.floors[i].name) || `Floor ${i+1}`}</div></div>`
      ).join("");
      noPlans.style.display = "none";
    } else {
      planGrid.innerHTML = "";
      noPlans.style.display = "block";
    }

    // Specs tab
    const specRows = [
      { label: "Design Category", value: design.category },
      { label: "Design Type", value: design.type },
      { label: "Plot Size", value: `${design.plotSize} ft` },
      { label: "Total Area", value: `${design.totalArea} sq ft` },
      { label: "Built-Up Area", value: `${design.builtUpArea} sq ft` },
      { label: "No. of Floors", value: String(floorsCount) },
    ];
    if (isResidential) {
      specRows.push({ label: "Bedrooms", value: String(design.bedrooms) });
      specRows.push({ label: "Bathrooms", value: String(design.bathrooms) });
      specRows.push({ label: "Hall", value: String(design.hall) });
      specRows.push({ label: "Kitchen", value: String(design.kitchens) });
    }
    if (isCommercial) specRows.push({ label: "Business Units", value: String(design.businessUnits) });
    specRows.push({ label: "Plot Facing", value: design.plotFacing || "N/A" });
    specRows.push({ label: "Parking", value: design.parking ? `${design.parking} Car` : "N/A" });

    document.getElementById("rcSpecsTable").innerHTML = specRows.map((s) =>
      `<div class="row"><span class="k">${s.label}</span><span class="v">${s.value}</span></div>`
    ).join("");

    // Floor details tab
    const floorsList = document.getElementById("rcFloorsList");
    const noFloors = document.getElementById("rcNoFloors");
    if (floorsCount > 0) {
      floorsList.innerHTML = design.floors.map((f, i) => {
        const stats = [];
        if (isResidential && parseInt(f.bedrooms) > 0) stats.push(`<div><span class="k">Bedrooms: </span><strong>${f.bedrooms}</strong></div>`);
        if (isResidential && parseInt(f.bathrooms) > 0) stats.push(`<div><span class="k">Bathrooms: </span><strong>${f.bathrooms}</strong></div>`);
        if (parseInt(f.hall) > 0) stats.push(`<div><span class="k">Hall: </span><strong>${f.hall}</strong></div>`);
        if (parseInt(f.kitchen) > 0) stats.push(`<div><span class="k">Kitchen: </span><strong>${f.kitchen}</strong></div>`);
        if (isCommercial && parseInt(f.businessUnits) > 0) stats.push(`<div><span class="k">Business Units: </span><strong>${f.businessUnits}</strong></div>`);
        return `<div class="rc-floor-card">
          <h3><i data-lucide="layers" width="14" height="14"></i>${f.name || `Floor ${i+1}`}</h3>
          <div class="rc-floor-stats">${stats.join("")}</div>
          ${f.other ? `<p class="other">${f.other}</p>` : ""}
        </div>`;
      }).join("");
      noFloors.style.display = "none";
    } else {
      floorsList.innerHTML = "";
      noFloors.style.display = "block";
    }

    if (window.lucide) lucide.createIcons();
  }

  function rcRenderGallery() {
    const mainImg = document.getElementById("rcMainImage");

    mainImg.draggable = false;
    const emptyEl = document.getElementById("rcGalleryEmpty");
    const prevBtn = document.getElementById("rcPrevImg");
    const nextBtn = document.getElementById("rcNextImg");
    const countEl = document.getElementById("rcGalleryCount");
    const thumbsEl = document.getElementById("rcGalleryThumbs");

    if (allImages[activeImage]) {
      mainImg.src = allImages[activeImage];
      mainImg.alt = `${design.category} view ${activeImage + 1}`;
      mainImg.style.display = "block";
      emptyEl.style.display = "none";
    } else {
      mainImg.style.display = "none";
      emptyEl.style.display = "flex";
    }

    if (allImages.length > 1) {
      prevBtn.style.display = "flex";
      nextBtn.style.display = "flex";
      countEl.style.display = "block";
      countEl.textContent = `${activeImage + 1} / ${allImages.length}`;
      thumbsEl.innerHTML = allImages.map((img, i) =>
        `<button class="rc-gallery-thumb ${i === activeImage ? 'active' : ''}" data-idx="${i}"><img src="${img}" alt="" draggable="false"></button>`
      ).join("");
      thumbsEl.querySelectorAll("[data-idx]").forEach((btn) => {
        btn.addEventListener("click", () => { activeImage = parseInt(btn.dataset.idx); rcRenderGallery(); });
      });
    } else {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
      countEl.style.display = "none";
      thumbsEl.innerHTML = "";
    }
  }

  document.getElementById("rcPrevImg").addEventListener("click", () => { activeImage = activeImage === 0 ? allImages.length - 1 : activeImage - 1; rcRenderGallery(); });
  document.getElementById("rcNextImg").addEventListener("click", () => { activeImage = activeImage === allImages.length - 1 ? 0 : activeImage + 1; rcRenderGallery(); });

  // Tabs
  document.querySelectorAll(".rc-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".rc-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".rc-tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("rcPanel" + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)).classList.add("active");
    });
  });

  function rcHandlePackages() {
    window.location.href = "/package.html";
  }

  // Block right-click "Save image as", drag-to-desktop, and long-press save
  // on gallery + floor plan images. This is a deterrent, not real security —
  // anyone using DevTools or the network tab can still get the file.
  document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".rc-gallery-main, .rc-gallery-thumb, .rc-plan-card")) {
      e.preventDefault();
    }
  });

  document.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "IMG" && e.target.closest(".rc-gallery-main, .rc-gallery-thumb, .rc-plan-card")) {
      e.preventDefault();
    }
  });

  document.getElementById("rcViewPackages").addEventListener("click", rcHandlePackages);
  document.getElementById("rcMobilePackages").addEventListener("click", rcHandlePackages);
  document.getElementById("rcAskQuestion").addEventListener("click", () => { window.location.href = "contact.html"; });
  document.getElementById("rcShare").addEventListener("click", () => {
    if (navigator.share) {
      navigator.share({ title: design ? design.category : "Rapicon Design", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    }
  });

  rcInit();
  window.addEventListener("load", () => { if (window.lucide) lucide.createIcons(); });