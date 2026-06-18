(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var button = document.querySelector('[data-player-button]');
        if (!video || !source) {
            return;
        }
        var attached = false;
        var begin = function () {
            if (!attached) {
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video.hlsInstance = hls;
                } else {
                    video.src = source;
                }
            }
            if (button) {
                button.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };
        if (button) {
            button.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    };
})();
