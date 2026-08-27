/* Forward Fitness Club — shared front-end behaviour (vanilla JS, no dependencies) */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initStickyHeader();
  initScrollReveal();
  initBackToTop();
  initTestimonialSlider();
  initClassFilter();
  initScheduleTabs();
  initPricingToggle();
  initFaqAccordion();
  initContactForm();
  initNewsletterForm();
  setYear();
});

/* Mobile navigation toggle + active-link highlighting */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  const currentPage = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-menu a').forEach((link) => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('is-active');
    }
  });
}

/* Shrink/shadow header once the page scrolls */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Fade/slide elements into view as they enter the viewport */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* Back-to-top button */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => btn.classList.toggle('is-visible', window.scrollY > 500),
    { passive: true }
  );

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* Testimonial carousel (home page) */
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.testimonial-slide'));
  const dotsWrap = slider.querySelector('.slider-dots');
  const prevBtn = slider.querySelector('.slider-arrow.prev');
  const nextBtn = slider.querySelector('.slider-arrow.next');
  let current = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function restartAutoplay() {
    clearInterval(timer);
    timer = setInterval(next, 6000);
  }

  nextBtn?.addEventListener('click', () => { next(); restartAutoplay(); });
  prevBtn?.addEventListener('click', () => { prev(); restartAutoplay(); });

  restartAutoplay();
}

/* Classes page: filter class cards by category */
function initClassFilter() {
  const filterBar = document.querySelector('.filter-bar');
  const cards = document.querySelectorAll('.class-card');
  if (!filterBar || !cards.length) return;

  filterBar.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const category = btn.dataset.filter;
    cards.forEach((card) => {
      const match = category === 'all' || card.dataset.category === category;
      card.classList.toggle('hidden', !match);
    });
  });
}

/* Classes page: weekly schedule day tabs */
function initScheduleTabs() {
  const tabs = document.querySelector('.schedule-tabs');
  const rows = document.querySelectorAll('table.schedule tbody tr');
  if (!tabs || !rows.length) return;

  tabs.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;

    tabs.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const day = btn.dataset.day;
    rows.forEach((row) => {
      const match = day === 'all' || row.dataset.day === day;
      row.classList.toggle('hidden', !match);
    });
  });
}

/* Membership page: monthly / annual price toggle */
function initPricingToggle() {
  const toggle = document.querySelector('.pricing-toggle .switch');
  const priceEls = document.querySelectorAll('[data-monthly][data-annual]');
  if (!toggle || !priceEls.length) return;

  toggle.addEventListener('click', () => {
    const isAnnual = toggle.classList.toggle('is-annual');
    toggle.setAttribute('aria-checked', String(isAnnual));

    priceEls.forEach((el) => {
      const value = isAnnual ? el.dataset.annual : el.dataset.monthly;
      el.querySelector('.amount').textContent = `$${value}`;
      el.querySelector('.period').textContent = isAnnual ? '/mo, billed yearly' : '/month';
    });
  });
}

/* FAQ accordion (contact page) */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
}

/* Contact form: client-side validation + simulated submit */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const status = form.querySelector('.form-status');

  const validators = {
    name: (v) => v.trim().length >= 2 || 'Please enter your full name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
    phone: (v) => v.trim() === '' || /^[\d\s()+-]{7,}$/.test(v) || 'Enter a valid phone number.',
    message: (v) => v.trim().length >= 10 || 'Message should be at least 10 characters.',
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;

    Object.keys(validators).forEach((name) => {
      const input = form.elements[name];
      if (!input) return;
      const field = input.closest('.field');
      const result = validators[name](input.value);

      if (result !== true) {
        field.classList.add('has-error');
        field.querySelector('.error-msg').textContent = result;
        isValid = false;
      } else {
        field.classList.remove('has-error');
      }
    });

    if (!isValid) {
      status.classList.remove('is-visible');
      return;
    }

    status.textContent = "Thanks! Your message has been sent — we'll get back to you within one business day.";
    status.classList.add('is-visible');
    form.reset();
  });
}

/* Footer newsletter signup */
function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input.value.trim()) return;

    const button = form.querySelector('button');
    const original = button.textContent;
    button.textContent = 'Subscribed!';
    input.value = '';
    setTimeout(() => { button.textContent = original; }, 2500);
  });
}

function setYear() {
  document.querySelectorAll('.current-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}
