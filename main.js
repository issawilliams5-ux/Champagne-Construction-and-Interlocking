/* ===========================================================
   Bailey Church — ESG Portfolio
   GSAP ScrollTrigger: snap scroll, layered parallax, entrances
   =========================================================== */
(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  var isMobile = window.matchMedia("(max-width: 768px)").matches;
  var panels = gsap.utils.toArray(".panel");
  var totalPanels = panels.length;

  /* ---------- Nav background after 80px ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 80);
  }, { passive: true });

  /* ---------- Hero chevron — disappears past hero ---------- */
  var chevron = document.querySelector(".scroll-chevron");
  if (chevron) {
    ScrollTrigger.create({
      trigger: ".panel-1",
      start: "bottom 90%",
      onEnter: function () { chevron.classList.add("is-hidden"); },
      onLeaveBack: function () { chevron.classList.remove("is-hidden"); }
    });
  }

  /* ---------- Smooth scroll nav links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Section entrance text animations (once, not scrubbed) ---------- */
  panels.forEach(function (panel) {
    var textChildren = panel.querySelectorAll(".text-block > *");
    if (!textChildren.length) return;
    ScrollTrigger.create({
      trigger: panel,
      start: "top 80%",
      once: true,
      onEnter: function () {
        gsap.from(textChildren, {
          opacity: 0,
          y: 30,
          stagger: 0.12,
          duration: 0.6,
          ease: "power2.out"
        });
      }
    });
  });

  if (!isMobile) {

    /* ---------- Snap scroll ---------- */
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      snap: {
        snapTo: 1 / (totalPanels - 1),
        duration: { min: 0.4, max: 0.8 },
        delay: 0.1,
        ease: "power2.inOut"
      }
    });

    /* ---------- Parallax helper ---------- */
    function parallaxY(selector, yPct) {
      document.querySelectorAll(selector).forEach(function (el) {
        var panel = el.closest(".panel");
        if (!panel) return;
        gsap.to(el, {
          yPercent: yPct,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8
          }
        });
      });
    }

    /* Mid-ground layers */
    parallaxY(".panel-1 .layer-mid", -40);
    parallaxY(".panel-2 .layer-mid", -40);
    parallaxY(".panel-5 .layer-mid", -35);

    /* Foreground layers — per-asset speeds from the manifest */
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
        scrollTrigger: {
          trigger: panel,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8
        }
      });
    });

    /* Moon — slight vertical parallax */
    document.querySelectorAll(".png-moon").forEach(function (el) {
      var panel = el.closest(".panel");
      gsap.to(el, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: panel,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8
        }
      });
    });
  }

  /* Moon continuous rotation (independent of scroll, all viewports) */
  gsap.to(".png-moon", {
    rotation: 360,
    duration: 120,
    repeat: -1,
    ease: "none"
  });

})();
