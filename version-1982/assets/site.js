(function () {
  const MovieSite = {};

  function getAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const mobile = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("is-open");
    });
  }

  function setupHero() {
    const root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    const slides = getAll("[data-hero-slide]", root);
    const dots = getAll("[data-hero-dot]", root);
    if (slides.length === 0) {
      return;
    }
    let current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFilters() {
    getAll("[data-filter-root]").forEach(function (root) {
      const input = root.querySelector("[data-site-search]");
      const items = getAll("[data-filter-item]", root);
      const empty = root.querySelector("[data-empty-state]");
      const chips = getAll("[data-filter-tag]", root);
      let activeTag = "all";
      if (input) {
        const query = new URLSearchParams(window.location.search).get("q");
        if (query && !input.value) {
          input.value = query;
        }
      }
      function apply() {
        const keyword = input ? input.value.trim().toLowerCase() : "";
        let visible = 0;
        items.forEach(function (item) {
          const text = (item.getAttribute("data-text") || "").toLowerCase();
          const tags = (item.getAttribute("data-tags") || "").toLowerCase();
          const keywordMatch = !keyword || text.indexOf(keyword) !== -1 || tags.indexOf(keyword) !== -1;
          const tagMatch = activeTag === "all" || tags.indexOf(activeTag.toLowerCase()) !== -1;
          const matched = keywordMatch && tagMatch;
          item.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeTag = chip.getAttribute("data-filter-tag") || "all";
          chips.forEach(function (other) {
            other.classList.toggle("is-active", other === chip);
          });
          apply();
        });
      });
      apply();
    });
  }

  function setupBackTop() {
    getAll("[data-back-top]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  MovieSite.setupPlayer = function (src) {
    const video = document.querySelector("[data-player-video]");
    const layer = document.querySelector("[data-player-layer]");
    if (!video || !src) {
      return;
    }
    let started = false;
    let attached = false;
    function requestPlay() {
      const action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        if (started) {
          requestPlay();
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (started) {
            requestPlay();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else {
        video.src = src;
      }
    }
    function start() {
      started = true;
      attach();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      requestPlay();
    }
    if (layer) {
      layer.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });
  };

  MovieSite.init = function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupBackTop();
  };

  document.addEventListener("DOMContentLoaded", MovieSite.init);
  window.MovieSite = MovieSite;
})();
