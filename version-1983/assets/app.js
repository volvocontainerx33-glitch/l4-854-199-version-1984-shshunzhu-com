(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) return;
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) return;
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });
    hero.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-search]', scope);
      var year = qs('[data-filter-year]', scope);
      var region = qs('[data-filter-region]', scope);
      var cards = qsa('.js-card', scope);
      var empty = qs('[data-empty]', scope);
      function value(el) {
        return el ? el.value.trim().toLowerCase() : '';
      }
      function apply() {
        var term = value(input);
        var y = value(year);
        var r = value(region);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var ok = (!term || haystack.indexOf(term) !== -1) &&
            (!y || (card.getAttribute('data-year') || '').toLowerCase() === y) &&
            (!r || (card.getAttribute('data-region') || '').toLowerCase() === r);
          card.classList.toggle('hidden-card', !ok);
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle('is-visible', visible === 0);
      }
      [input, year, region].forEach(function (el) {
        if (!el) return;
        el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
      });
      apply();
    });
  }

  function mountPlayer(url) {
    var shell = qs('[data-player]');
    var video = qs('[data-video]');
    var cover = qs('[data-player-cover]');
    if (!shell || !video || !url) return;
    var ready = false;
    function load() {
      shell.classList.add('is-playing');
      if (cover) cover.setAttribute('aria-hidden', 'true');
      if (ready) {
        video.play().catch(function () {});
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = url;
      video.play().catch(function () {});
    }
    if (cover) cover.addEventListener('click', load);
    video.addEventListener('click', function () {
      if (!ready || video.paused) load();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });

  window.MovieUI = {
    mountPlayer: mountPlayer
  };
})();
