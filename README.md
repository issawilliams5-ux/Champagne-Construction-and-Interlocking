# John Bailey Church, FCPA, FCA, CIA — Professional Profile Website

A luxury, single-page professional profile for **John Bailey Church** — an Ottawa-based KPMG Canada partner and Queen's University lecturer specializing in public-sector accounting, ESG reporting, sustainability assurance, and government financial stewardship.

> **Informational profile website concept for presentation purposes.**

## Design

An elevated, environment-themed aesthetic appropriate to the subject's ESG and sustainability focus:

- **Palette:** deep forest green + warm gold, on a soft cream/paper base
- **Type:** Cormorant Garamond (serif display) paired with Inter (sans body)
- Cinematic hero, scroll-reveal animations, a career timeline, and refined cards

## Stack

Frontend-only, zero-build static site:

- `index.html` — semantic, SEO-optimized markup with Person structured data
- `styles.css` — design system (custom properties, responsive grid, animations)
- `script.js` — sticky nav, mobile menu, scroll-reveal, demo enquiry form

No dependencies, no build step. Photography is loaded from Unsplash (royalty-free, commercial use).

## Sections

Hero · Stats · About · Areas of Expertise · ESG & Sustainability · Career Timeline · Teaching & Academia · Professional Service · Speaking & Visibility · Contact · Footer

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Notes

- Biographical content is drawn from the subject's public professional profile.
- The contact form is a front-end demo and does not transmit data.

---

### Previous concept

The earlier Offset Plumbing website concept is preserved on the
`claude/quirky-johnson-C3az0` branch.
