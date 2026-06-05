(function () {
  "use strict";

  /* ---- Sticky header + float CTA ---- */
  var header   = document.getElementById("header");
  var floatBtn = document.getElementById("floatCall");
  function onScroll() {
    var y = window.scrollY;
    if (header)   header.classList.toggle("is-scrolled", y > 10);
    if (floatBtn) floatBtn.classList.toggle("is-visible", y > 560);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Image load fade ---- */
  function imgLoaded(img) { img.classList.add("loaded"); }
  document.querySelectorAll("img").forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) {
      imgLoaded(img);
    } else {
      img.addEventListener("load",  function () { imgLoaded(img); }, { once: true });
      img.addEventListener("error", function () {
        /* Premium on-brand SVG fallback — never shows a broken image icon */
        var alt   = (img.getAttribute("alt") || "Offset Plumbing").slice(0, 44);
        var label = alt.replace(/[<>&"]/g, "");
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">' +
          '<defs>' +
          '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f2137"/><stop offset="1" stop-color="#1a3a5c"/></linearGradient>' +
          '<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#b45309" stroke-opacity=".12" stroke-width="1"/></pattern>' +
          '</defs>' +
          '<rect width="800" height="560" fill="url(#bg)"/>' +
          '<rect width="800" height="560" fill="url(#grid)"/>' +
          '<circle cx="400" cy="238" r="54" fill="none" stroke="#d97706" stroke-opacity=".5" stroke-width="2"/>' +
          '<path d="M400 214a18 18 0 0 1 18 18c0 13.5-18 33-18 33s-18-19.5-18-33a18 18 0 0 1 18-18z" fill="#d97706"/>' +
          '<circle cx="400" cy="232" r="7" fill="#fff"/>' +
          '<text x="400" y="330" font-family="Plus Jakarta Sans,Arial,sans-serif" font-size="22" font-weight="700" fill="#f59e0b" text-anchor="middle">Offset Plumbing</text>' +
          '<text x="400" y="358" font-family="Plus Jakarta Sans,Arial,sans-serif" font-size="14" fill="rgba(255,255,255,.55)" text-anchor="middle">' + label + '</text>' +
          '</svg>';
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        imgLoaded(img);
        img.classList.add("is-fallback");
      }, { once: true });
    }
  });

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById("navToggle");
  var menu   = document.getElementById("mobileMenu");
  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.toggle("is-open", open); });
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  if (menu) {
    var close = menu.querySelector(".mobile-menu__close");
    if (close) close.addEventListener("click", function () { setMenu(false); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---- Scroll reveal ---- */
  document.documentElement.classList.add("reveal-ready");
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Smooth-scroll with header offset ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var offset = (header ? header.offsetHeight : 0) + 12;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
    });
  });

  /* ---- Quote form ---- */
  var form = document.getElementById("quoteForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["fname", "femail"].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var valid = el.value.trim() !== "" &&
          (id !== "femail" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
        el.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        if (note) { note.textContent = "Please enter your name and a valid email address."; note.className = "form-note"; }
        return;
      }
      if (note) {
        note.innerHTML = "✓ Request received — thank you! (Demo form, no data sent.) For urgent issues call <a href=\"tel:+16137039749\">(613) 703-9749</a>.";
        note.className = "form-note success";
      }
      form.reset();
    });
    form.querySelectorAll("input, select, textarea").forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("invalid"); });
    });
  }
})();
