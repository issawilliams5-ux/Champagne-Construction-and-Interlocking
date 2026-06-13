// ─────────────────────────────────────────────────────────────────────────────
// BAILEY CHURCH — VIDEO DESCENT SCROLL SYSTEM
// Scroll progress drives a frame-locked crossfade between the scene videos,
// the per-scene UI, the altitude bar, and Bailey's presence — all from one
// source of truth so nothing can desync or feel "switchy".
// ─────────────────────────────────────────────────────────────────────────────

gsap.registerPlugin(ScrollTrigger);

const TOTAL_SECTIONS = 5;
const FADE = 0.6; // crossfade width, in section units (1 = a whole scene)

// ── DOM references ────────────────────────────────────────────────────────────
const layers         = Array.from(document.querySelectorAll('.video-layer'));
const uis            = Array.from(document.querySelectorAll('.section-ui'));
const altitudeFill   = document.getElementById('altitude-fill');
const altitudeLabels = Array.from(document.querySelectorAll('#altitude-labels span'));
const nav            = document.getElementById('nav');
const baileyPng      = document.getElementById('bailey-png');
const scrollDriver   = document.getElementById('scroll-driver');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (layers.length !== TOTAL_SECTIONS) {
  console.error('VIDEO SYSTEM: Expected ' + TOTAL_SECTIONS + ' .video-layer elements, found ' + layers.length);
}

// ── Per-scene config ──────────────────────────────────────────────────────────
// Bailey appears only where he belongs — the hero and the teaching scene —
// not pasted onto every frame.
const sceneConfig = [
  { bailey: true,  right: '72px', height: '76vh' }, // 0 Everest — hero (only scene with Bailey)
  { bailey: false, right: '48px', height: '70vh' }, // 1 City — ESG
  { bailey: false, right: '64px', height: '66vh' }, // 2 Amazon — speaking
  { bailey: false, right: '60px', height: '70vh' }, // 3 Egypt — teaching
  { bailey: false, right: '40px', height: '72vh' }, // 4 Office — work & contact
];

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function smooth(t) { return t * t * (3 - 2 * t); } // smoothstep for soft fades

// ── Initial stacking: video k sits above k-1, all hidden except the hero ──────
layers.forEach((layer, k) => {
  layer.style.zIndex = String(k);
  layer.style.opacity = k === 0 ? '1' : '0';
});

// ── Discrete per-scene state (labels, nav, Bailey) ────────────────────────────
let currentSection = -1;
function setActiveSection(index) {
  if (index === currentSection || index < 0 || index >= TOTAL_SECTIONS) return;
  currentSection = index;

  altitudeLabels.forEach((label, i) => label.classList.toggle('active', i === index));
  if (nav) nav.classList.toggle('scrolled', index > 0);

  const cfg = sceneConfig[index];
  if (baileyPng && cfg) {
    baileyPng.style.right  = cfg.right;
    baileyPng.style.height = cfg.height;
    baileyPng.classList.toggle('is-on', !!cfg.bailey);
  }
}

// ── Frame-locked crossfade driver ─────────────────────────────────────────────
// sp ∈ [0, TOTAL]. Each video k fades in over [k-FADE, k] and stays lit while it
// is the topmost layer; the one above crossfades over it as you approach the
// next scene. Text overlays fade AND drift in lockstep with their video, so the
// copy moves with the footage instead of switching on a timer.
function render(sp) {
  for (let k = 0; k < TOTAL_SECTIONS; k++) {
    // Video layer: base scene always lit underneath; others fade in by approach.
    const vop = k === 0 ? 1 : smooth(clamp01((sp - (k - FADE)) / FADE));
    layers[k].style.opacity = String(vop);

    // Overlay: appears with its scene, departs as the next scene arrives.
    const appear    = smooth(clamp01((sp - (k - FADE)) / FADE));
    const disappear = 1 - smooth(clamp01((sp - (k + 1 - FADE)) / FADE));
    const op = appear * disappear;
    const ui = uis[k];
    if (ui) {
      ui.style.opacity = String(op);
      ui.style.setProperty('--drift', ((1 - appear) * 36 - (1 - disappear) * 24) + 'px');
      ui.style.pointerEvents = op > 0.85 ? 'auto' : 'none';
    }
  }
}

