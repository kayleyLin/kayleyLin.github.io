'use strict';

/* ─── Mobile nav ──────────────────────────────────────── */
const toggle  = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (toggle && mainNav) {
  toggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    const lines = [...toggle.querySelectorAll('.bar-line')];
    if (open) {
      lines[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      lines[1].style.opacity   = '0';
      lines[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      lines[0].style.transform = lines[2].style.transform = '';
      lines[1].style.opacity = '';
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('header')) mainNav.classList.remove('open');
  });

  mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mainNav.classList.remove('open'));
  });
}

/* ─── Scroll reveal ───────────────────────────────────────
   Blocks fade and rise as they come into view. The .reveal class is
   applied here rather than in the markup so that without JavaScript
   the page renders fully visible instead of blank. Anything already
   on screen at load is revealed immediately, so the first screen
   never animates in under the reader. */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced && 'IntersectionObserver' in window) {
  const blocks = document.querySelectorAll(
    // .media-block sits inside .three-part-section, which already reveals; observing
    // both would run the transition twice on the same pixels.
    '.entry, .three-part-section, .gallery-group, .section-head, .loop, .hero .sub'
  );

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  blocks.forEach(el => {
    // Already visible on load: show it now, no animation.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      el.classList.add('reveal', 'in');
    } else {
      el.classList.add('reveal');
      io.observe(el);
    }
  });
}

/* ─── Reading progress ────────────────────────────────────
   Only on pages long enough for position to be a real question. */
(function () {
  const doc = document.documentElement;
  const scrollable = () => doc.scrollHeight - window.innerHeight;
  if (scrollable() < window.innerHeight * 1.5) return;

  const bar = document.createElement('div');
  bar.id = 'progress';
  document.body.appendChild(bar);

  let ticking = false;
  const update = () => {
    const max = scrollable();
    bar.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0';
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
})();
