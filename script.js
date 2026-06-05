(function () {
  "use strict";

  /* ---- Sticky header shadow ---- */
  var header = document.getElementById("header");
  function onScroll() {
    if (!header) return;
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);
    var fc = document.getElementById("floatCall");
    if (fc) fc.classList.toggle("is-visible", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById("navToggle");
  var menu   = document.getElementById("mobileMenu");

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.hidden = false;
    requestAnimationFrame(function () {
      menu.classList.toggle("is-open", open);
    });
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle) toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  if (menu) {
    var closeBtn = document.createElement("button");
    closeBtn.className = "mobile-menu__close";
    closeBtn.setAttribute("aria-label", "Close menu");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", function () { setMenu(false); });
    menu.insertBefore(closeBtn, menu.firstChild);

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
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Smooth anchor scrolling with offset for sticky header ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var offset = (header ? header.offsetHeight : 0) + 16;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ---- Quote form ---- */
  var form = document.getElementById("quoteForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      ["fname", "femail"].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var ok = el.value.trim() !== "" &&
          (id !== "femail" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
        el.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        if (note) { note.textContent = "Please enter your name and a valid email address."; note.className = "form__note"; }
        return;
      }

      if (note) {
        note.innerHTML = "✓ Thank you! Your quote request has been received. (Demo form — no data is transmitted.) For urgent issues, call <a href=\"tel:+16137039749\">(613) 703-9749</a>.";
        note.className = "form__note success";
      }
      form.reset();
    });

    form.querySelectorAll("input, select, textarea").forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("invalid"); });
    });
  }

})();
