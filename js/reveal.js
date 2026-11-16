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
      el.classList.add('is-in');
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
