(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play]');
    var source = video ? video.getAttribute('data-source') : '';
    var started = false;
    var hls = null;

    function safePlay() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function attachSource() {
      if (!video || !source || started) {
        return;
      }

      started = true;
      shell.classList.add('is-playing');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          safePlay();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            video.src = source;
            safePlay();
          }
        });
        return;
      }

      video.src = source;
      safePlay();
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        attachSource();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video && started) {
        return;
      }
      attachSource();
    });
  });
})();
