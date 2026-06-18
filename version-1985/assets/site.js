(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      button.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilterPanels() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var section = panel.closest('section') || document;
      var list = section.querySelector('[data-card-list]') || document.querySelector('[data-card-list]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.children);
      var keywordInput = panel.querySelector('[data-filter-keyword]');
      var categorySelect = panel.querySelector('[data-filter-category]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var resetButton = panel.querySelector('[data-filter-reset]');
      var count = panel.querySelector('[data-visible-count]');

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var category = normalize(categorySelect && categorySelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.category
          ].join(' '));
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesCategory = !category || normalize(card.dataset.category) === category;
          var matchesRegion = !region || normalize(card.dataset.region) === region;
          var matchesYear = !year || normalize(card.dataset.year) === year;
          var shouldShow = matchesKeyword && matchesCategory && matchesRegion && matchesYear;
          card.classList.toggle('is-filter-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [keywordInput, categorySelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (keywordInput) keywordInput.value = '';
          if (categorySelect) categorySelect.value = '';
          if (regionSelect) regionSelect.value = '';
          if (yearSelect) yearSelect.value = '';
          apply();
        });
      }

      apply();
    });
  }

  function movieCardTemplate(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.join(' ') : '';
    return [
      '<article class="movie-card" data-title="', escapeHtml(movie.title), '" data-region="', escapeHtml(movie.region), '" data-year="', escapeHtml(movie.year), '" data-genre="', escapeHtml(movie.genre), '" data-tags="', escapeHtml(tags), '" data-category="', escapeHtml(movie.category), '">',
      '<a class="movie-card-link" href="./', encodeURI(movie.url), '" aria-label="观看 ', escapeHtml(movie.title), '">',
      '<div class="poster-frame">',
      '<img src="./', encodeURI(movie.cover), '" alt="', escapeHtml(movie.title), ' 海报" loading="lazy">',
      '<span class="poster-badge">', escapeHtml(movie.year), '</span>',
      '<span class="poster-play">▶</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<div class="movie-card-meta"><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.type), '</span></div>',
      '<h3>', escapeHtml(movie.title), '</h3>',
      '<p>', escapeHtml(movie.oneLine), '</p>',
      '<div class="movie-card-foot"><span>', escapeHtml(movie.genre), '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page || !window.MOVIE_INDEX) {
      return;
    }
    var input = page.querySelector('[data-search-input]');
    var button = page.querySelector('[data-search-button]');
    var results = page.querySelector('[data-search-results]');
    var count = page.querySelector('[data-search-count]');
    var initialQuery = getQueryParam('q');

    function render() {
      var query = normalize(input && input.value);
      var movies = window.MOVIE_INDEX.filter(function (movie) {
        if (!query) {
          return true;
        }
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          Array.isArray(movie.tags) ? movie.tags.join(' ') : '',
          movie.oneLine
        ].join(' '));
        return haystack.indexOf(query) !== -1;
      });
      if (count) {
        count.textContent = String(movies.length);
      }
      results.innerHTML = movies.slice(0, 240).map(movieCardTemplate).join('');
    }

    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', render);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          render();
        }
      });
    }
    if (button) {
      button.addEventListener('click', render);
    }
    render();
  }

  function initPlayer() {
    var video = document.querySelector('[data-player-src]');
    if (!video) {
      return;
    }
    var button = document.querySelector('[data-player-button]');
    var source = video.getAttribute('data-player-src');
    var hlsInstance = null;
    var isAttached = false;

    function attachSource() {
      if (isAttached || !source) {
        return;
      }
      isAttached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            try {
              hlsInstance.destroy();
            } catch (error) {
              console.warn('HLS destroy failed', error);
            }
            video.src = source;
          }
        });
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();
      if (button) {
        button.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (!isAttached) {
        attachSource();
      }
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }

  function initPlayerScroll() {
    var link = document.querySelector('[data-player-scroll]');
    var player = document.querySelector('.player-card');
    if (!link || !player) {
      return;
    }
    link.addEventListener('click', function (event) {
      event.preventDefault();
      player.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilterPanels();
    initSearchPage();
    initPlayer();
    initPlayerScroll();
  });
}());
