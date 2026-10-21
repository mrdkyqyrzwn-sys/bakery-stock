/* Klipi mockup: shared behaviour (nav state, mobile menu, scroll reveals) */
(function () {
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const btn = nav.querySelector('.nav-menu-btn');
    const sheet = document.getElementById('nav-sheet');
    if (btn && sheet) {
      const set = open => {
        btn.setAttribute('aria-expanded', open);
        sheet.dataset.open = open;
        btn.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
      };
      btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
      sheet.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
    }
  }

  /* Scroll reveals: content is visible by default. Only groups that start
     below the fold are put on hold (.rv-wait), then revealed once (.rv-in). */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const groups = document.querySelectorAll('[data-reveal-group]');
  if (!reduce && 'IntersectionObserver' in window && groups.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.remove('rv-wait');
        e.target.classList.add('rv-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    groups.forEach(g => {
      if (g.getBoundingClientRect().top > window.innerHeight) {
        g.classList.add('rv-wait');
        io.observe(g);
      }
    });
  }
})();
