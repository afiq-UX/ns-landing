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

     There is no seeking here any more. Both sources are cut to the stretch
     the hero plays — the first ten seconds of the film — so the element
     loops the whole file and the window needs no help from script.
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

     It advances on its own, as the frame's progress strip implies, and
     the hold button is the only thing that stops it — not a click on the
     arrows, not the pointer resting over the section, not a focused
     control. A carousel that stalls whenever the cursor happens to sit on
     it reads as broken, and nothing in the frame tells you hovering was
     meant to do anything. Taking an arrow or a bar moves it and buys a
     full fresh hold instead.

     The strip is a round rather than a lamp: bars already shown stay full,
     and the fill drops back to empty on the wrap round to slide one. The
     hold freezes the current fill where it stands and resumes from there.

     Around that: it never runs off screen, and it does not start at all
     when motion is off. The hold button is also what SC 2.2.2 requires of
     anything that moves on its own for more than five seconds.
     ====================================================================== */
  (function lawat() {
    var section = document.querySelector('.lawat');
    if (!section) return;

    var slides = Array.prototype.slice.call(section.querySelectorAll('.lawat__slide'));
    var panels = Array.prototype.slice.call(section.querySelectorAll('.lawat__panel'));
    var bars = Array.prototype.slice.call(section.querySelectorAll('.lawat__bar'));
    var text = section.querySelector('.lawat__text');
    var prev = section.querySelector('.lawat__nav--prev');
    var next = section.querySelector('.lawat__nav--next');
    var toggle = section.querySelector('.lawat__nav--toggle');
    if (slides.length < 2 || panels.length !== slides.length) return;

    var index = 0;
    var rotating = !reduced.matches;   // motion off: hold on slide one
    var onScreen = false;

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
        // A slide already shown this round keeps its bar filled, so the strip
        // reads as progress through the set rather than a lamp that lights
        // one bar at a time. The round clears on the wrap back to slide one.
        el.classList.toggle('is-done', i < index);
        if (on) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
      });
    }

    // Send the progress fill back to zero. The animation sits on the current
    // bar's ::after, so the class has to be dropped and re-added with a
    // reflow between for the browser to run it a second time.
    function restartFill() {
      section.classList.remove('is-rotating');
      if (!onScreen) return;
      void section.offsetWidth;
      // Sticky: the slow drift across each photograph is held back until
      // the section is first seen, so slide one still has its to spend.
      // Dropping the flag again on the way out would only pull the image
      // back to where it started while part of it is still showing.
      section.classList.add('is-live', 'is-rotating');
    }

    function go(to) {
      index = (to + slides.length) % slides.length;
      paint();
      restartFill();
    }

    // The fill IS the clock. A setTimeout started at the class flip runs
    // ahead of an animation that cannot begin until the next paint — a
    // couple of hundred milliseconds here, more while the slide images
    // decode — so the bar was always still short of full when the slide
    // changed under it. Advancing on the animation's own end keeps the two
    // exactly together, and leaves --slide-hold as the single place the
    // duration is written.
    section.addEventListener('animationend', function (event) {
      if (event.animationName !== 'bar-fill') return;
      if (!rotating || !onScreen) return;
      go(index + 1);
    });

    function setRotating(on) {
      rotating = on;
      if (toggle) {
        // pressed = the hold is engaged, matching the hero control.
        toggle.setAttribute('aria-pressed', String(!on));
        toggle.setAttribute('aria-label', on ? 'Jeda tayangan automatik' : 'Mula tayangan automatik');
      }
      // While it moves on its own, announcing each slide would talk over
      // the reader. Once stopped, the slide they chose is worth announcing.
      if (text) text.setAttribute('aria-live', on ? 'off' : 'polite');

      if (on) {
        // Coming off the hold, the fill carries on from where it froze
        // rather than starting the slide over. Only a first start — or a
        // start after the fill was dropped — lays a fresh one down.
        section.classList.remove('is-paused');
        if (!section.classList.contains('is-rotating')) restartFill();
      } else {
        // Held: the fill freezes where it stands, and with it the clock,
        // since they are now the same thing. is-rotating stays on, because
        // it is what puts the animation on the bar for animation-play-state
        // to freeze.
        section.classList.add('is-paused');
      }
    }

    // Taking a control moves the carousel and lays a fresh fill down, which
    // is the same thing as restarting the clock. It does not end the
    // rotation: the hold button is the way to stop it, and leaving it as
    // the only way means a click never strands the carousel.
    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });
    bars.forEach(function (bar, i) {
      bar.addEventListener('click', function () { go(i); });
    });
    if (toggle) toggle.addEventListener('click', function () { setRotating(!rotating); });

    // Nothing but the hold button stops the rotation. The pointer resting
    // over the section and a focused control used to freeze it, but the
    // frame gives no sign that hovering does anything, so a carousel that
    // stops under the cursor reads as one that has stalled. SC 2.2.2 is
    // met by the hold button on its own.

    // Off screen it does nothing at all — no clock, and no fill running
    // itself down where nobody can see it.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          onScreen = entry.isIntersecting;
          if (onScreen) restartFill();
          else section.classList.remove('is-rotating');
        });
      }, { threshold: 0.35 }).observe(section);
    } else {
      onScreen = true;
      restartFill();
    }

    var onChange = function (e) { if (e.matches) setRotating(false); };
    if (reduced.addEventListener) reduced.addEventListener('change', onChange);
    else if (reduced.addListener) reduced.addListener(onChange);

    paint();
    setRotating(rotating);
  })();


  /* ======================================================================
     4 · Back to top

     The link does the scrolling by itself — html carries
     scroll-behavior: smooth, and motion.css drops it to auto under
     reduced motion, so there is nothing here to honour a second time.

     All this does is keep it out of the way near the top of the page,
     where "back to top" means nothing and it would only crowd the
     chatbot. One viewport of scroll is the threshold: past the hero,
     the masthead is gone and there is something to go back to.
     ====================================================================== */
  (function toTop() {
    var link = document.querySelector('.to-top');
    if (!link) return;

    var ticking = false;

    // Hit-test the point the control actually covers, rather than compare
    // bounding boxes. A dark section’s box can run on behind whatever is
    // stacked over it, so box arithmetic lights the control up over pale
    // sections that merely overlap one. What is painted at the point is
    // the only thing that settles it.
    function overDark() {
      if (!document.elementsFromPoint) return false;
      var box = link.getBoundingClientRect();
      var stack = document.elementsFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2
      );
      for (var i = 0; i < stack.length; i++) {
        var el = stack[i];
        if (el === link || link.contains(el)) continue;
        if (el === document.body || el === document.documentElement) break;
        if (el.closest && el.closest('.on-dark, .lawat')) return true;
      }
      return false;
    }

    function sync() {
      ticking = false;
      link.classList.toggle('is-idle', window.pageYOffset < window.innerHeight);
      // A black disc on a dark breaker is a hole in the page. Read what is
      // actually behind the control rather than inferring it from how far
      // down the page we are — the sections move, the scroll number does
      // not tell you which one you are over.
      link.classList.toggle('is-over-dark', overDark());
    }

    // Scroll fires far faster than the page can paint; one read per frame
    // is enough and keeps the handler off the scrolling thread’s back.
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // Taking it should leave the keyboard at the top of the page too, not
    // stranded at the bottom with the view somewhere else. The zone takes
    // tabindex="-1" only at that moment, so it never becomes a tab stop of
    // its own, and preventScroll leaves the smooth scroll to the link.
    link.addEventListener('click', function () {
      var zone = document.getElementById('atas');
      if (!zone) return;
      zone.setAttribute('tabindex', '-1');
      zone.focus({ preventScroll: true });
    });

    sync();
  })();
})();
