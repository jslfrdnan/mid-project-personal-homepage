(function () {
  'use strict';

  /* ---------------------------------------------------------
     Typewriter effect for hero tagline
     --------------------------------------------------------- */
  function runTypewriter() {
    const target = document.querySelector('[data-typed]');
    if (!target) return;
    const phrases = (target.dataset.typed || '')
      .split('|')
      .map(s => s.trim())
      .filter(Boolean);
    if (!phrases.length) return;

    const span = document.createElement('span');
    span.className = 'typed';
    target.textContent = '';
    target.appendChild(span);

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        span.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
      } else {
        charIndex--;
        span.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 40 : 80);
    }

    setTimeout(tick, 600);
  }

  /* ---------------------------------------------------------
     Reveal-on-scroll
     --------------------------------------------------------- */
  function runReveal() {
    const items = document.querySelectorAll('[data-reveal], .reveal, .card, .gallery-grid figure');
    if (!('IntersectionObserver' in window) || !items.length) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(el => obs.observe(el));
  }

  /* ---------------------------------------------------------
     Live clock
     --------------------------------------------------------- */

  function runLiveClock() {
    const el = document.querySelector('[data-clock]');
    if (!el) return;
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function tick() {
      const d = new Date();
      el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     Active nav link (matches current page)
     --------------------------------------------------------- */
  function markActiveNav() {
    const links = document.querySelectorAll('.nav-list a[data-page]');
    if (!links.length) return;
    const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    let activeKey;
    if (path === '' || path === 'index.html') activeKey = 'profile';
    else if (path.startsWith('blog')) activeKey = 'blog';
    else if (path.startsWith('gallery')) activeKey = 'gallery';
    else if (path.startsWith('contact')) activeKey = 'contact';
    links.forEach(a => {
      a.classList.toggle('active', a.dataset.page === activeKey);
    });
  }

  /* ---------------------------------------------------------
     Scroll-to-top floating button
     --------------------------------------------------------- */
  function bindScrollTop() {
    const btn = document.querySelector('[data-scroll-top]');
    if (!btn) return;
    function onScroll() {
      btn.classList.toggle('is-shown', window.scrollY > 320);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     AJAX dynamic quote (home page)
     fetches a random programming quote from a public API
     --------------------------------------------------------- */
  function runQuoteFetch() {
    const card = document.querySelector('[data-quote]');
    if (!card) return;
    const textEl = card.querySelector('.quote-text');
    const authorEl = card.querySelector('.quote-author');
    const refreshBtn = card.querySelector('.quote-refresh');

    function load() {
      card.classList.add('is-loading');
      textEl.textContent = 'fetching insight';
      authorEl.textContent = '';
      fetch('https://dummyjson.com/quotes/random')
        .then(r => {
          if (!r.ok) throw new Error('http ' + r.status);
          return r.json();
        })
        .then(data => {
          card.classList.remove('is-loading');
          textEl.textContent = '"' + data.quote + '"';
          authorEl.textContent = '— ' + (data.author || 'unknown');
        })
        .catch(() => {
          card.classList.remove('is-loading');
          textEl.textContent = '"Stay curious. Keep building."';
          authorEl.textContent = '— offline cache';
        });
    }
    load();
    if (refreshBtn) refreshBtn.addEventListener('click', load);
  }

  /* ---------------------------------------------------------
     Gallery lightbox
     --------------------------------------------------------- */
  function runLightbox() {
    const triggers = document.querySelectorAll('[data-lightbox]');
    if (!triggers.length) return;

    const items = Array.from(triggers).map(node => {
      const isFigure = node.tagName.toLowerCase() === 'figure';
      let media = isFigure ? node.querySelector('img, video') : node;
      const captionEl = isFigure ? node.querySelector('figcaption') : null;
      const tag = (media && media.tagName.toLowerCase()) || 'img';
      const src = media ? (media.currentSrc || media.src ||
        (media.querySelector && media.querySelector('source') &&
         media.querySelector('source').src) || '') : '';
      const caption = captionEl ? captionEl.textContent :
        (media && media.alt) || '';
      return { tag, src, caption };
    });

    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = `
      <div class="lightbox-stage">
        <span class="lightbox-counter"></span>
        <button class="lightbox-btn lightbox-close" aria-label="Close">&times;</button>
        <button class="lightbox-btn lightbox-prev" aria-label="Previous">&larr;</button>
        <button class="lightbox-btn lightbox-next" aria-label="Next">&rarr;</button>
        <div class="lightbox-media"></div>
        <div class="lightbox-caption"></div>
      </div>`;
    document.body.appendChild(overlay);

    const mediaSlot = overlay.querySelector('.lightbox-media');
    const capSlot = overlay.querySelector('.lightbox-caption');
    const counter = overlay.querySelector('.lightbox-counter');
    let idx = 0;

    function render() {
      const it = items[idx];
      if (!it) return;
      mediaSlot.innerHTML = '';
      let el;
      if (it.tag === 'video') {
        el = document.createElement('video');
        el.controls = true;
        el.autoplay = true;
        el.preload = 'metadata';
        const s = document.createElement('source');
        s.src = it.src;
        s.type = 'video/mp4';
        el.appendChild(s);
      } else {
        el = document.createElement('img');
        el.src = it.src;
        el.alt = it.caption || '';
      }
      mediaSlot.appendChild(el);
      capSlot.textContent = it.caption || '';
      counter.textContent = `// ${idx + 1} / ${items.length}`;
    }

    function open(i) {
      idx = i;
      render();
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('is-open');
      mediaSlot.innerHTML = '';
      document.body.style.overflow = '';
    }
    function next() { idx = (idx + 1) % items.length; render(); }
    function prev() { idx = (idx - 1 + items.length) % items.length; render(); }

    triggers.forEach((node, i) => {
      node.addEventListener('click', (e) => {
        const tag = node.tagName.toLowerCase();
        if (tag === 'video') return;
        if (tag === 'figure') {
          const inner = e.target.tagName.toLowerCase();
          if (inner === 'video' && e.target.controls) return;
        }
        e.preventDefault();
        open(i);
      });
    });

    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.lightbox-prev').addEventListener('click', prev);
    overlay.querySelector('.lightbox-next').addEventListener('click', next);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    runLiveClock();
    markActiveNav();
    runTypewriter();
    runReveal();
    runQuoteFetch();
    runLightbox();
    bindScrollTop();
  });
})();
