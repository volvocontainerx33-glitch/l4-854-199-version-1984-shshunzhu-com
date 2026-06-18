(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      button.setAttribute('aria-expanded', String(open));
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    var carousel = document.querySelector('.hero-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function setupFilters() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-pill'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));
    if (!buttons.length || !cards.length) {
      return;
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' ');
          var matched = filter === 'all' || haystack.indexOf(filter) !== -1;
          card.hidden = !matched;
        });
      });
    });
  }

  function setupSearchPage() {
    var input = document.getElementById('search-page-input');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.search-grid .movie-card'));
    var empty = document.querySelector('.empty-state');
    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function filter() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase() + ' ' + [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener('input', filter);
    filter();
  }

  window.setupMoviePlayer = function (videoId, layerId, buttonId, source) {
    ready(function () {
      var video = document.getElementById(videoId);
      var layer = document.getElementById(layerId);
      var button = document.getElementById(buttonId);
      if (!video || !layer || !source) {
        return;
      }

      function hideLayer() {
        layer.classList.add('hidden');
      }

      function startPlayback() {
        hideLayer();
        if (video.dataset.ready !== 'true') {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = 'true';
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.dataset.ready = 'true';
              video.play().catch(function () {});
            });
          } else {
            video.src = source;
            video.dataset.ready = 'true';
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      layer.addEventListener('click', startPlayback);
      if (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          startPlayback();
        });
      }
      video.addEventListener('play', hideLayer);
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
