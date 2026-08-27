# Forward Fitness Club Website

A responsive, multi-page fitness club website built with plain HTML, CSS and JavaScript — no frameworks, no build step.

## Overview

Six pages sharing a common header/footer and design system:

| Page | Purpose |
|---|---|
| `index.html` | Home — hero, value props, featured classes, testimonial slider, CTA |
| `about.html` | Studio story, mission/values, facility highlights |
| `classes.html` | Filterable class catalogue + weekly schedule with day tabs |
| `trainers.html` | Coach roster with specialties |
| `membership.html` | Pricing plans with a monthly/annual toggle |
| `contact.html` | Validated contact form, club info, map placeholder, FAQ accordion |

## Highlights

- **Mobile-first responsive design** — base styles target small screens; `min-width` media queries progressively enhance layout for tablet/desktop (CSS Grid + Flexbox, no fixed pixel widths).
- **Accessible navigation** — semantic landmarks, `aria-expanded`/`aria-controls` on the mobile menu toggle, keyboard-reachable interactive elements, visible focus states on form fields.
- **Vanilla JS interactivity** (`js/script.js`, one shared file across all pages):
  - Mobile nav drawer with active-link detection per page
  - Sticky header with scroll shadow
  - Scroll-reveal animations via `IntersectionObserver`
  - Testimonial carousel (autoplay + manual controls + dots)
  - Class category filter and weekly-schedule day tabs
  - Monthly/annual pricing toggle
  - FAQ accordion
  - Client-side contact-form validation with inline error messages
  - Back-to-top button
- **Performance-conscious**: no external JS dependencies, a single CSS/JS file reused by every page (cached after first load), CSS variables for consistent theming, and SVG-free iconography (Unicode/emoji + CSS gradients) to avoid extra image requests.

## Running locally

No build tooling required — just open `index.html` in a browser, or serve the folder statically:

```bash
cd forward-fitness-club
python3 -m http.server 8080
# then open http://localhost:8080
```

## Structure

```
forward-fitness-club/
  index.html
  about.html
  classes.html
  trainers.html
  membership.html
  contact.html
  css/style.css
  js/script.js
```
