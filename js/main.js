(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const setScrolled = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  const closeMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('open');
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.querySelectorAll('[data-current-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

  // Reveal sections as they enter the viewport, with a graceful fallback.
  const revealItems = document.querySelectorAll(
    '.page-hero-copy, .welcome-photo, .welcome-copy, .section-heading, .home-photo, .home-cta, .dish-card, .booking-intro, .site-form, .story-grid > *, .about-photo, .contact-details'
  );
  if ('IntersectionObserver' in window && revealItems.length) {
    document.body.classList.add('reveal-ready');
    revealItems.forEach((item, index) => {
      item.dataset.reveal = '';
      if (item.classList.contains('dish-card') || item.classList.contains('about-photo') || item.classList.contains('home-photo')) {
        item.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
      }
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => observer.observe(item));
  }
})();
