// AURA Smart Ring — page interactions.

(function () {
  'use strict';

  // Nav active state
  var navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.forEach(function (other) {
        other.classList.toggle('is-active', other === link);
      });
    });
  });

  // Entrance reveal
  var revealTargets = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Subtle parallax on the ring image
  var ring = document.querySelector('.ring-img');
  var hero = document.querySelector('.hero');

  if (ring && hero && !reduceMotion) {
    var raf = null;

    hero.addEventListener('mousemove', function (event) {
      if (window.innerWidth <= 1024) return;

      var bounds = hero.getBoundingClientRect();
      var dx = (event.clientX - bounds.left) / bounds.width - 0.5;
      var dy = (event.clientY - bounds.top) / bounds.height - 0.5;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        ring.style.transform = 'translate3d(' + dx * 10 + 'px, ' + dy * 10 + 'px, 0)';
      });
    });

    hero.addEventListener('mouseleave', function () {
      if (raf) cancelAnimationFrame(raf);
      ring.style.transform = 'translate3d(0, 0, 0)';
    });
  }
})();
