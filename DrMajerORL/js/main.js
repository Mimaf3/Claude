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
// Uses the position:fixed body-lock trick (not just overflow:hidden) because
// on mobile Safari, a fixed-position overlay opened while the page is scrolled
// otherwise renders offset from the visual viewport, showing only its bottom half.
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
let lockedScrollY = 0;

function openMenu() {
  lockedScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  nav.classList.add('open');
  burger.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  nav.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  window.scrollTo(0, lockedScrollY);
}

burger.addEventListener('click', () => {
  if (nav.classList.contains('open')) closeMenu();
  else openMenu();
});
nav.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    if (nav.classList.contains('open')) closeMenu();
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

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
