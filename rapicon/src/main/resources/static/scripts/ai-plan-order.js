    const sessionId = new URLSearchParams(window.location.search).get("sessionId");
    // send it with your create-order request and store it on the order

    var ORDER_PAGE   = '/ai-plan-order.html' + window.location.search;  // keeps ?sessionId
    var SUCCESS_PAGE = '/ai-plan-order.html' + window.location.search;  // or '/index.html', '/profile.html'

    // Sample drawings: replace these dummy URLs with your real files.
    // Images (.jpg/.png/.webp) show as thumbnails; anything else (e.g. PDF) shows as an "Open file" tile.
    var SAMPLE_DRAWINGS = [
      { title: "2D floor plan",       url: "https://rapicon-vendor-designs.s3.ap-south-1.amazonaws.com/designs/plans/1794994858906-drwaing.png" },
      { title: "3D elevation",        url: "https://rapicon-vendor-designs.s3.ap-south-1.amazonaws.com/designs/elevations/1794994857432-38x29%20elevation.png" },
      { title: "Working drawings",  url: "https://rapicon-vendor-designs.s3.ap-south-1.amazonaws.com/designs/plans/1794901453250-17nov%20str.png" },
      { title: "BOQ sheet (PDF)",     url: "https://ai-generated-plans.s3.ap-south-1.amazonaws.com/ai-generated-plans/1790764374115-rapicon-preliminary-boq.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2NPM3GXLU6ZOKWGD%2F20261121%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20261121T113654Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHwaCmFwLXNvdXRoLTEiSDBGAiEAm%2Bkyg%2BISm363Kk9UzcLO7zJuaita1qtUmm87MERQQDECIQDJSKGKbYiApfJoP4u5sCY1TkL1jEb%2Fxqxib%2FrJukgw%2FSrpAwhFEAAaDDcxNjE0NTYzNjgyMyIMj7hY%2B9S%2B2Hxcq0j3KsYDF3iWArYBXzj6xL5AvAtBvRTF6eyxndcBMSzP4q1bjvy56X97ONC48YpUW6W8jIXNIFmVcsZ%2FjMsM%2FQxibu6oF6UZ3ZUO8NEb4fzIDHDWop19RbnwMAfoO7d8IempRrDcYTT%2BlTmxpqyalDp8RgTESfHyHLEJ3RKciBacNerxzsvjtZ4WRRZxf4sNwxqyYmLh0bm3s6rFnIbURe77orkv0QQErjO7llSC39OO9t57fw6OzBO3itnXyciFao8%2Fg%2FJEZZUXM6Rh%2FTvUdpz%2BZOK0AIKUUBmr%2B7OTTQDoXABQeJecozy3dQzRyScQJVJxinAk6sM1LRSrEsfDXSRjZryB6bwm8VEBB89xTLcmLT%2BcPKpKC%2BMi6N%2BAX1ub7j4ZQ3pBXLc6wp3SWEUduCK7vRoCKWkSSyLGQAXfnEuMgnx1hqo8IZxFk7N%2FfPh%2BcxiU6cF7HT6R80vVzlTht5IuE5fEswzPpQH9C5VBxiP3yyx8iLaO0m6dNoTZjIHMi9hmOLQfS8RPIDIo%2FArNohwaua3YaQbvrzKLwFkioI3qT2W5aOoN7UHhryof19vnbw2ojDqXKhcN8p3h1au0bYk0m0qG4ECH%2F9EZ%2BTCqg4bYBjq5AonVLj%2Fk%2FFSvSszyhTH3OHduyxx8uRnNGrJaQ2VBa9oxq4lzeefYD250hJKTtaGYmbE5Yly48jZFIT%2BRvzlY2Did4z1SkBFlTJgDEUdYNyyLEcd2EefFEwnYJaNrUch5fFbjmioAc7RQejSbBksR3ODy2cav%2Ffo7lx5UY0BK%2BSGLBzwrLN0zGGtpZpSyEE0tOiJdqbZ8iKIRWVRXa6zCRgmjaTZ9ET8Ag040jsY5qmhLBYAq%2FunLh7SJuAwPx%2FgWs%2FpkhYZmZ1HD%2F7sjkVe8ILs1cBH7ko7Bky0Af48sZMznHNj%2FcgEGBGd8lWZ7n3TUGSqH%2F6%2BmYvNw58IaoM8wlT5VrfiAoJn%2F0VeYsGGAWIkHiJoL730hzu4L%2FHWtDXKg1NFJAnBD5WoxpAbVy1h%2BHcTyTww7yOA%2Bt%2FI%3D&X-Amz-Signature=024cad9881ed666e159b90a381af59749302c8a4ccfa6dbbbf142e933d5eb1d4&X-Amz-SignedHeaders=host&response-content-disposition=inline" }
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

    function closePhonePe() {
      try { window.PhonePeCheckout.closePage(); } catch (e) {}
    }

    function callback(response) {
      closePhonePe();                                   // close the iframe first
      if (response === 'USER_CANCEL') {
        showMessage.error("Payment is cancelled by user");
        setTimeout(function () { window.location.href = ORDER_PAGE; }, 2000);
      } else if (response === 'CONCLUDED') {
        checkOrderStatus(0);
      }
    }

    async function checkOrderStatus(attempt) {
      await new Promise(function (r) { setTimeout(r, 2000); });
      try {
        var res = await fetch(API.status + merchantOrderId, { method: 'GET', headers: authHeaders() });
        if (!res.ok) throw new Error('status failed');
        var status = await res.json();

        if (status.state === 'COMPLETED') {
          await verifyAndCompleteOrder(orderId, merchantOrderId, status);
        } else if (status.state === 'PENDING' && attempt < 5) {
          return checkOrderStatus(attempt + 1);          // poll up to ~5 more times
        } else if (status.state === 'PENDING') {
          await showMessage.alert('Payment is being processed. We will notify you once completed.');
          window.location.href = ORDER_PAGE;
        } else {
          showMessage.error('Payment failed. Please try again.');
          setTimeout(function () { window.location.href = ORDER_PAGE; }, 2000);
        }
      } catch (e) {
        await showMessage.alert('Failed to verify payment.');
        window.location.href = ORDER_PAGE;
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
        window.location.href = SUCCESS_PAGE;
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