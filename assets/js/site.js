(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(next);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  var filterChips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var emptyState = document.querySelector('[data-empty-state]');

  if (filterInput && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card, .ranking-row'));
    var activeFilter = '';
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';

    if (filterInput.hasAttribute('data-query-sync') && queryValue) {
      filterInput.value = queryValue;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(filterInput.value);
      var filter = normalize(activeFilter);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var genreText = normalize(card.getAttribute('data-genre'));
        var keywordMatched = !keyword || searchText.indexOf(keyword) !== -1;
        var filterMatched = !filter || searchText.indexOf(filter) !== -1 || genreText.indexOf(filter) !== -1;
        var matched = keywordMatched && filterMatched;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    filterInput.addEventListener('input', applyFilter);

    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter-value') || '';
        filterChips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  }
})();
