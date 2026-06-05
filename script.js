/* =========================================================
   Champagne Construction & Interlocking — interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---- Current year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky nav state + floating CTA ---- */
  var nav = document.getElementById("nav");
  var floatCta = document.querySelector(".float-cta");
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("is-stuck", y > 40);
    if (floatCta) floatCta.classList.toggle("is-visible", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.hidden = false;
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (menu) {
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---- Scroll reveal ---- */
  document.documentElement.classList.add("reveal-ready");
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Portfolio filtering ---- */
  var chips = document.querySelectorAll(".chip");
  var tiles = document.querySelectorAll("#workGrid .tile");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var filter = chip.getAttribute("data-filter");
      tiles.forEach(function (tile) {
        var match = filter === "all" || tile.getAttribute("data-cat") === filter;
        tile.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ---- Image handling: fade-in on load + premium fallback on error ---- */
  function premiumFallback(img) {
    // Build an elegant inline SVG so a missing/blocked image never shows a
    // broken-image box. Looks intentional: deep-green -> gold gradient + monogram.
    var label = (img.getAttribute("alt") || "Champagne Construction")
      .replace(/&/g, "and").slice(0, 46);
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
      '<defs>' +
      '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#16291d"/><stop offset="0.6" stop-color="#1d3a29"/>' +
      '<stop offset="1" stop-color="#2a5640"/></linearGradient>' +
      '<pattern id="p" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<line x1="0" y1="0" x2="0" y2="46" stroke="#c9a96a" stroke-opacity="0.06" stroke-width="2"/></pattern>' +
      '</defs>' +
      '<rect width="800" height="600" fill="url(#g)"/>' +
      '<rect width="800" height="600" fill="url(#p)"/>' +
      '<circle cx="400" cy="262" r="58" fill="none" stroke="#c9a96a" stroke-opacity="0.5" stroke-width="2"/>' +
      '<text x="400" y="284" font-family="Georgia,serif" font-size="64" fill="#e3cf9f" text-anchor="middle">C</text>' +
      '<text x="400" y="368" font-family="Inter,Arial,sans-serif" font-size="20" letter-spacing="2" fill="#cdd8d0" text-anchor="middle">CHAMPAGNE CONSTRUCTION</text>' +
      '<text x="400" y="398" font-family="Inter,Arial,sans-serif" font-size="15" fill="#7d9b86" text-anchor="middle">' +
      label.replace(/[<>&]/g, "") + '</text>' +
      '</svg>';
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    img.classList.add("is-loaded", "is-fallback");
  }

  document.querySelectorAll("img").forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("is-loaded");
    } else {
      img.addEventListener("load", function () { img.classList.add("is-loaded"); }, { once: true });
      img.addEventListener("error", function () {
        if (!img.classList.contains("is-fallback")) premiumFallback(img);
      }, { once: true });
    }
  });

  /* ---- Parallax on full-width image bands ---- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var parallaxEls = reduceMotion ? [] : document.querySelectorAll("[data-parallax]");
  var ticking = false;
  function applyParallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) return;
      var progress = (rect.top + rect.height / 2 - vh / 2) / vh; // -1..1
      el.style.transform = "translate3d(0," + (progress * -42).toFixed(1) + "px,0) scale(1.18)";
    });
    ticking = false;
  }
  function requestParallax() {
    if (!ticking) { window.requestAnimationFrame(applyParallax); ticking = true; }
  }
  if (parallaxEls.length) {
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax, { passive: true });
    applyParallax();
  }

  /* ---- Lead form (front-end only, demo) ---- */
  var form = document.getElementById("leadForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      ["name", "email"].forEach(function (id) {
        var field = document.getElementById(id);
        if (!field) return;
        var ok = field.value.trim() !== "" &&
          (id !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        field.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        if (note) { note.textContent = "Please enter your name and a valid email."; note.classList.remove("success"); }
        return;
      }

      if (note) {
        note.textContent = "Thank you! Your request has been received — we'll be in touch within one business day. (Demo form: no data is sent.)";
        note.classList.add("success");
      }
      form.reset();
    });

    form.querySelectorAll("input, select, textarea").forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("invalid"); });
    });
  }
})();
