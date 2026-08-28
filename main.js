// ─────────────────────────────────────────────────────────────────────────────
// BAILEY CHURCH — Single Video Scroll Site
// Scroll progress scrubs video.currentTime so the descent plays as you scroll.
// ─────────────────────────────────────────────────────────────────────────────

// GSAP is loaded from a CDN. When that request fails — an ad blocker, an offline
// visitor, a jsdelivr outage — `gsap` and `ScrollTrigger` are simply undefined.
// Referencing them at top level threw a ReferenceError that aborted this whole
// file, so the nav, the smooth-scroll links and the contact form never bound
// either: a blocked CDN silently took out the enquiry form. Detect instead, and
// scrub the video natively when the library is absent.
const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
if (hasGsap) gsap.registerPlugin(ScrollTrigger);

const video = document.getElementById('scroll-video');
const nav   = document.getElementById('nav');

// ── Video scrub on scroll ─────────────────────────────────────────────────
// The stacked content sections (5 × 100vh) provide the scroll distance.
function initScrollScrub() {
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.8,
    onUpdate: (self) => {
      if (video.duration) {
        video.currentTime = self.progress * video.duration;
      }
    }
  });
  ScrollTrigger.refresh();
}

// Same mapping ScrollTrigger uses for body top-top → bottom-bottom, minus the
// eased scrub: rAF-throttled so a scroll burst still costs one seek per frame.
function initNativeScrub() {
  let queued = false;
  function apply() {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0 || !video.duration) return;
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    video.currentTime = progress * video.duration;
  }
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(apply); }
  }, { passive: true });
  apply();
}

const startScrub = hasGsap ? initScrollScrub : initNativeScrub;

if (video) {
  if (video.readyState >= 1) {
    startScrub();
  } else {
    video.addEventListener('loadedmetadata', startScrub, { once: true });
  }
  video.load();
}

// ── Nav dark on scroll ────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

// ── Nav link smooth scroll ────────────────────────────────────────────────
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Contact form → Web3Forms ──────────────────────────────────────────────
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
    const name  = form.querySelector('#fname');
    const email = form.querySelector('#femail');
    if (!name.value.trim() || !email.value.trim()) {
      setNote('Please add your name and email so Bailey can respond.', false);
      return;
    }
    const payload = {
      access_key:   (form.querySelector('[name=access_key]') || {}).value || '',
      subject:      'New enquiry from Bailey Church website',
      from_name:    'Bailey Church Website',
      botcheck:     '',
      name:         name.value.trim(),
      email:        email.value.trim(),
      organization: (form.querySelector('#forg') || {}).value || '',
      message:      (form.querySelector('#fmsg') || {}).value || ''
    };
    if (submitBtn) submitBtn.disabled = true;
    setNote('Sending your enquiry…', false);
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(result => {
        if (result.ok && result.data && result.data.success) {
          setNote('Thank you, ' + payload.name.split(' ')[0] + '. Your enquiry has been sent.', true);
          form.reset();
        } else {
          setNote((result.data && result.data.message) || 'Something went wrong. Please try again.', false);
        }
      })
      .catch(() => setNote('Network error — please email bailey@ignitedbybailey.ca directly.', false))
      .finally(() => { if (submitBtn) submitBtn.disabled = false; });
  });
}
