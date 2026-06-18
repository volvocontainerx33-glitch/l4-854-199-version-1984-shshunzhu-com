(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-main-nav]');
        if (menuButton && nav) {
            menuButton.addEventListener('click', function () {
                nav.classList.toggle('open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var index = 0;
            var timer = null;
            var show = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            };
            var start = function () {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                    start();
                });
            });
            if (slides.length > 1) {
                start();
            }
        }

        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
        forms.forEach(function (form) {
            var scope = form.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
            var queryInput = form.querySelector('[data-filter-query]');
            var regionSelect = form.querySelector('[data-filter-region]');
            var yearSelect = form.querySelector('[data-filter-year]');
            var empty = scope.querySelector('[data-empty-result]');
            var urlQuery = new URLSearchParams(window.location.search).get('q');
            if (urlQuery && queryInput) {
                queryInput.value = urlQuery;
            }
            var normalize = function (value) {
                return String(value || '').trim().toLowerCase();
            };
            var apply = function () {
                var query = normalize(queryInput && queryInput.value);
                var region = normalize(regionSelect && regionSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' '));
                    var matched = true;
                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (region && normalize(card.dataset.region).indexOf(region) === -1 && haystack.indexOf(region) === -1) {
                        matched = false;
                    }
                    if (year && normalize(card.dataset.year) !== year) {
                        matched = false;
                    }
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            };
            ['input', 'change'].forEach(function (type) {
                form.addEventListener(type, apply);
            });
            form.addEventListener('reset', function () {
                setTimeout(apply, 0);
            });
            apply();
        });
    });
})();
