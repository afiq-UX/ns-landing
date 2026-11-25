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

    // Hold playback inside data-loop-start..data-loop-end when the markup
    // asks for it, so a clip with burned-in captions outside that window
    // never shows them. With no attributes this does nothing at all.
    var from = parseFloat(video.getAttribute('data-loop-start'));
    var to = parseFloat(video.getAttribute('data-loop-end'));
    if (!isNaN(from) && !isNaN(to) && to > from) {
      var rewind = function () {
        // Seeking while a seek is pending throws the element into a loop of
        // its own, so wait for the current one to land.
        if (video.seeking) return;
        if (video.currentTime < from - 0.25 || video.currentTime >= to) {
          video.currentTime = from;
        }
      };
      video.addEventListener('timeupdate', rewind);
      video.addEventListener('loadedmetadata', rewind);
      if (video.readyState >= 1) rewind();
    }

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
     keeps doing so after a click — a carousel that quietly gives up the
     moment you touch it is the more annoying failure. Taking a control
     moves it and restarts the clock; the hold button is the one thing
     that stops it.

     Around that: it never runs off screen, it freezes under the pointer or
     a focused control and resumes from where it froze rather than starting
     the slide over, and it does not start at all when motion is off. The
     hold button is also what SC 2.2.2 requires of anything that moves on
     its own for more than five seconds.
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
    var timer = null;
    var startedAt = 0;
    var remaining = 0;
    var rotating = !reduced.matches;   // motion off: hold on slide one
    var onScreen = false;

    // Read from the token rather than duplicated here, so the bar's fill and
    // the clock driving it can never disagree.
    function hold() {
      var ms = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--slide-hold')
      );
      return isNaN(ms) ? 6400 : ms;
    }

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

    // Send the progress fill back to zero. The animation sits on the current
    // bar's ::after, so the class has to be dropped and re-added with a
    // reflow between for the browser to run it a second time.
    function restartFill() {
      section.classList.remove('is-rotating');
      if (!rotating || !onScreen) return;
      void section.offsetWidth;
      section.classList.add('is-rotating');
    }

    function disarm() {
      if (timer) { clearTimeout(timer); timer = null; }
    }

    function arm(ms) {
      disarm();
      if (!rotating || !onScreen) return;
      remaining = ms;
      startedAt = Date.now();
      timer = setTimeout(function () { go(index + 1); }, ms);
    }

    function go(to) {
      index = (to + slides.length) % slides.length;
      paint();
      restartFill();
      arm(hold());
    }

    // Held: the fill freezes where it stands and the clock keeps its
    // remainder, so letting go carries on instead of starting over.
    function holdOn() {
      if (timer) remaining -= Date.now() - startedAt;
      disarm();
      section.classList.add('is-paused');
    }

    function holdOff() {
      section.classList.remove('is-paused');
      if (!rotating || !onScreen) return;
      arm(remaining > 0 ? remaining : hold());
    }

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
        restartFill();
        arm(hold());
      } else {
        disarm();
        section.classList.remove('is-rotating', 'is-paused');
      }
    }

    // Taking a control moves the carousel and restarts the clock. It does
    // not end the rotation: the hold button is the way to stop it, and
    // leaving it as the only way means a click never strands the carousel.
    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });
    bars.forEach(function (bar, i) {
      bar.addEventListener('click', function () { go(i); });
    });
    if (toggle) toggle.addEventListener('click', function () { setRotating(!rotating); });

    section.addEventListener('pointerenter', holdOn);
    section.addEventListener('pointerleave', holdOff);
    section.addEventListener('focusin', holdOn);
    section.addEventListener('focusout', function (event) {
      if (!section.contains(event.relatedTarget)) holdOff();
    });

    // Off screen it does nothing at all — no clock, and no fill running
    // itself down where nobody can see it.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          onScreen = entry.isIntersecting;
          if (onScreen) {
            restartFill();
            arm(hold());
          } else {
            disarm();
            section.classList.remove('is-rotating', 'is-paused');
          }
        });
      }, { threshold: 0.35 }).observe(section);
    } else {
      onScreen = true;
      restartFill();
      arm(hold());
    }

    var onChange = function (e) { if (e.matches) setRotating(false); };
    if (reduced.addEventListener) reduced.addEventListener('change', onChange);
    else if (reduced.addListener) reduced.addListener(onChange);

    paint();
    setRotating(rotating);
  })();
})();
