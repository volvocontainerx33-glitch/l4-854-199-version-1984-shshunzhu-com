(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        if (window.Hls) {
          resolve();
        }
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var frame = document.querySelector('.video-frame[data-video-url]');
    var video = frame ? frame.querySelector('video') : null;
    var cover = frame ? frame.querySelector('.video-cover') : null;
    if (!frame || !video) {
      return;
    }

    var source = frame.getAttribute('data-video-url');
    var initialized = false;

    function attachSource() {
      if (initialized || !source) {
        return Promise.resolve();
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        frame.classList.add('is-ready');
        return Promise.resolve();
      }

      function useHls() {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          frame.classList.add('is-ready');
          return Promise.resolve();
        }
        video.src = source;
        frame.classList.add('is-ready');
        return Promise.resolve();
      }

      if (window.Hls) {
        return useHls();
      }

      return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js').then(useHls).catch(function () {
        video.src = source;
        frame.classList.add('is-ready');
      });
    }

    function playVideo() {
      attachSource().then(function () {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
      cover.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          playVideo();
        }
      });
    }

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      frame.classList.remove('is-playing');
    });
  });
})();
