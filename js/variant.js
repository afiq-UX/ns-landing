/* ==========================================================================
   variant.js — the three behaviours index-v2.html adds. Loaded only by that
   page, after megamenu.js.

   Same contract as the rest of the prototype: if this file never arrives,
   the page is still usable. The hero shows its poster, the search icon
   still opens the panel (an anchor pointed at #search-modal, opened by
   :target in variant.css), and Kenali dan Lawati sits on its first slide.
   Nothing here is load-bearing for reading the page.
   ========================================================================== */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ======================================================================
     1 · Hero footage

     Autoplay is declared in the markup so playback starts without waiting
     for this file. All that happens here is the part markup cannot do:
     honouring reduced motion, and offering a pause control — a loop past
     five seconds needs one (WCAG 2.2 SC 2.2.2).

     The button stays hidden until the footage actually plays. Before the
     mp4 is dropped in, the hero is a poster frame and a pause button would
     control nothing.
     ====================================================================== */
  (function heroVideo() {
    var video = document.querySelector('.hero__video');
    var button = document.querySelector('.hero__pause');
    if (!video) return;

    var paused = false;

    var setState = function (isPaused) {
      paused = isPaused;
      if (isPaused) video.pause(); else video.play().catch(function () {});
      if (!button) return;
      button.setAttribute('aria-pressed', String(isPaused));
      button.setAttribute('aria-label', isPaused ? 'Main video latar' : 'Jeda video latar');
    };

    // Motion off: hold the poster frame and offer no control, because
    // there is nothing running to pause.
    if (reduced.matches) {
      video.removeAttribute('autoplay');
      video.pause();
    } else if (button) {
      video.addEventListener('playing', function reveal() {
        video.removeEventListener('playing', reveal);
        button.hidden = false;
      });
      button.addEventListener('click', function () { setState(!paused); });
    }

    // Turned on mid-session: stop, and take the control away with it.
    var onChange = function (e) {
      if (!e.matches) return;
      video.pause();
      if (button) button.hidden = true;
    };
    if (reduced.addEventListener) reduced.addEventListener('change', onChange);
    else if (reduced.addListener) reduced.addListener(onChange);
  })();


  /* ======================================================================
     2 · Search dialog

     Upgrades the anchor into a real dialog: focus moves in, Tab is trapped,
     Escape returns focus to where it came from.

     Nothing here closes the megamenu. It closes itself — megamenu.js
     already listens for a click anywhere outside its own trigger and panel,
     and the search icon is outside both, so opening search dismisses an
     open menu through that existing path rather than a second one.
     ====================================================================== */
  (function searchDialog() {
    var trigger = document.querySelector('.masthead__search');
    var modal = document.getElementById('search-modal');
    if (!trigger || !modal) return;

    var field = modal.querySelector('.search__field');
    var root = document.documentElement;
    var open = false;

    var focusable = function () {
      return Array.prototype.filter.call(
        modal.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'),
        function (el) { return el.offsetParent !== null || el === field; }
      );
    };

    function show() {
      if (open) return;
      open = true;
      modal.hidden = false;
      root.classList.add('is-search-open');
      trigger.setAttribute('aria-expanded', 'true');
      if (field) field.focus();
    }

    function hide() {
      if (!open) return;
      open = false;
      modal.hidden = true;
      root.classList.remove('is-search-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }

    trigger.addEventListener('click', function (event) {
      event.preventDefault();   // no hash, so :target stays the no-JS path
      if (open) hide(); else show();
    });

    Array.prototype.forEach.call(modal.querySelectorAll('[data-search-close]'), function (el) {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        hide();
      });
    });

    document.addEventListener('keydown', function (event) {
      if (!open) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        hide();
        return;
      }

      if (event.key !== 'Tab') return;

      // Keep the loop inside the dialog: a dialog that tabs out to the page
      // behind it is modal in appearance only.
      var items = focusable();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  })();


  /* ======================================================================
     3 · Kenali dan Lawati

     Four photographs, four text panels, one pair showing at a time. CSS
     owns the cross-fade; this only moves the index and keeps the bars,
     panels and aria state in step.

     It advances on its own because the frame draws a progress strip, but:
     it never runs while off screen, it pauses under the pointer or a
     focused control, it stops for good the moment someone takes over, and
     it does not start at all when motion is off. An auto-advancing
     carousel with no way to stop it fails SC 2.2.2.
     ====================================================================== */
  (function lawat() {
    var section = document.querySelector('.lawat');
    if (!section) return;

    var slides = Array.prototype.slice.call(section.querySelectorAll('.lawat__slide'));
    var panels = Array.prototype.slice.call(section.querySelectorAll('.lawat__panel'));
    var bars = Array.prototype.slice.call(section.querySelectorAll('.lawat__bar'));
    var prev = section.querySelector('.lawat__nav--prev');
    var next = section.querySelector('.lawat__nav--next');
    if (slides.length < 2 || panels.length !== slides.length) return;

    var index = 0;
    var timer = null;
    var surrendered = reduced.matches;   // motion off: never auto-advance
    var onScreen = false;

    var hold = function () {
      var raw = getComputedStyle(document.documentElement).getPropertyValue('--slide-hold');
      var ms = parseFloat(raw);
      return isNaN(ms) ? 6400 : ms;
    };

    function paint() {
      slides.forEach(function (el, i) { el.classList.toggle('is-current', i === index); });
      panels.forEach(function (el, i) {
        var on = i === index;
        el.classList.toggle('is-current', on);
        if (on) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', 'true');
      });
      bars.forEach(function (el, i) {
        var on = i === index;
        el.classList.toggle('is-current', on);
        if (on) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
      });
    }

    function go(to) {
      index = (to + slides.length) % slides.length;
      paint();
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function start() {
      if (surrendered || !onScreen || timer) return;
      timer = setInterval(function () { go(index + 1); }, hold());
    }

    // Any deliberate move hands control over for the rest of the visit.
    function takeOver(to) {
      surrendered = true;
      stop();
      go(to);
    }

    if (prev) prev.addEventListener('click', function () { takeOver(index - 1); });
    if (next) next.addEventListener('click', function () { takeOver(index + 1); });
    bars.forEach(function (bar, i) {
      bar.addEventListener('click', function () { takeOver(i); });
    });

    section.addEventListener('pointerenter', stop);
    section.addEventListener('pointerleave', start);
    section.addEventListener('focusin', stop);
    section.addEventListener('focusout', function (event) {
      if (!section.contains(event.relatedTarget)) start();
    });

    // Off screen it does nothing at all — no timer, no repaints behind the
    // reader's back.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          onScreen = entry.isIntersecting;
          if (onScreen) start(); else stop();
        });
      }, { threshold: 0.35 }).observe(section);
    } else {
      onScreen = true;
      start();
    }

    var onChange = function (e) {
      if (!e.matches) return;
      surrendered = true;
      stop();
    };
    if (reduced.addEventListener) reduced.addEventListener('change', onChange);
    else if (reduced.addListener) reduced.addListener(onChange);

    paint();
  })();
})();
