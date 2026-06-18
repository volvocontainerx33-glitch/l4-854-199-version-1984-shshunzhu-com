(function () {
  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (!button || !mobile) {
      return;
    }
    button.addEventListener("click", function () {
      var open = mobile.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupSearch() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var activeFilter = "all";
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || "").toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var byQuery = !query || text.indexOf(query) !== -1;
          var byFilter = activeFilter === "all" || type === activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
          card.hidden = !(byQuery && byFilter);
        });
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter") || "all";
          buttons.forEach(function (other) {
            other.classList.toggle("active", other === button);
          });
          apply();
        });
      });
    });
  }

  function initPlayer(source) {
    var video = document.querySelector(".player-video");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !source) {
      return;
    }
    var hlsInstance = null;
    var ready = false;
    function begin() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      if (ready) {
        video.play().catch(function () {});
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = source;
      video.play().catch(function () {});
    }
    if (overlay) {
      overlay.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initPlayer = initPlayer;
  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