ScrollTrigger.create({
  trigger: scrollDriver,
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    const sp = self.progress * TOTAL_SECTIONS;
    render(sp);
    setActiveSection(Math.min(Math.floor(sp + 0.0001), TOTAL_SECTIONS - 1));
    if (altitudeFill) altitudeFill.style.height = (self.progress * 100) + '%';
  }
});

// ── Nav link jumps ────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-links a[data-target]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = parseInt(link.getAttribute('data-target'), 10);
    const max = scrollDriver.offsetHeight - window.innerHeight;
    // Land in the middle of the target scene's band so it reads fully.
    const scrollTarget = max * ((target + 0.5) / TOTAL_SECTIONS);
    window.scrollTo({ top: scrollTarget, behavior: prefersReduced ? 'auto' : 'smooth' });
  });
});

// ── Scroll indicator fade ─────────────────────────────────────────────────────
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
  window.addEventListener('scroll', () => {
    scrollIndicator.style.opacity = window.scrollY > window.innerHeight * 0.2 ? '0' : '1';
  }, { passive: true });
}

// ── Video playback + gentle loop-seam softening ───────────────────────────────
document.querySelectorAll('.video-layer video').forEach(video => {
  video.play().catch(() => {
    document.addEventListener('click', () => video.play().catch(() => {}), { once: true });
    document.addEventListener('touchstart', () => video.play().catch(() => {}), { once: true });
  });
  const SEAM = 0.4;
  video.addEventListener('timeupdate', function () {
    const d = video.duration;
    if (!d || isNaN(d)) return;
    const nearSeam = video.currentTime > d - SEAM || video.currentTime < SEAM;
    video.style.opacity = nearSeam ? '0.7' : '1';
  });
});

// ── Contact form → Web3Forms (emails bailey@ignitedbybailey.ca) ───────────────
const form = document.getElementById('enquiryForm');
const note = document.getElementById('formNote');
if (form) {
  const submitBtn = form.querySelector('button[type=submit]');
  function setNote(msg, ok) {
    if (!note) return;
    note.textContent = msg;
    note.classList.toggle('is-success', !!ok);
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#fname');
    const email = form.querySelector('#femail');
    if (!name.value.trim() || !email.value.trim()) {
      setNote('Please add your name and email so I can respond.', false);
      return;
    }
    const payload = {
      access_key: (form.querySelector('[name=access_key]') || {}).value || '',
      subject: 'New enquiry from Bailey Church website',
      from_name: 'Bailey Church Website',
      botcheck: '',
      name: name.value.trim(),
      email: email.value.trim(),
      organization: (form.querySelector('#forg') || {}).value || '',
      message: (form.querySelector('#fmsg') || {}).value || ''
    };
    if (submitBtn) submitBtn.disabled = true;
    setNote('Sending your enquiry…', false);
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then((result) => {
        if (result.ok && result.data && result.data.success) {
          setNote('Thank you, ' + payload.name.split(' ')[0] + '. Your enquiry has been sent.', true);
          form.reset();
        } else {
          setNote((result.data && result.data.message) || 'Something went wrong. Please try again.', false);
        }
      })
      .catch(() => setNote('Network error — please email bailey@ignitedbybailey.ca directly.', false))
      .then(() => { if (submitBtn) submitBtn.disabled = false; });
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  ScrollTrigger.refresh();
  render(window.scrollY / (scrollDriver.offsetHeight - window.innerHeight) * TOTAL_SECTIONS || 0);
  setActiveSection(0);
}
window.addEventListener('resize', () => ScrollTrigger.refresh());
window.addEventListener('load', init);
