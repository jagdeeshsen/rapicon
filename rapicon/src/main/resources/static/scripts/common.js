/* ==========================================================================
   Rapicon — common.js
   Shared across every page. Handles:
     - Token storage / retrieval
     - JWT expiry checking
     - Login state checks
     - Logout
     - Auto-wiring the header "Account" icon link
     - Auth headers for authenticated fetch() calls
     - Optional page-guard for pages that require login

   Include this file on EVERY page, before any page-specific script that
   uses these functions:
     <script src="js/common.js"></script>
   ========================================================================== */

(function () {
  "use strict";

  const RC_TOKEN_KEY = "user_token";
  const RC_USER_ID_KEY = "user_id";

  // --------------------------------------------------
  // TOKEN DECODE / EXPIRY
  // --------------------------------------------------

  /**
   * Decodes a JWT and checks whether it has expired.
   * Returns true if expired, missing, or malformed.
   */
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

  /**
   * Decodes and returns a JWT's payload, or null if missing/invalid.
   * Useful for reading claims like user id, role, email, etc.
   */
  function rcDecodeToken(token) {
    if (!token) return null;

    try {
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return null;

      const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (error) {
      console.warn("RC: Could not decode token.", error);
      return null;
    }
  }

  // --------------------------------------------------
  // TOKEN / USER STORAGE
  // --------------------------------------------------

  /**
   * Returns the stored token, or null if it's missing or expired.
   * Automatically clears an expired token from localStorage.
   */
  function rcGetToken() {
    let token = null;

    try {
      token = localStorage.getItem(RC_TOKEN_KEY);
    } catch (error) {
      console.warn("RC: localStorage unavailable.", error);
      return null;
    }

    if (token && rcIsTokenExpired(token)) {
      rcLogout(); // clears token + user id together
      return null;
    }

    return token;
  }

  function rcSetToken(token) {
    try {
      localStorage.setItem(RC_TOKEN_KEY, token);
    } catch (error) {
      console.warn("RC: Could not save token.", error);
    }
  }

  function rcGetUserId() {
    try {
      return localStorage.getItem(RC_USER_ID_KEY);
    } catch (error) {
      return null;
    }
  }

  function rcSetUserId(userId) {
    try {
      localStorage.setItem(RC_USER_ID_KEY, userId);
    } catch (error) {
      console.warn("RC: Could not save user id.", error);
    }
  }

  /** Clears all stored auth state. Call this on logout or expiry. */
  function rcLogout(redirectUrl) {
    try {
      localStorage.removeItem(RC_TOKEN_KEY);
      localStorage.removeItem(RC_USER_ID_KEY);
    } catch (error) {
      console.warn("RC: Could not clear auth state.", error);
    }

    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }

  // --------------------------------------------------
  // LOGIN STATE
  // --------------------------------------------------

  /** True only if a token exists AND is not expired. */
  function rcIsLoggedIn() {
    return !!rcGetToken();
  }

  /**
   * Returns a ready-to-spread headers object for authenticated fetch calls.
   * Usage: fetch(url, { headers: { ...rcAuthHeader(), "Content-Type": "application/json" } })
   */
  function rcAuthHeader() {
    const token = rcGetToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Guards a page that requires login. Call at the top of a protected
   * page's script. Redirects to login (preserving return path) if not
   * logged in.
   */
  function rcRequireAuth(loginUrl) {
    loginUrl = loginUrl || "otp-login.html";

    if (!rcIsLoggedIn()) {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${loginUrl}?redirect=${returnTo}`;
      return false;
    }
    return true;
  }

  // --------------------------------------------------
  // HEADER ACCOUNT LINK AUTO-WIRING
  // --------------------------------------------------

  /**
   * Finds the header account icon (id="rcAccountLink") on the current page
   * and points it at the profile page if logged in, or the login page if
   * not. Safe to call on every page — does nothing if the element isn't
   * present.
   */
  function rcWireAccountLink(options) {
    options = options || {};
    const profileUrl = options.profileUrl || "profile.html";
    const loginUrl = options.loginUrl || "otp-login.html";

    const accountLink = document.getElementById("rcAccountLink");
    if (!accountLink) return;

    if (rcIsLoggedIn()) {
      accountLink.href = profileUrl;
      accountLink.setAttribute("aria-label", "My Profile");
    } else {
      accountLink.href = loginUrl;
      accountLink.setAttribute("aria-label", "Log In");
    }
  }

  // --------------------------------------------------
  // AUTO-INIT ON EVERY PAGE
  // --------------------------------------------------

  document.addEventListener("DOMContentLoaded", function () {
    rcWireAccountLink();
  });

  // --------------------------------------------------
  // EXPOSE PUBLIC API
  // --------------------------------------------------

  window.rcGetToken = rcGetToken;
  window.rcSetToken = rcSetToken;
  window.rcGetUserId = rcGetUserId;
  window.rcSetUserId = rcSetUserId;
  window.rcIsTokenExpired = rcIsTokenExpired;
  window.rcDecodeToken = rcDecodeToken;
  window.rcIsLoggedIn = rcIsLoggedIn;
  window.rcLogout = rcLogout;
  window.rcAuthHeader = rcAuthHeader;
  window.rcRequireAuth = rcRequireAuth;
  window.rcWireAccountLink = rcWireAccountLink;
})();