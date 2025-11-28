/*!
 * app-performance.js (v1.0)
 * Highly optimized production JS for HireMediaMind
 * Runs critical code immediately + heavy code on idle
 */

(function (window, document) {
  "use strict";

  /* -------------------------------
     Utility: Safe Logging
  --------------------------------*/
  var isProd =
    window.location.hostname === "www.hiremediamind.com" ||
    window.location.hostname === "hiremediamind.com";

  function log() {
    if (!isProd && console && console.log) {
      console.log.apply(console, arguments);
    }
  }

  /* -------------------------------
     Utility: run onIdle
  --------------------------------*/
  function onIdle(fn, opts) {
    try {
      if ("requestIdleCallback" in window)
        requestIdleCallback(fn, opts || { timeout: 2000 });
      else setTimeout(fn, 800);
    } catch (e) {
      setTimeout(fn, 800);
    }
  }

  window.HMM = window.HMM || {};
  window.HMM.onIdle = onIdle;

  /* -------------------------------
     Critical UI: mobile menu
  --------------------------------*/
  function initCriticalUI() {
    var mobileBtn = document.querySelector(".mobile-menu-button");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener("click", function (e) {
        e.preventDefault();
        mobileMenu.classList.toggle("menu-open");

        document.body.style.overflow = mobileMenu.classList.contains(
          "menu-open"
        )
          ? "hidden"
          : "";
      });
    }
  }

  /* -------------------------------
     Smooth anchor scrolling
  --------------------------------*/
  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (!href || href === "#") return;

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        var headerOffset = 85;
        var offset = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offset,
          behavior: "smooth",
        });

        if (window.dataLayer) {
          window.dataLayer.push({
            event: "anchor_click",
            section: href.replace("#", ""),
          });
        }
      });
    });
  }

  /* -------------------------------
     Header scroll effect
  --------------------------------*/
  function initHeaderScroll() {
    var header = document.querySelector("header");
    if (!header) return;

    var lastScroll = 0;

    window.addEventListener("scroll", function () {
      var current = window.pageYOffset || document.documentElement.scrollTop;

      if (current > lastScroll && current > 80) {
        header.classList.add("scrolled-up");
      } else {
        header.classList.remove("scrolled-up");
      }
      lastScroll = current <= 0 ? 0 : current;
    });
  }

  /* -------------------------------
     Currency Selector Hook
  --------------------------------*/
  function initCurrencySelector() {
    var selector = document.getElementById("currencySelector");
    if (!selector) return;

    selector.addEventListener("change", function (e) {
      try {
        if (typeof changeCurrency === "function") {
          changeCurrency(e.target.value);
        }

        if (window.dataLayer) {
          window.dataLayer.push({
            event: "currency_changed",
            currency: e.target.value,
          });
        }
      } catch (err) {
        log("Currency error:", err);
      }
    });
  }

  /* -------------------------------
     Analytics - runs on IDLE
  --------------------------------*/
  function initAnalytics() {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "page_loaded",
        url: window.location.pathname,
        title: document.title,
      });
    }
    log("Analytics initialized");
  }

  /* -------------------------------
     App Init
  --------------------------------*/
  function initApp() {
    try {
      initCriticalUI();
      initSmoothScroll();
      initHeaderScroll();
      initCurrencySelector();

      // Heavy tasks → run on idle
      onIdle(function () {
        initAnalytics();
      });
    } catch (e) {
      log("Init error:", e);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initApp, 50);
  } else {
    document.addEventListener("DOMContentLoaded", initApp);
  }
})(window, document);
