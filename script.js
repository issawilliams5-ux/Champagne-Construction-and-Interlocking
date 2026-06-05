(function () {
  "use strict";

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  var closeBtn = menu ? menu.querySelector(".mobile-menu__close") : null;

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    toggle && toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!menu) return;
    menu.hidden = true;
    toggle && toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  toggle && toggle.addEventListener("click", openMenu);
  closeBtn && closeBtn.addEventListener("click", closeMenu);
  menu && menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Contact form (no backend — graceful demo) ---------- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#fname");
      var email = form.querySelector("#femail");
      if (!name.value.trim() || !email.value.trim()) {
        if (note) {
          note.textContent = "Please add your name and email so I can respond.";
          note.classList.remove("is-success");
        }
        return;
      }
      if (note) {
        note.textContent = "Thank you, " + name.value.trim().split(" ")[0] + ". Your enquiry has been noted.";
        note.classList.add("is-success");
      }
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
