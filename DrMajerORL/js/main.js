// ===== Dr Jacques Majer — interactions =====

// Sticky header
const header = document.getElementById('header');
const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
  fab.classList.toggle('visible', window.scrollY > 600);
};

// Floating CTA
const fab = document.getElementById('fab');
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
nav.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  })
);

// Scroll reveal
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Animated counters
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll('.trust-num').forEach((el) => countObserver.observe(el));

// Active nav link on scroll
const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...nav.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) =>
        l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);
sections.forEach((s) => sectionObserver.observe(s));

// Cards: hover reveals the description on desktop (CSS :hover);
// tapping toggles it open/closed on touch devices (no hover there).
document.querySelectorAll('.cards-grid .card, .surgery-grid .surgery-item').forEach((el) => {
  el.addEventListener('click', () => el.classList.toggle('is-active'));
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
