(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Parallax (Apple-style depth on scroll) ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;
  function applyParallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var host = el.parentElement;
      var rect = host.getBoundingClientRect();
      if (rect.bottom < -300 || rect.top > vh + 300) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      var mid = rect.top + rect.height / 2 - vh / 2;
      el.style.transform = "translate3d(0," + (-mid * speed).toFixed(1) + "px,0) scale(1.16)";
    });
    ticking = false;
  }

  /* ---------- Sticky header shadow + parallax driver ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
    if (!prefersReduced && parallaxEls.length && !ticking) {
      ticking = true;
      window.requestAnimationFrame(applyParallax);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { if (!prefersReduced) applyParallax(); }, { passive: true });
  if (!prefersReduced) applyParallax();
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

  /* ---------- Contact form (posts to Web3Forms → emails bailey@ignitedbybailey.ca) ---------- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    var submitBtn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#fname");
      var email = form.querySelector("#femail");

      function setNote(msg, success) {
        if (!note) return;
        note.textContent = msg;
        note.classList.toggle("is-success", !!success);
      }

      if (!name.value.trim() || !email.value.trim()) {
        setNote("Please add your name and email so I can respond.", false);
        return;
      }

      var org = (form.querySelector("#forg") || {}).value || "";
      var topic = (form.querySelector("#ftopic") || {}).value || "";
      var msg = (form.querySelector("#fmsg") || {}).value || "";

      // Web3Forms reads the access_key + standard field names from the form.
      var payload = {
        access_key: (form.querySelector("[name=access_key]") || {}).value || "",
        subject: (form.querySelector("[name=subject]") || {}).value || "New website enquiry",
        from_name: (form.querySelector("[name=from_name]") || {}).value || "Website",
        botcheck: "",
        name: name.value.trim(),
        email: email.value.trim(),
        organization: org,
        topic: topic,
        message: msg
      };

      if (submitBtn) { submitBtn.disabled = true; }
      setNote("Sending your enquiry…", false);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (result) {
          if (result.ok && result.data && result.data.success) {
            setNote("Thank you, " + payload.name.split(" ")[0] + ". Your enquiry has been sent.", true);
            form.reset();
          } else {
            setNote((result.data && result.data.message) || "Something went wrong. Please try again.", false);
          }
        })
        .catch(function () {
          setNote("Network error — please try again, or email bailey@ignitedbybailey.ca directly.", false);
        })
        .then(function () {
          if (submitBtn) { submitBtn.disabled = false; }
        });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
