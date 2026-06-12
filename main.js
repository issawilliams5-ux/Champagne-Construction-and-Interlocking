/* ===========================================================
   Bailey Church — Public-Sector Accounting & ESG Advisory
   GSAP ScrollTrigger parallax + site interactions
   =========================================================== */
(function () {
  "use strict";

  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  var isMobile = window.matchMedia("(max-width: 768px)").matches;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav background after 80px ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 80);
  }, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  var closeBtn = menu ? menu.querySelector(".mobile-menu__close") : null;

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    menu.offsetHeight; // force reflow so the transition runs
    menu.classList.add("is-open");
    toggle && toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    toggle && toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 450);
  }
  toggle && toggle.addEventListener("click", openMenu);
  closeBtn && closeBtn.addEventListener("click", closeMenu);
  menu && menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- Hero chevron — disappears past hero ---------- */
  var chevron = document.querySelector(".scroll-chevron");
  if (chevron && hasGsap) {
    ScrollTrigger.create({
      trigger: ".panel-1",
      start: "bottom 90%",
      onEnter: function () { chevron.classList.add("is-hidden"); },
      onLeaveBack: function () { chevron.classList.remove("is-hidden"); }
    });
  }

  /* ---------- Entrance animations (once, not scrubbed) ---------- */
  if (hasGsap && !prefersReduced) {
    var entranceGroups = document.querySelectorAll(".text-block, .content-head, .contact-left, .contact-form");
    entranceGroups.forEach(function (block) {
      ScrollTrigger.create({
        trigger: block,
        start: "top 82%",
        once: true,
        onEnter: function () {
          gsap.from(block.children, {
            opacity: 0,
            y: 30,
            stagger: 0.12,
            duration: 0.6,
            ease: "power2.out"
          });
        }
      });
    });

    // Cards rise in as their grid enters
    document.querySelectorAll(".grid").forEach(function (grid) {
      ScrollTrigger.create({
        trigger: grid,
        start: "top 85%",
        once: true,
        onEnter: function () {
          gsap.from(grid.children, {
            opacity: 0,
            y: 36,
            stagger: 0.1,
            duration: 0.6,
            ease: "power2.out"
          });
        }
      });
    });

    // Timeline entries
    document.querySelectorAll(".timeline").forEach(function (tl) {
      ScrollTrigger.create({
        trigger: tl,
        start: "top 85%",
        once: true,
        onEnter: function () {
          gsap.from(tl.children, {
            opacity: 0,
            x: -24,
            stagger: 0.12,
            duration: 0.55,
            ease: "power2.out"
          });
        }
      });
    });
  }

  /* ---------- Parallax layers (desktop only, scrub 0.8) ---------- */
  if (hasGsap && !isMobile && !prefersReduced) {

    function parallaxY(selector, yPct) {
      document.querySelectorAll(selector).forEach(function (el) {
        var panel = el.closest(".panel");
        if (!panel) return;
        gsap.to(el, {
          yPercent: yPct,
          ease: "none",
          scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: 0.8 }
        });
      });
    }

    /* Mid-ground tree layers */
    parallaxY(".panel-1 .layer-mid", -40);
    parallaxY(".panel-2 .layer-mid", -40);
    parallaxY(".panel-5 .layer-mid", -35);

    /* Foreground grass / reeds */
    parallaxY(".panel-1 .layer-fg", -70);
    parallaxY(".panel-3 .layer-fg", -70);
    parallaxY(".panel-6 .layer-fg", -70);
    parallaxY(".panel-2 .layer-fg", -65);
    parallaxY(".p4-grass", -65);
    parallaxY(".p4-reeds", -60);
    parallaxY(".p5-reeds", -60);

    /* Birds — horizontal drift only */
    document.querySelectorAll(".png-birds").forEach(function (el) {
      var panel = el.closest(".panel");
      gsap.to(el, {
        xPercent: -15,
        ease: "none",
        scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: 0.8 }
      });
    });

    /* Moon — slight vertical parallax */
    document.querySelectorAll(".png-moon").forEach(function (el) {
      var panel = el.closest(".panel");
      gsap.to(el, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: 0.8 }
      });
    });
  }

  /* Moon continuous rotation (independent of scroll) */
  if (hasGsap && !prefersReduced) {
    gsap.to(".png-moon", { rotation: 360, duration: 120, repeat: -1, ease: "none" });
  }

  /* ---------- Animated stat counters ---------- */
  var statEls = document.querySelectorAll(".stat strong[data-count]");
  if ("IntersectionObserver" in window && statEls.length && !prefersReduced) {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        statIo.unobserve(el);
        var num = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        var start = null;
        var duration = 1600;
        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          el.textContent = Math.round(easeOut(progress) * num) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { statIo.observe(el); });
  }

  /* ---------- FAQ accordion (single-open, keyboard accessible) ---------- */
  var accordion = document.querySelector(".accordion");
  if (accordion) {
    var accBtns = Array.prototype.slice.call(accordion.querySelectorAll(".accordion__btn"));

    function setPanel(btn, open) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
    }

    accBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        accBtns.forEach(function (other) { if (other !== btn) setPanel(other, false); });
        setPanel(btn, !isOpen);
      });
    });

    window.addEventListener("resize", function () {
      accBtns.forEach(function (btn) {
        if (btn.getAttribute("aria-expanded") === "true") {
          var panel = document.getElementById(btn.getAttribute("aria-controls"));
          if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }, { passive: true });
  }

  /* ---------- LinkedIn carousel ---------- */
  var liTrack = document.getElementById("liTrack");
  var liViewport = document.getElementById("liViewport");
  if (liTrack && liViewport) {
    var liSlides = liTrack.querySelectorAll(".li-slide");
    var liCount = liSlides.length;
    var liIndex = 0;
    var liDots = document.getElementById("liDots");
    var liAuto = null;

    function liGo(i) {
      liIndex = (i + liCount) % liCount;
      liTrack.style.transform = "translateX(" + (-liIndex * 100) + "%)";
      if (liDots) {
        liDots.querySelectorAll("button").forEach(function (d, di) {
          d.classList.toggle("is-active", di === liIndex);
        });
      }
    }

    function restartAuto() {
      if (liAuto) { window.clearInterval(liAuto); liAuto = null; }
      if (!prefersReduced) { liAuto = window.setInterval(function () { liGo(liIndex + 1); }, 6000); }
    }

    if (liDots) {
      for (var li = 0; li < liCount; li++) {
        (function (idx) {
          var b = document.createElement("button");
          b.setAttribute("aria-label", "Go to post " + (idx + 1));
          b.addEventListener("click", function () { liGo(idx); restartAuto(); });
          liDots.appendChild(b);
        })(li);
      }
    }

    var liPrev = document.getElementById("liPrev");
    var liNext = document.getElementById("liNext");
    liPrev && liPrev.addEventListener("click", function () { liGo(liIndex - 1); restartAuto(); });
    liNext && liNext.addEventListener("click", function () { liGo(liIndex + 1); restartAuto(); });

    liViewport.addEventListener("mouseenter", function () { if (liAuto) { window.clearInterval(liAuto); liAuto = null; } });
    liViewport.addEventListener("mouseleave", restartAuto);

    var liStartX = 0, liDragging = false;
    liViewport.addEventListener("touchstart", function (e) { liStartX = e.touches[0].clientX; liDragging = true; }, { passive: true });
    liViewport.addEventListener("touchend", function (e) {
      if (!liDragging) return;
      liDragging = false;
      var dx = e.changedTouches[0].clientX - liStartX;
      if (Math.abs(dx) > 40) { liGo(liIndex + (dx < 0 ? 1 : -1)); restartAuto(); }
    }, { passive: true });

    liGo(0);
    restartAuto();
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

      var payload = {
        access_key: (form.querySelector("[name=access_key]") || {}).value || "",
        subject: (form.querySelector("[name=subject]") || {}).value || "New website enquiry",
        from_name: (form.querySelector("[name=from_name]") || {}).value || "Website",
        botcheck: "",
        name: name.value.trim(),
        email: email.value.trim(),
        organization: (form.querySelector("#forg") || {}).value || "",
        topic: (form.querySelector("#ftopic") || {}).value || "",
        message: (form.querySelector("#fmsg") || {}).value || ""
      };

      if (submitBtn) submitBtn.disabled = true;
      setNote("Sending your enquiry…", false);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
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
        .then(function () { if (submitBtn) submitBtn.disabled = false; });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
