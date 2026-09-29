// Rafael Cabusao — Portfolio
// Vanilla JS: nav, scroll-spy, globe canvas, typed roles, counters, tilt, project slider, form validation.

document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const closeMenu = () => {
    hamburger.classList.remove('open'); navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
  };
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Smooth scroll ---------- */
  const header = document.querySelector('.site-header');
  const navHeight = header.offsetHeight;
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id.length <= 1) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - navHeight + 1, behavior: 'smooth' });
    history.pushState(null, '', id);
  }));

  /* ---------- Header state + scroll progress + school parallax ---------- */
  const bar = document.getElementById('progress');
  const schoolImg = document.querySelector('.school img');
  const school = document.getElementById('school');
  function onScroll() {
    header.classList.toggle('scrolled', scrollY > 8);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
    if (!reduce && schoolImg) {
      const r = school.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        schoolImg.style.transform = `scale(1.32) translateY(${p * -40}px)`;
      }
    }
  }
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Scroll-spy ---------- */
  const linkMap = new Map();
  document.querySelectorAll('.nav-link').forEach(l => linkMap.set(l.getAttribute('href').slice(1), l));
  const spy = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const l = linkMap.get(en.target.id);
    if (!l) return;
    linkMap.forEach(x => x.classList.remove('active'));
    l.classList.add('active');
  }), { rootMargin: `-${navHeight + 20}px 0px -60% 0px` });
  ['about', 'skills', 'projects', 'school', 'contact'].forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });

  /* ---------- Reveal + count-up ---------- */
  function countUp(el) {
    const to = +el.dataset.count;
    if (reduce) { el.textContent = to; return; }
    let n = 0;
    const step = () => { n++; el.textContent = n; if (n < to) setTimeout(step, 180); };
    step();
  }
  const io = new IntersectionObserver((es, o) => es.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in-view');
    en.target.querySelectorAll('[data-count]').forEach(countUp);
    o.unobserve(en.target);
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Typed roles ---------- */
  const typed = document.getElementById('typed');
  const roles = ['web systems.', 'AI-assisted workflows.', 'database-driven sites.', 'smarter business operations.'];
  if (reduce) typed.textContent = roles[0];
  else {
    let ri = 0, ci = 0, del = false;
    (function tick() {
      const word = roles[ri];
      ci += del ? -1 : 1;
      typed.textContent = word.slice(0, ci);
      let wait = del ? 35 : 75;
      if (!del && ci === word.length) { del = true; wait = 1500; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 350; }
      setTimeout(tick, wait);
    })();
  }

  /* ---------- Card spotlight + tilt ---------- */
  if (!reduce) document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', x * 100 + '%');
      card.style.setProperty('--my', y * 100 + '%');
      card.style.transform = `perspective(700px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- Project slider ---------- */
  const slides = [...document.querySelectorAll('.slide')];
  const cur = document.getElementById('cur');
  const nextTitle = document.getElementById('upNextTitle');
  let idx = 0, timer;
  function show(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('active', n === idx));
    cur.textContent = String(idx + 1).padStart(2, '0');
    nextTitle.textContent = slides[(idx + 1) % slides.length].dataset.title;
  }
  const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(idx + 1), 7000); };
  const go = i => { show(i); auto(); };
  document.getElementById('next').addEventListener('click', () => go(idx + 1));
  document.getElementById('prev').addEventListener('click', () => go(idx - 1));
  document.getElementById('upNext').addEventListener('click', () => go(idx + 1));
  const slider = document.getElementById('slider');
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', auto);
  show(0); auto();

  /* ---------- Hero globe (canvas) ---------- */
  const cv = document.getElementById('globe');
  const ctx = cv.getContext('2d');
  const N = 260, pts = [], links = [];
  for (let i = 0; i < N; i++) {           // fibonacci sphere
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = i * 2.399963;
    pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
    if (d < 0.27) links.push([i, j]);
  }
  let size = 0, rot = 0;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    size = cv.clientWidth;
    cv.width = cv.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw() {
    ctx.clearRect(0, 0, size, size);
    const R = size * 0.36, c = size / 2, cs = Math.cos(rot), sn = Math.sin(rot);
    const g = ctx.createRadialGradient(c, c, R * 0.2, c, c, R * 1.25);
    g.addColorStop(0, 'rgba(90,80,255,.28)'); g.addColorStop(1, 'rgba(90,80,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    const p = pts.map(([x, y, z]) => {
      const rx = x * cs + z * sn, rz = -x * sn + z * cs;
      return [c + rx * R, c + y * R, rz];
    });
    ctx.lineWidth = 0.6;
    links.forEach(([i, j]) => {
      const a = p[i], b = p[j], depth = (a[2] + b[2]) / 2;
      ctx.strokeStyle = `rgba(110,190,255,${0.05 + (depth + 1) * 0.16})`;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    });
    p.forEach(([x, y, z], i) => {
      ctx.fillStyle = i % 17 === 0 ? `rgba(63,210,255,${0.6 + z * 0.4})` : `rgba(190,180,255,${0.25 + (z + 1) * 0.35})`;
      ctx.beginPath(); ctx.arc(x, y, (i % 17 === 0 ? 2.6 : 1.4) * (0.7 + (z + 1) * 0.3), 0, 6.283); ctx.fill();
    });
    rot += 0.0035;
    if (!reduce) requestAnimationFrame(draw);
  }
  resize(); draw();
  addEventListener('resize', () => { resize(); if (reduce) draw(); });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const fields = {};
  ['name', 'email', 'message'].forEach(k => {
    fields[k] = { input: document.getElementById(k), error: document.getElementById(k + 'Error') };
  });
  function validateField(key) {
    const { input, error } = fields[key];
    const v = input.value.trim();
    let msg = '';
    if (!v) msg = 'This field is required.';
    else if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid email address.';
    else if (key === 'message' && v.length < 10) msg = 'Message should be at least 10 characters.';
    error.textContent = msg;
    input.closest('.field').classList.toggle('invalid', Boolean(msg));
    return !msg;
  }
  Object.keys(fields).forEach(k => {
    fields[k].input.addEventListener('blur', () => validateField(k));
    fields[k].input.addEventListener('input', () => {
      if (fields[k].input.closest('.field').classList.contains('invalid')) validateField(k);
    });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!Object.keys(fields).map(validateField).every(Boolean)) {
      formStatus.style.color = 'var(--red)';
      formStatus.textContent = 'Please fix the highlighted fields.';
      return;
    }
    // No backend yet: connect a form endpoint (Formspree, Netlify Forms, etc.) here.
    formStatus.style.color = 'var(--green)';
    formStatus.textContent = 'Thanks — your message is ready to send. Connect a form backend to deliver it.';
    form.reset();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
});
