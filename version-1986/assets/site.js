(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
    var current = 0;
    var timer = null;

    var showSlide = function (next) {
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    };

    var start = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-dot')) || 0);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeYear = 'all';
  var activeCategory = 'all';

  var normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };

  var applyFilters = function () {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var year = card.getAttribute('data-year') || '';
      var category = card.getAttribute('data-category') || '';
      var matchText = keyword === '' || haystack.indexOf(keyword) !== -1;
      var matchYear = activeYear === 'all' || year === activeYear;
      var matchCategory = activeCategory === 'all' || category === activeCategory;
      var match = matchText && matchYear && matchCategory;

      card.style.display = match ? '' : 'none';

      if (match) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');

    if (preset) {
      searchInput.value = preset;
    }

    searchInput.addEventListener('input', applyFilters);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]')).forEach(function (button) {
    button.addEventListener('click', function () {
      activeYear = button.getAttribute('data-filter-year') || 'all';
      Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]')).forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]')).forEach(function (button) {
    button.addEventListener('click', function () {
      activeCategory = button.getAttribute('data-filter-category') || 'all';
      Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]')).forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  if (cards.length) {
    applyFilters();
  }
})();
