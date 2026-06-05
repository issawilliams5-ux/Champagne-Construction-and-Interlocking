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
