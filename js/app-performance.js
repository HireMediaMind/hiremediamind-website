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
     Contact form (AJAX + fallback)
  --------------------------------*/
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var statusEl = document.getElementById("form-status");
    var btn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!btn) return form.submit();

      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending...";

      var fd = new FormData(form);

      fetch(form.action, {
        method: form.method || "POST",
        body: fd,
      })
        .then((res) => res.text())
        .then(() => {
          if (statusEl) {
            statusEl.style.display = "block";
            statusEl.className =
              "mt-6 p-6 rounded-lg text-center font-semibold bg-green-100 text-green-800";
            statusEl.innerHTML =
              "<p class='text-2xl mb-2'>🎉 Thank you — we’ll contact you shortly!</p>";
          }

          if (window.dataLayer) {
            window.dataLayer.push({ event: "contact_form_success" });
          }

          form.reset();
          setTimeout(() => (form.style.display = "none"), 1800);
        })
        .catch(() => {
          if (statusEl) {
            statusEl.style.display = "block";
            statusEl.className =
              "mt-6 p-6 rounded-lg text-center font-semibold bg-red-100 text-red-800";
            statusEl.innerHTML =
              "<p class='text-xl'>⚠️ Something went wrong. Try again.</p>";
          }

          btn.disabled = false;
          btn.textContent = original;
        });
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
        initContactForm();
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
