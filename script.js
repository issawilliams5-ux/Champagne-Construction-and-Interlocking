(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  var preloader = document.getElementById("preloader");
  if (preloader && !prefersReduced) {
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      preloader.classList.add("hide");
      document.body.style.overflow = "";
      setTimeout(function () { preloader.style.display = "none"; }, 700);
    }, 1600);
  } else if (preloader) {
    preloader.style.display = "none";
  }

  /* ---------- Custom cursor ---------- */
  var cursorDot = document.getElementById("cursor-dot");
  var cursorRing = document.getElementById("cursor-ring");
  if (cursorDot && cursorRing && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    var cx = 0, cy = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", function(e) {
      cx = e.clientX; cy = e.clientY;
      cursorDot.style.left = cx + "px";
      cursorDot.style.top = cy + "px";
      cursorDot.style.opacity = "1";
      cursorRing.style.opacity = "1";
    });
    (function animateRing() {
      rx += (cx - rx) * 0.12;
      ry += (cy - ry) * 0.12;
      cursorRing.style.left = rx + "px";
      cursorRing.style.top = ry + "px";
      requestAnimationFrame(animateRing);
    })();
    document.querySelectorAll("a, button, .btn, .exp-card, .event-cat, .engagement-card, .insight-card, .testimonial-card, .li-card, .service-card").forEach(function(el) {
      el.addEventListener("mouseenter", function() { cursorRing.classList.add("is-hovering"); cursorDot.style.transform = "translate(-50%,-50%) scale(2.5)"; cursorDot.style.background = "#dcc898"; });
      el.addEventListener("mouseleave", function() { cursorRing.classList.remove("is-hovering"); cursorDot.style.transform = "translate(-50%,-50%) scale(1)"; cursorDot.style.background = ""; });
    });
    document.addEventListener("mouseleave", function() { cursorDot.style.opacity = "0"; cursorRing.style.opacity = "0"; });
  }

  /* ---------- Split-text hero animation ---------- */
  function splitTextReveal() {
    var h1 = document.querySelector(".hero__title");
    if (!h1 || prefersReduced) return;
    var text = h1.textContent.trim();
    var words = text.split(" ");
    h1.innerHTML = words.map(function(w) {
      return '<span class="word-wrap"><span class="word">' + w + '</span></span>';
    }).join(" ");
    setTimeout(function() {
      h1.querySelectorAll(".word").forEach(function(w, i) {
        setTimeout(function() { w.classList.add("word--in"); }, i * 120);
      });
    }, 200);
  }
  setTimeout(splitTextReveal, prefersReduced ? 0 : 1700);

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
  var scrollProgressEl = document.getElementById("scrollProgress");
  var backToTop = document.getElementById("backToTop");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
    if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 600);
    if (!prefersReduced && parallaxEls.length && !ticking) {
      ticking = true;
      window.requestAnimationFrame(applyParallax);
    }
    if (scrollProgressEl) {
      var scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      scrollProgressEl.style.width = scrolled.toFixed(1) + "%";
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
    // force reflow
    menu.offsetHeight;
    menu.classList.add("is-open");
    toggle && toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    toggle && toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(function() { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 500);
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

  /* ---------- Active nav highlight ---------- */
  var navLinks = document.querySelectorAll(".nav a[href^='#']");
  var allSections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  if (navLinks.length && allSections.length) {
    var navIo = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function(a) {
            a.classList.toggle("nav__active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { threshold: 0.35 });
    allSections.forEach(function(s) { navIo.observe(s); });
  }

  /* ---------- Hero canvas particles ---------- */
  var canvas = document.getElementById("heroCanvas");
  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var PARTICLE_COUNT = 65;
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.2 + 0.4,
        vx: (Math.random() - .5) * .3,
        vy: -(Math.random() * .55 + .12),
        alpha: Math.random() * .6 + .1,
        life: Math.random(),
        glow: Math.random() > 0.6
      });
    }
    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function(p) {
        p.x += p.vx; p.y += p.vy; p.life += 0.0028;
        if (p.y < -10 || p.life > 1) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.life = 0;
          p.glow = Math.random() > 0.6;
        }
        var fade = p.life < .12 ? p.life / .12 : p.life > .82 ? (1 - p.life) / .18 : 1;
        var a = (p.alpha * fade);
        if (p.glow && a > 0.05) {
          var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
          grad.addColorStop(0, "rgba(220,200,140," + (a * 0.9).toFixed(3) + ")");
          grad.addColorStop(0.4, "rgba(200,169,106," + (a * 0.5).toFixed(3) + ")");
          grad.addColorStop(1, "rgba(200,169,106,0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,169,106," + a.toFixed(2) + ")";
        ctx.fill();
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  /* ---------- Hero mouse parallax ---------- */
  var heroSection = document.querySelector(".hero");
  var heroCopy = document.querySelector(".hero__copy");
  var heroBg = document.querySelector(".hero__bg");
  if (heroSection && heroCopy && heroBg && !prefersReduced) {
    heroSection.addEventListener("mousemove", function(e) {
      var rect = heroSection.getBoundingClientRect();
      var mx = (e.clientX - rect.left) / rect.width - .5;
      var my = (e.clientY - rect.top) / rect.height - .5;
      heroCopy.style.transform = "translate(" + (mx * 12).toFixed(1) + "px," + (my * 8).toFixed(1) + "px)";
      heroBg.style.transform = "translate(" + (-mx * 18).toFixed(1) + "px," + (-my * 12).toFixed(1) + "px)";
    });
    heroSection.addEventListener("mouseleave", function() {
      heroCopy.style.transform = "";
      heroBg.style.transform = "";
    });
  }

  /* ---------- Smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener("click", function(e) {
      var target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      var targetY = target.getBoundingClientRect().top + window.scrollY - 80;
      var startY = window.scrollY;
      var diff = targetY - startY;
      var startTime = null;
      var duration = Math.min(Math.abs(diff) * 0.6, 1200);
      if (prefersReduced) { window.scrollTo(0, targetY); return; }
      function ease(t) { return t < .5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; }
      function step(ts) {
        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + diff * ease(progress));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  });

  /* ---------- Timeline draw animation ---------- */
  var timelineLine = document.querySelector(".timeline__line");
  if (timelineLine) {
    var tlIo = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        timelineLine.classList.add("is-drawn");
        tlIo.disconnect();
      }
    }, { threshold: 0.1 });
    tlIo.observe(timelineLine.parentElement);
  }

  /* ---------- Animated stat counters ---------- */
  var statEls = document.querySelectorAll(".stat strong");
  if ("IntersectionObserver" in window && statEls.length) {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        statIo.unobserve(el);
        var raw = el.textContent.trim();
        var suffix = raw.replace(/[\d]/g, "");
        var num = parseInt(raw.replace(/\D/g, ""), 10);
        // Year stat (2006) — just flash, no count-up
        if (raw === "2006") {
          el.classList.add("counted");
          return;
        }
        if (isNaN(num)) { el.classList.add("counted"); return; }
        var start = null;
        var duration = 1800;
        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
        function step(ts) {
          if (!start) start = ts;
          var elapsed = ts - start;
          var progress = Math.min(elapsed / duration, 1);
          var current = Math.round(easeOut(progress) * num);
          el.textContent = current + suffix;
          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            el.textContent = num + suffix;
            el.classList.add("counted");
          }
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { statIo.observe(el); });
  }

  /* ---------- Card magnetic tilt ---------- */
  var tiltCards = document.querySelectorAll(".exp-card, .event-cat, .process__step");
  tiltCards.forEach(function (card) {
    var rafId = null;
    var pendingRx = 0, pendingRy = 0;

    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / (rect.width / 2);
      var dy = (e.clientY - cy) / (rect.height / 2);
      pendingRx = (-dy * 8).toFixed(2);
      pendingRy = (dx * 8).toFixed(2);
      if (!rafId) {
        rafId = window.requestAnimationFrame(function () {
          card.style.setProperty("--rx", pendingRx + "deg");
          card.style.setProperty("--ry", pendingRy + "deg");
          rafId = null;
        });
      }
    });

    card.addEventListener("mouseenter", function () {
      card.style.setProperty("--ty", "-6px");
    });

    card.addEventListener("mouseleave", function () {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--ty", "0px");
      if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; }
    });
  });

  /* ---------- Marquee — disable when prefers-reduced-motion ---------- */
  if (prefersReduced) {
    var marqueeTrack = document.querySelector(".marquee-track");
    if (marqueeTrack) marqueeTrack.style.animationPlayState = "paused";
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

  /* ---------- FAQ accordion (single-open, keyboard accessible) ---------- */
  var accordion = document.querySelector(".accordion");
  if (accordion) {
    var accBtns = Array.prototype.slice.call(accordion.querySelectorAll(".accordion__btn"));

    function setPanel(btn, open) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } else {
        panel.style.maxHeight = "0px";
      }
    }

    accBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        // single-open: close all others
        accBtns.forEach(function (other) { if (other !== btn) setPanel(other, false); });
        setPanel(btn, !isOpen);
      });
    });

    // Keep open panels sized correctly on resize
    window.addEventListener("resize", function () {
      accBtns.forEach(function (btn) {
        if (btn.getAttribute("aria-expanded") === "true") {
          var panel = document.getElementById(btn.getAttribute("aria-controls"));
          if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }, { passive: true });
  }

  /* ---------- Back to top ---------- */
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      if (prefersReduced) { window.scrollTo(0, 0); return; }
      var startY = window.scrollY;
      var startTime = null;
      var duration = Math.min(startY * 0.6, 1200);
      function ease(t) { return t < .5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; }
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        window.scrollTo(0, startY * (1 - ease(progress)));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
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

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
