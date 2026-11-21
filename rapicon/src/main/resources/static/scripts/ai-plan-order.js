    const sessionId = new URLSearchParams(window.location.search).get("sessionId");
    // send it with your create-order request and store it on the order

    // Sample drawings: replace these dummy URLs with your real files.
    // Images (.jpg/.png/.webp) show as thumbnails; anything else (e.g. PDF) shows as an "Open file" tile.
    var SAMPLE_DRAWINGS = [
      { title: "2D floor plan",       url: "https://ai-generated-plans.s3.ap-south-1.amazonaws.com/ai-generated-plans/1795254608992-ai-architecture-plan.png" },
      { title: "3D elevation",        url: "https://ai-generated-plans.s3.ap-south-1.amazonaws.com/ai-generated-plans/1795254791091-ai-architecture-plan.png" },
      { title: "Working drawings",  url: "https://ai-generated-plans.s3.ap-south-1.amazonaws.com/ai-generated-plans/1795255023003-ai-architecture-plan.png" },
      { title: "BOQ sheet (PDF)",     url: "https://ai-generated-plans.s3.ap-south-1.amazonaws.com/ai-generated-plans/1795255054126-rapicon-preliminary-boq.pdf" }
    ];


    var API = {
      plans:  '/api/v1/ai/plans',
      promo:  '/api/promo/redeem',
      order:  '/api/ai/order',
      pay:    '/api/payment/phonePe/initiate',
      status: '/api/payment/phonePe/status/',
      verify: '/api/ai/verify-payment'
    };

    // Map one plan object from your API into what the page needs.
    function normalizePlan(p) {
      return {
        id: p.id,
        name: p.name || p.planName || 'Plan',
        price: Number(p.price != null ? p.price : p.amount) || 0,
        desc: p.description || p.desc || 'One-time payment',
        tag: p.tag || p.badge || '',
        includes: p.includes || p.features || []
      };
    }

    var PLANS = [], cur = null, applied = null, promoData = null;
    var merchantOrderId, orderId;
    var $ = function (i) { return document.getElementById(i); };
    function inr(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
    function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
    function authHeaders() {
      return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + rcGetToken() };
    }
    var CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';

    /* ---------- Login check (before promo + payment calls) ---------- */
    async function requireLogin() {
      if (!rcIsLoggedIn() || !rcGetToken()) {
        await showMessage.alert('Please login to continue');
        setTimeout(function () { window.location.href = '/otp-login.html'; }, 2000);
        return false;
      }
      return true;
    }

    /* ---------- Fetch plans ---------- */
    async function loadPlans() {
      $("plans").innerHTML = '<p class="rc-loading">Loading plans…</p>';
      $("pay").disabled = true; $("apply").disabled = true;
      try {
        var headers = {};
        if (rcGetToken()) headers['Authorization'] = 'Bearer ' + rcGetToken();
        var res = await fetch(API.plans, { headers: headers });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var data = await res.json();
        PLANS = (Array.isArray(data) ? data : (data.plans || [])).map(normalizePlan);
        if (!PLANS.length) throw new Error('No plans');
        cur = PLANS[0];
        $("apply").disabled = false; $("pay").disabled = false;
        render();
      } catch (e) {
        $("plans").innerHTML = '<div class="rc-plans-err">Could not load plans. ' +
          '<button class="btn-outline-ink" id="retryPlans" type="button">Retry</button></div>';
      }
    }

    /* ---------- Rendering ---------- */
   function inr(n) { return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
   function discount() { return (cur && applied && promoData) ? Number(promoData.discountAmount) : 0; }
   function clearPromo() { applied = null; promoData = null; }

    function render() {
      if (!cur) return;
      $("plans").innerHTML = PLANS.map(function (p) {
        return '<button class="rc-plan" role="radio" aria-checked="' + (p === cur) + '" data-id="' + esc(String(p.id)) + '">' +
          (p.tag ? '<span class="rc-tag">' + esc(p.tag) + '</span>' : '') +
          '<div class="n">' + esc(p.name) + '</div><div class="p">' + inr(p.price) + '</div><div class="d">' + esc(p.desc) + '</div></button>';
      }).join("");
      $("inc").innerHTML = PLANS.map(function (p) {
        return '<div class="rc-inc-col' + (p === cur ? ' on' : '') + '"><h3>' + esc(p.name) + ' · ' + inr(p.price) + '</h3><ul>' +
          p.includes.map(function (i) { return '<li>' + CHECK + '<span>' + esc(i) + '</span></li>'; }).join("") + '</ul></div>';
      }).join("");
      var total = (applied && promoData) ? Number(promoData.payableAmount) : cur.price;

      $("pname").textContent = cur.name + " plan";
      $("sub2").textContent = inr((applied && promoData) ? promoData.subtotal : cur.price);
      $("drow").hidden = !applied;
      $("dname").textContent = "Promo " + (applied || "");
      $("damt").textContent = "−" + inr(discount());
      $("total").textContent = inr(total);
      $("pay").textContent = "Pay " + inr(total);
    }
    function say(t, c) { $("msg").textContent = t; $("msg").className = "rc-msg " + (c || ""); }

    /* ---------- Promo code API ---------- */
    async function applyCode(code) {
      if (!cur) return;
      if (!(await requireLogin())) return;

      var planAtRequest = cur;          // ignore the reply if the user switches plan meanwhile
      var btn = $("apply");
      btn.disabled = true;
      try {
        var res = await fetch(API.promo, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ code: code, packageName: planAtRequest.name })
        });
        var data = await res.json().catch(function () { return {}; });
        if (cur !== planAtRequest) return;

        if (!res.ok) {
          clearPromo();
          say(data.message || data.error || "That code isn’t valid or has expired.", "err");
          return;
        }

        applied = code;
        promoData = data;   // { promoId, subtotal, discountType, discountAmount, payableAmount }
        say("Code applied — you saved " + inr(data.discountAmount) + ".", "ok");
      } catch (e) {
        if (cur === planAtRequest) say("Could not check the code. Please try again.", "err");
      } finally {
        btn.disabled = false;
        render();
      }
    }

    /* ---------- Events ---------- */
    $("plans").addEventListener("click", function (e) {
      if (e.target.closest("#retryPlans")) { loadPlans(); return; }
      var b = e.target.closest(".rc-plan"); if (!b) return;
      cur = PLANS.filter(function (p) { return String(p.id) === b.dataset.id; })[0] || cur;

      var code = applied;
      promoData = null;                 // hide the old discount until the server answers
      render();
      if (code) applyCode(code);
    });

    $("tgl").addEventListener("click", function () {
      var open = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", String(!open));
      $("inc").hidden = open;
    });
    $("apply").addEventListener("click", function () {
      var v = $("code").value.trim().toUpperCase();
      if (!v) { say("Enter a promo code first.", "err"); return; }
      applyCode(v);
    });
    $("code").addEventListener("keydown", function (e) { if (e.key === "Enter") $("apply").click(); });
    $("navToggle").addEventListener("click", function () {
      var o = $("hdr").classList.toggle("rc-nav-open");
      this.innerHTML = o ? "&#10005;" : "&#9776;";
      this.setAttribute("aria-expanded", String(o));
    });

    /* ---------- Pay: create order -> PhonePe (same flow as cart.js) ---------- */
    $("pay").addEventListener("click", async function () {
      if (!cur) return;
      if (!(await requireLogin())) return;
      var btn = $("pay");
      btn.disabled = true;
      try {
        showPaymentVerificationLoader();

        // Create order
        var orderRes = await fetch(API.order, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ userId: rcGetUserId(), promoId: promoData.promoId, subtotal: promoData.subtotal,
           discountAmount: promoData.discountAmount, totalAmount: promoData.payableAmount, sessionId: sessionId, packageName : cur.name})
        });
        if (!orderRes.ok) throw new Error('Failed to create order');
        var order = await orderRes.json();

        // print order response
        console.log(order);
        merchantOrderId = order.merchantId;
        orderId = order.orderId;

        var payRes = await fetch(API.pay, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            merchantOrderId: order.merchantId || ('ORD' + Date.now()),
            amount: order.payableAmount, // paisa
            metaInfo: {
              udf1: order.orderId || '',
              udf2: order.merchantId || ''
            },
            aiOrderPayment: true
          })
        });
        if (!payRes.ok) throw new Error('Failed to initiate payment');
        var pay = await payRes.json();
        if (!pay.redirectUrl) throw new Error(pay.message || 'Payment initiation failed');

        hidePaymentVerificationLoader();
        window.PhonePeCheckout.transact({ tokenUrl: pay.redirectUrl, callback: callback, type: "IFRAME" });
      } catch (err) {
        hidePaymentVerificationLoader();
        showMessage.error('Failed to process checkout: ' + err.message);
      } finally {
        btn.disabled = false;
      }
    });

    function callback(response) {
      if (response === 'USER_CANCEL') {
        showMessage.error("Payment is cancelled by user");
        setTimeout(function () { window.location.href = '/ai-plan-order.html'; }, 2000);
      } else if (response === 'CONCLUDED') {
        showMessage.success("Payment successfully!");
        checkOrderStatus();
      }
    }

    async function checkOrderStatus() {
      await new Promise(function (r) { setTimeout(r, 2000); }); // let PhonePe process
      try {
        var res = await fetch(API.status + merchantOrderId, { method: 'GET', headers: authHeaders() });
        if (!res.ok) { showMessage.error('Failed to verify payment status'); return; }
        var status = await res.json();

        if (status.state === 'COMPLETED') {
          await verifyAndCompleteOrder(orderId, merchantOrderId, status);
        } else if (status.state === 'FAILED') {
          showMessage.error('Payment failed. Please try again.');
        } else if (status.state === 'PENDING') {
          await showMessage.alert('Payment is being processed. We will notify you once completed.');
        }
      } catch (e) {
        await showMessage.alert('Failed to verify payment.');
      }
    }

    async function verifyAndCompleteOrder(orderId, merchantOrderId, paymentStatus) {
      try {
        var res = await fetch(API.verify, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            orderId: orderId,
            merchantOrderId: merchantOrderId,
            phonePeOrderId: paymentStatus.orderId,
            paymentState: paymentStatus.state,
            amount: paymentStatus.amount,
            paymentDetails: paymentStatus.paymentDetails
          })
        });
        if (!res.ok) { showMessage.error('Payment verification failed'); return; }
        await res.json();

        await showMessage.alert('Payment successful! Your order has been placed.', { title: 'success', type: 'success' });
        sessionStorage.setItem('completedOrder', JSON.stringify({
          orderId: orderId, merchantOrderId: merchantOrderId,
          amount: paymentStatus.amount, timestamp: new Date().toISOString()
        }));
        window.location.href = '/index.html';
      } catch (e) {
        await showMessage.alert('Payment completed but verification failed. Please contact support.');
      }
    }

    /* ---------- Loader ---------- */
    function showPaymentVerificationLoader() {
      var l = document.createElement('div');
      l.id = 'payment-verification-loader';
      l.style.cssText = 'position:fixed;inset:0;background:rgba(28,25,23,.7);display:flex;justify-content:center;align-items:center;z-index:10000';
      l.innerHTML =
        '<div style="background:#fff;padding:30px;text-align:center">' +
        '<div style="border:4px solid #f3f3f3;border-top:4px solid #C4A882;border-radius:50%;width:50px;height:50px;animation:rc-spin 1s linear infinite;margin:0 auto 20px"></div>' +
        '<p style="font-size:16px;margin:0">Processing Payment...</p>' +
        '<p style="color:#6B6560;font-size:14px;margin:10px 0 0">Please wait</p></div>';
      document.body.appendChild(l);
    }
    function hidePaymentVerificationLoader() {
      var l = document.getElementById('payment-verification-loader');
      if (l) l.remove();
    }

    /* ---------- Sample drawings ---------- */
    function safeUrl(u) {
      return /^https?:\/\//i.test(u) ? String(u).replace(/"/g, '%22') : '';
    }
    function isImage(u) { return /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(u); }

    function openSamples() {
      $("samplesTitle").textContent = "Sample drawings";
      $("samplesGrid").innerHTML = SAMPLE_DRAWINGS.map(function (s, i) {
        var url = safeUrl(s.url);
        if (!url) return '';
        var label = s.title || ('Sample ' + (i + 1));
        return '<a class="rc-sample" href="' + url + '" target="_blank" rel="noopener">' +
          (isImage(url)
            ? '<img src="' + url + '" alt="' + esc(label) + '" loading="lazy">'
            : '<div class="rc-sample-doc">Open file</div>') +
          '<span>' + esc(label) + '</span></a>';
      }).join('');
      $("samplesModal").hidden = false;
    }

    function closeSamples() { $("samplesModal").hidden = true; }

    $("samplesBtn").addEventListener("click", openSamples);
    $("samplesClose").addEventListener("click", closeSamples);
    $("samplesModal").addEventListener("click", function (e) { if (e.target === this) closeSamples(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSamples(); });

    /* ---------- Init ---------- */
    document.addEventListener('DOMContentLoaded', function () {
      $("accountLink").href = rcIsLoggedIn() ? 'profile.html' : 'otp-login.html';
      $("samplesBtn").hidden = !SAMPLE_DRAWINGS.length;
      loadPlans();
    });

    $("promoHint").addEventListener("click", function () {
      $("code").value = this.textContent.trim();
      $("code").focus();
    });