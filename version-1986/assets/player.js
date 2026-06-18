var MoviePlayer = (function () {
  var booted = false;
  var hlsInstance = null;

  function init(config) {
    var video = document.getElementById(config.video);
    var layer = document.getElementById(config.layer);
    var streamUrl = config.source;

    if (!video || !layer || !streamUrl) {
      return;
    }

    function attachStream() {
      if (booted) {
        return;
      }

      booted = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      attachStream();
      video.controls = true;
      layer.classList.add('hidden');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    layer.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (!booted || video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      layer.classList.add('hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  return {
    init: init
  };
})();
