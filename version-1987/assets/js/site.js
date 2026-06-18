(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            const open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('.hero-dots button'));
        let current = 0;

        function show(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show((current + 1) % slides.length);
            }, 5200);
        }
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function readQuery() {
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    document.querySelectorAll('[data-query-input]').forEach(function (input) {
        const q = readQuery();
        if (q) {
            input.value = q;
        }
    });

    document.querySelectorAll('[data-filter-list]').forEach(function (list) {
        const scope = list.closest('main') || document;
        const input = scope.querySelector('[data-filter-input]');
        const select = scope.querySelector('[data-filter-select]');
        const items = Array.from(list.children);

        function applyFilter() {
            const keyword = normalize(input ? input.value : '');
            const year = normalize(select ? select.value : '');

            items.forEach(function (item) {
                const text = normalize([
                    item.dataset.title,
                    item.dataset.year,
                    item.dataset.genre,
                    item.dataset.region,
                    item.dataset.tags,
                    item.textContent
                ].join(' '));
                const yearText = normalize(item.dataset.year);
                const matchKeyword = !keyword || text.includes(keyword);
                const matchYear = !year || yearText === year;
                item.classList.toggle('is-hidden-by-filter', !(matchKeyword && matchYear));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (select) {
            select.addEventListener('change', applyFilter);
        }
        applyFilter();
    });
})();
