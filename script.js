// ==========================================================================
// Jordan Ellis — Portfolio
// Vanilla JS: mobile nav, smooth scroll, scroll-spy, reveal animations,
// header state, and lightweight contact-form validation.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Mobile hamburger menu ---------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close menu when a link is tapped (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------------- Smooth scrolling for anchor links ---------------- */
  const navHeight = document.querySelector('.site-header').offsetHeight;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return; // just "#"
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });

      // update the URL hash without jumping
      history.pushState(null, '', targetId);
    });
  });

  /* ---------------- Header shadow on scroll ---------------- */
  const header = document.querySelector('.site-header');
  function onScrollHeader() {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------------- Scroll-spy: highlight active nav link ---------------- */
  const sections = ['about', 'skills', 'projects', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinkMap = new Map();
  document.querySelectorAll('.nav-link').forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    navLinkMap.set(id, link);
  });

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = navLinkMap.get(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinkMap.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: `-${navHeight + 20}px 0px -60% 0px`, threshold: 0 });

  sections.forEach(section => spyObserver.observe(section));

  /* ---------------- Scroll reveal animations ---------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: just show everything
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------------- Contact form validation ---------------- */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  const fields = {
    name: { input: document.getElementById('name'), error: document.getElementById('nameError') },
    email: { input: document.getElementById('email'), error: document.getElementById('emailError') },
    message: { input: document.getElementById('message'), error: document.getElementById('messageError') },
  };

  function validateField(key) {
    const { input, error } = fields[key];
    let message = '';

    if (!input.value.trim()) {
      message = 'This field is required.';
    } else if (key === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(input.value.trim())) {
        message = 'Enter a valid email address.';
      }
    } else if (key === 'message' && input.value.trim().length < 10) {
      message = 'Message should be at least 10 characters.';
    }

    error.textContent = message;
    input.closest('.field').classList.toggle('invalid', Boolean(message));
    return !message;
  }

  Object.keys(fields).forEach(key => {
    fields[key].input.addEventListener('blur', () => validateField(key));
    fields[key].input.addEventListener('input', () => {
      if (fields[key].input.closest('.field').classList.contains('invalid')) {
        validateField(key);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const results = Object.keys(fields).map(validateField);
    const allValid = results.every(Boolean);

    if (!allValid) {
      formStatus.style.color = 'var(--accent-red)';
      formStatus.textContent = 'Please fix the highlighted fields.';
      return;
    }

    // No backend is wired up — this is a static site. Replace this block
    // with a fetch() call to your form endpoint (Formspree, Netlify Forms,
    // a serverless function, etc.) when you're ready to receive messages.
    formStatus.style.color = 'var(--accent-green)';
    formStatus.textContent = 'Thanks — your message is ready to send. Connect a form backend to deliver it.';
    form.reset();
  });

  /* ---------------- Footer year ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();

});
