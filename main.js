// ─────────────────────────────────────────────────────────────────────────────
// BAILEY CHURCH — Single Video Scroll Site
// Scroll progress scrubs video.currentTime so the descent plays as you scroll.
// ─────────────────────────────────────────────────────────────────────────────

gsap.registerPlugin(ScrollTrigger);

const video        = document.getElementById('scroll-video');
const nav          = document.getElementById('nav');
const scrollDriver = document.getElementById('scroll-driver');

// ── Video scrub on scroll ─────────────────────────────────────────────────
function initScrollScrub() {
  ScrollTrigger.create({
    trigger: scrollDriver,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.2,
    onUpdate: (self) => {
      if (video.duration) {
        video.currentTime = self.progress * video.duration;
      }
    }
  });
  ScrollTrigger.refresh();
}

if (video.readyState >= 1) {
  initScrollScrub();
} else {
  video.addEventListener('loadedmetadata', initScrollScrub, { once: true });
}

video.load();

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
