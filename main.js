// ─────────────────────────────────────────────────────────────────────────────
// BAILEY CHURCH — VIDEO DESCENT SCROLL SYSTEM
// GSAP ScrollTrigger drives vertical wipe transitions between 6 looping videos
// ─────────────────────────────────────────────────────────────────────────────

gsap.registerPlugin(ScrollTrigger);

const TOTAL_SECTIONS = 5;

// ── DOM references ────────────────────────────────────────────────────────────
const layers         = Array.from(document.querySelectorAll('.video-layer'));
const uis            = Array.from(document.querySelectorAll('.section-ui'));
const wipeCurtain    = document.getElementById('wipe-curtain');
const altitudeFill   = document.getElementById('altitude-fill');
const altitudeLabels = Array.from(document.querySelectorAll('#altitude-labels span'));
const nav            = document.getElementById('nav');
const baileyPng      = document.getElementById('bailey-png');
const scrollDriver   = document.getElementById('scroll-driver');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (layers.length !== TOTAL_SECTIONS) {
  console.error('VIDEO SYSTEM: Expected ' + TOTAL_SECTIONS + ' .video-layer elements, found ' + layers.length);
}

// ── Bailey PNG positions per section ─────────────────────────────────────────
const baileyConfig = [
  { right: '72px', height: '74vh' }, // Everest — tall, proud
  { right: '48px', height: '70vh' }, // City
  { right: '64px', height: '66vh' }, // Amazon
  { right: '56px', height: '68vh' }, // Egypt
  { right: '40px', height: '72vh' }, // Office — commanding
];

// ── Active section state ──────────────────────────────────────────────────────
let currentSection = -1;

function setActiveSection(index) {
  if (index < 0 || index >= TOTAL_SECTIONS) return;
  if (index === currentSection) return;
  currentSection = index;

  uis.forEach((ui, i) => ui.classList.toggle('active', i === index));

  if (altitudeFill) {
    altitudeFill.style.height = ((index / (TOTAL_SECTIONS - 1)) * 100) + '%';
  }
  altitudeLabels.forEach((label, i) => label.classList.toggle('active', i === index));

  if (baileyPng && baileyConfig[index]) {
    baileyPng.style.right  = baileyConfig[index].right;
    baileyPng.style.height = baileyConfig[index].height;
  }

  if (nav) nav.classList.toggle('scrolled', index > 0);
}

// ── Transition logic ──────────────────────────────────────────────────────────
// The incoming layer's clip-path opens from the bottom edge upward, so the new
// scene rises into frame as the camera "descends" through altitude layers.
function transitionToSection(toIndex) {
  const fromIndex = currentSection;
  setActiveSection(toIndex);
  if (toIndex === fromIndex || fromIndex < 0) {
    // first paint — just make sure target is fully shown, others hidden
    layers.forEach((l, i) => gsap.set(l, { clipPath: i <= toIndex ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)', opacity: 1 }));
    return;
  }

  const toLayer = layers[toIndex];
  const goingDown = toIndex > fromIndex;
  gsap.killTweensOf(layers);

  if (prefersReduced) {
    layers.forEach((l, i) => gsap.set(l, { clipPath: i === toIndex ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)', opacity: 1 }));
    return;
  }

  // Incoming layer sits on top and wipes open from the relevant edge.
  gsap.set(toLayer, {
    zIndex: 5,
    opacity: 1,
    clipPath: goingDown ? 'inset(100% 0 0% 0)' : 'inset(0% 0 100% 0)'
  });
  gsap.to(toLayer, {
    clipPath: 'inset(0% 0 0% 0)',
    duration: 0.9,
    ease: 'power2.inOut',
    onComplete: () => {
      // Settle: hide every other layer beneath the now-active one.
      layers.forEach((l, i) => {
        if (i !== toIndex) gsap.set(l, { clipPath: 'inset(100% 0 0 0)', zIndex: 0 });
      });
      gsap.set(toLayer, { zIndex: 1 });
    }
  });
}

// ── ScrollTrigger — single progress driver ────────────────────────────────────
// Everything keys off scroll progress so the active scene is correct at ANY
// scroll position, whether reached by continuous scroll or a jump. The video
// wipe and the UI both update from the same computed index, so they never
// desync. The altitude fill tracks raw progress for a smooth bar.
ScrollTrigger.create({
  trigger: scrollDriver,
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    const idx = Math.min(Math.floor(self.progress * TOTAL_SECTIONS), TOTAL_SECTIONS - 1);
    if (idx !== currentSection) transitionToSection(idx);
    if (altitudeFill) altitudeFill.style.height = (self.progress * 100) + '%';
  }
});

// ── Nav scroll listener (window scroll — body is the scroller here) ───────────
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 80 || currentSection > 0);
}, { passive: true });

// ── Nav link jumps ────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-links a[data-target]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = parseInt(link.getAttribute('data-target'), 10);
    const driverHeight = scrollDriver.offsetHeight;
    const scrollTarget = (target / TOTAL_SECTIONS) * driverHeight + 2;
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  });
});

// ── Scroll indicator fade ─────────────────────────────────────────────────────
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
  window.addEventListener('scroll', () => {
    const past = window.scrollY > window.innerHeight * 0.2;
    scrollIndicator.style.opacity = past ? '0' : '1';
  }, { passive: true });
}

// ── Video play handling ───────────────────────────────────────────────────────
// Kick off playback; the poster still covers the gap until frames arrive. If
// autoplay is blocked, resume on the first user interaction.
document.querySelectorAll('.video-layer video').forEach(video => {
  video.play().catch(() => {
    document.addEventListener('click', () => video.play().catch(() => {}), { once: true });
    document.addEventListener('touchstart', () => video.play().catch(() => {}), { once: true });
  });

  // Soften the loop seam: dip opacity briefly at the tail and head of each
  // loop so the hard cut of non-seamless stock footage reads as a gentle pulse.
  var SEAM = 0.45;
  video.addEventListener('timeupdate', function () {
    var d = video.duration;
    if (!d || isNaN(d)) return;
    var nearSeam = video.currentTime > d - SEAM || video.currentTime < SEAM;
    video.style.opacity = nearSeam ? '0.55' : '1';
  });
});

// ── Refresh ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => ScrollTrigger.refresh());
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  transitionToSection(0);
});
