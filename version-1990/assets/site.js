(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = $('.menu-toggle');
    var panel = $('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
      });
    }

    var slides = $all('.hero-slide');
    var dots = $all('.hero-dot');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        if (timer) {
          window.clearInterval(timer);
          startHero();
        }
      });
    });

    showSlide(0);
    startHero();

    $all('.filter-input').forEach(function (input) {
      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        var cards = $all('.movie-card[data-search]');
        var visible = 0;
        cards.forEach(function (card) {
          var hit = !q || card.getAttribute('data-search').toLowerCase().indexOf(q) !== -1;
          card.style.display = hit ? '' : 'none';
          if (hit) {
            visible += 1;
          }
        });
        var empty = $('.empty-state');
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      });
    });

    var searchResults = $('#searchResults');
    if (searchResults && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var q = (params.get('q') || '').trim();
      var input = $('#searchPageInput');
      if (input) {
        input.value = q;
      }
      renderSearch(q);
      var form = $('#searchPageForm');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          var next = input ? input.value.trim() : '';
          var url = next ? 'search.html?q=' + encodeURIComponent(next) : 'search.html';
          window.history.replaceState(null, '', url);
          renderSearch(next);
        });
      }
    }
  });

  function renderSearch(query) {
    var target = document.querySelector('#searchResults');
    if (!target) {
      return;
    }
    var q = (query || '').toLowerCase();
    var data = (window.SEARCH_INDEX || []).filter(function (item) {
      if (!q) {
        return true;
      }
      return item.search.indexOf(q) !== -1;
    });

    target.innerHTML = data.map(function (item) {
      return [
        '<article class="card movie-card" data-search="' + escapeHtml(item.search) + '">',
        '  <a href="' + escapeHtml(item.url) + '">',
        '    <div class="poster">',
        '      <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '      <div class="badge-row">',
        '        <span class="badge">' + escapeHtml(item.category) + '</span>',
        '        <span class="badge">' + escapeHtml(item.year) + '</span>',
        '      </div>',
        '    </div>',
        '    <div class="card-body">',
        '      <h3 class="card-title">' + escapeHtml(item.title) + '</h3>',
        '      <p class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>',
        '      <p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('\n');
    }).join('\n');

    var empty = document.querySelector('.empty-state');
    if (empty) {
      empty.classList.toggle('show', data.length === 0);
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
