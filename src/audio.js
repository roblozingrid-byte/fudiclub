import posthog from 'posthog-js';

export function initRetroPlayer() {
  const audio = document.getElementById('bgMusic');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const volSlider = document.getElementById('volSlider');
  const minBtn = document.getElementById('playerMinBtn');
  const player = document.getElementById('retroPlayer');

  if (!audio || !playPauseBtn) return;

  const playlist = [
    "/music/Clip%201.mp3",
    "/music/Clip%202.mp3",
    "/music/Clip%203.mp3"
  ];
  let currentTrack = 0;

  audio.src = playlist[currentTrack];
  audio.volume = volSlider.value;
  let isPlaying = false;

  playPauseBtn.classList.add('pulsing-play');

  const playSong = () => {
    playPauseBtn.classList.remove('pulsing-play');
    audio.play().catch(e => console.log('Autoplay blocked:', e));
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    isPlaying = true;
  };

  const pauseSong = () => {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    isPlaying = false;
  };

  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      pauseSong();
      posthog.capture('music_toggled', { state: 'paused' });
    } else {
      playSong();
      posthog.capture('music_toggled', { state: 'playing' });
    }
  });

  stopBtn.addEventListener('click', () => {
    pauseSong();
    audio.currentTime = 0;
  });

  const nextSong = () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    audio.src = playlist[currentTrack];
    audio.load();
    if (isPlaying) playSong();
  };

  const prevSong = () => {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    audio.src = playlist[currentTrack];
    audio.load();
    if (isPlaying) playSong();
  };

  if (nextBtn) nextBtn.addEventListener('click', nextSong);
  if (prevBtn) prevBtn.addEventListener('click', prevSong);

  audio.addEventListener('ended', nextSong);

  volSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });

  if (minBtn) {
    minBtn.addEventListener('click', () => {
      player.classList.toggle('minimized');
      minBtn.innerText = player.classList.contains('minimized') ? '+' : '-';
    });
  }
}
