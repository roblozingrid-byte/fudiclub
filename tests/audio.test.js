import { describe, it, expect, beforeEach, vi } from 'vitest';
import posthog from 'posthog-js';
import { initRetroPlayer } from '../src/audio.js';

describe('src/audio.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = `
      <div id="retroPlayer">
        <button id="playerMinBtn">-</button>
        <button id="prevBtn"></button>
        <button id="playPauseBtn"></button>
        <button id="stopBtn"></button>
        <button id="nextBtn"></button>
        <input type="range" id="volSlider" value="0.7" />
        <audio id="bgMusic"></audio>
      </div>
    `;
  });

  it('initializes playlist, initial volume, and pulsing class on play button', () => {
    initRetroPlayer();

    const audio = document.getElementById('bgMusic');
    const playPauseBtn = document.getElementById('playPauseBtn');

    expect(audio.src).toContain('/music/Clip%201.mp3');
    expect(audio.volume).toBe(0.7);
    expect(playPauseBtn.classList.contains('pulsing-play')).toBe(true);
  });

  it('toggles playback and tracks PostHog events on play/pause click', () => {
    initRetroPlayer();

    const audio = document.getElementById('bgMusic');
    const playPauseBtn = document.getElementById('playPauseBtn');

    // First click: Play
    playPauseBtn.click();

    expect(playPauseBtn.classList.contains('pulsing-play')).toBe(false);
    expect(audio.play).toHaveBeenCalled();
    expect(playPauseBtn.innerHTML).toContain('fa-pause');
    expect(posthog.capture).toHaveBeenCalledWith('music_toggled', { state: 'playing' });

    // Second click: Pause
    playPauseBtn.click();

    expect(audio.pause).toHaveBeenCalled();
    expect(playPauseBtn.innerHTML).toContain('fa-play');
    expect(posthog.capture).toHaveBeenCalledWith('music_toggled', { state: 'paused' });
  });

  it('pauses and resets currentTime on stop button click', () => {
    initRetroPlayer();

    const audio = document.getElementById('bgMusic');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');

    playPauseBtn.click(); // Start playing
    audio.currentTime = 15;

    stopBtn.click();

    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
    expect(playPauseBtn.innerHTML).toContain('fa-play');
  });

  it('cycles through playlist with next and prev buttons', () => {
    initRetroPlayer();

    const audio = document.getElementById('bgMusic');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    // Next track (Clip 2)
    nextBtn.click();
    expect(audio.src).toContain('/music/Clip%202.mp3');
    expect(audio.load).toHaveBeenCalled();

    // Next track (Clip 3)
    nextBtn.click();
    expect(audio.src).toContain('/music/Clip%203.mp3');

    // Next track wrap-around (Clip 1)
    nextBtn.click();
    expect(audio.src).toContain('/music/Clip%201.mp3');

    // Prev track wrap-around backwards (Clip 3)
    prevBtn.click();
    expect(audio.src).toContain('/music/Clip%203.mp3');
  });

  it('advances track automatically when audio track ends', () => {
    initRetroPlayer();

    const audio = document.getElementById('bgMusic');
    audio.dispatchEvent(new Event('ended'));

    expect(audio.src).toContain('/music/Clip%202.mp3');
  });

  it('updates audio volume when slider changes', () => {
    initRetroPlayer();

    const audio = document.getElementById('bgMusic');
    const volSlider = document.getElementById('volSlider');

    volSlider.value = '0.35';
    volSlider.dispatchEvent(new Event('input', { bubbles: true }));

    expect(audio.volume).toBe(0.35);
  });

  it('toggles minimized class and button indicator on playerMinBtn click', () => {
    initRetroPlayer();

    const player = document.getElementById('retroPlayer');
    const minBtn = document.getElementById('playerMinBtn');

    minBtn.click();
    expect(player.classList.contains('minimized')).toBe(true);
    expect(minBtn.innerText).toBe('+');

    minBtn.click();
    expect(player.classList.contains('minimized')).toBe(false);
    expect(minBtn.innerText).toBe('-');
  });
});
