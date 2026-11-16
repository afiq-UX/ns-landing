/* ==========================================================================
   reveal.js — scroll-into-view reveals.

   Design notes:
   - The hidden state is added by JS (html.js-reveal), never by CSS alone.
     If this file fails to load, every section renders visible. A reveal
     system that can hide content permanently is a bug, not an effect.
   - prefers-reduced-motion is checked here as well as in CSS, so we skip
     the observer entirely rather than animate invisibly.
   - Elements are unobserved once revealed. No replay on scroll-up: a
     section that re-animates every pass reads as a glitch, not polish.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // No IntersectionObserver (or motion is off) → leave the page static.
  if (!('IntersectionObserver' in window) || reduced.matches) return;

  root.classList.add('js-reveal');

  // ---- Load reveal: the masthead arrives once, on first paint. ----------
  // Indexed in document order, so the cascade follows the eye: brand,
  // then the utility row, then the primary nav.
  var loadItems = Array.prototype.slice.call(
    document.querySelectorAll('[data-load]')
  );
  loadItems.forEach(function (el, i) { el.style.setProperty('--i', i); });

  // Publish the last index so CSS can work out when the masthead finishes
  // and start the hero there, without hardcoding how many links exist.
  root.style.setProperty('--load-last', Math.max(loadItems.length - 1, 0));

  var showMasthead = function () {
    // Opened in a background tab (cmd-click, a restored session)? rAF is
    // paused there, so the sequence would never start and the intro would
    // be spent on a tab nobody is looking at. Wait for the first look.
    if (document.hidden) {
      document.addEventListener('visibilitychange', function onShow() {
        if (document.hidden) return;
        document.removeEventListener('visibilitychange', onShow);
        showMasthead();
      });
      return;
    }
    // Two frames: one for the hidden state to be committed, one to flip it,
    // otherwise the browser collapses both into no transition at all.
    var start = function () { root.classList.add('is-loaded'); };
    requestAnimationFrame(function () { requestAnimationFrame(start); });
    // Some embedded and throttled contexts starve rAF without ever setting
    // document.hidden, and then the sequence would never begin at all.
    // A timer cannot be starved the same way, so it backs the frames up.
    setTimeout(start, 400);
  };

  // Wait for the webfonts where we can — the brand lockup reflowing
  // mid-animation is worse than starting 100ms later.
  if (document.fonts && document.fonts.ready) {
    var fired = false;
    var go = function () { if (!fired) { fired = true; showMasthead(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 600); // never hold the page hostage to a slow font CDN
  } else {
    showMasthead();
  }

  var targets = Array.prototype.slice.call(
    document.querySelectorAll('[data-reveal]')
  );

  // Give staggered children their index up front.
  targets.forEach(function (el) {
    var mode = el.getAttribute('data-reveal');
    if (mode !== 'stagger' && mode !== 'wipe') return;
    Array.prototype.forEach.call(el.children, function (child, i) {
      child.style.setProperty('--i', i);
    });
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    {
      // Fire when the element is ~15% in, and only once it has cleared
      // the bottom 12% of the viewport — stops things animating while
      // still half off-screen on short laptops.
      threshold: 0.15,
      rootMargin: '0px 0px -12% 0px'
    }
  );

  targets.forEach(function (el) {
    // Anything already on screen at load reveals immediately rather than
    // waiting for a scroll that may never come.
    var box = el.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.85) {
      // Marked so CSS can give it a place in the load sequence. Only the
      // first screenful gets one: the same element reached by scrolling
      // must reveal on arrival, not sit through a delay meant for load.
      el.classList.add('at-load', 'is-in');
      return;
    }
    observer.observe(el);
  });

  // If the person turns reduced motion on mid-session, reveal the rest
  // and stop observing.
  var onChange = function (e) {
    if (!e.matches) return;
    observer.disconnect();
    targets.forEach(function (el) { el.classList.add('is-in'); });
  };
  if (reduced.addEventListener) reduced.addEventListener('change', onChange);
  else if (reduced.addListener) reduced.addListener(onChange);
})();
