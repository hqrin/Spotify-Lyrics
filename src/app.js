const { getCurrentPlayingTrack } = require('./services/spotify');
const { getLyrics, parseLyrics } = require('./services/lyrics');
const { updateDiscordStatus } = require('./services/discord');
const { translateText } = require('./services/translator');
const { drawUI, drawLargeLyrics } = require('./ui/render');
const { askMode, askFont, askColor, askSettings } = require('./ui/menu');
const { MIN_UPDATE_INTERVAL, JITTER_MAX } = require('./config');

let currentLyrics = [];
let translationCache = {};
let lastTrackId = null;
let lastSentText = '';
let lastUpdateTime = 0;
let selectedMode = '1';
let selectedColor = '1';
let selectedFont = 'Standard';
let settings = {
  translationEnabled: false,
  targetLanguage: 'es',
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor(ms / (1000 * 60));
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function computeTargetLine(progress) {
  if (!currentLyrics.length) return '';

  let targetLine = '';
  let currentIndex = 0;

  for (let i = 0; i < currentLyrics.length; i += 1) {
    if (progress >= currentLyrics[i].time) currentIndex = i;
    else break;
  }

  const nextLine = currentLyrics[currentIndex + 1];
  const duration = nextLine
    ? nextLine.time - currentLyrics[currentIndex].time
    : 5000;
  const offset = Math.max(1200, Math.min(2500, duration * 0.5));

  for (const line of currentLyrics) {
    if (progress + offset >= line.time) targetLine = line.text;
    else break;
  }

  return targetLine;
}

async function getDisplayedLine(line) {
  if (!line || !settings.translationEnabled) return line;

  const key = `${line}::${settings.targetLanguage}`;
  if (translationCache[key]) return translationCache[key];

  const translated = await translateText(line, settings.targetLanguage);
  translationCache[key] = translated;
  return translated;
}

async function refreshTrackLyrics(track) {
  const rawLyrics = await getLyrics(track.name, track.artists[0].name);
  currentLyrics = parseLyrics(rawLyrics);
  lastTrackId = track.id;
  lastSentText = '';
  if (!rawLyrics && selectedMode === '1') {
    await updateDiscordStatus(`Listening to ${track.name}`);
  }
}

async function updateStatusIfNeeded(line) {
  if (selectedMode !== '1') return;

  const now = Date.now();
  if (now - lastUpdateTime < MIN_UPDATE_INTERVAL) return;

  await delay(Math.random() * JITTER_MAX);
  if (line && line !== lastSentText) {
    const success = await updateDiscordStatus(line);
    if (success) {
      lastSentText = line;
      lastUpdateTime = Date.now();
    }
  }
}

async function renderTrack(track, progress, line, originalLine) {
  const uiData = {
    song: track.name,
    author: track.artists[0].name,
    progress: formatTime(progress),
    lyrics: line,
    translatedLyrics: settings.translationEnabled ? line : null,
    originalLyrics: settings.translationEnabled ? originalLine : null,
    translationEnabled: settings.translationEnabled,
    targetLanguage: settings.targetLanguage,
  };

  if (selectedMode === '1') drawUI(uiData);
  else drawLargeLyrics(uiData, selectedColor, selectedFont);
}

async function mainLoop() {
  try {
    const response = await getCurrentPlayingTrack();
    const body = response.body;

    if (body && body.is_playing && body.item) {
      const track = body.item;
      const progress = body.progress_ms;

      if (track.id !== lastTrackId) {
        await refreshTrackLyrics(track);
        translationCache = {};
      }

      const currentLine = computeTargetLine(progress);
      const displayedLine = await getDisplayedLine(currentLine);
      await updateStatusIfNeeded(displayedLine);
      await renderTrack(track, progress, displayedLine, currentLine);
    } else {
      if (lastSentText && selectedMode === '1') {
        await updateDiscordStatus('');
        lastSentText = '';
        lastTrackId = null;
      }

      if (selectedMode === '1') {
        drawUI({ lyrics: 'Paused' });
      } else {
        drawLargeLyrics({ song: 'Paused', author: '---', progress: '0:00', lyrics: '' }, selectedColor, selectedFont);
      }
    }
  } catch (error) {
    // Silence errors to keep the loop alive.
  }

  setTimeout(mainLoop, 500);
}

async function start() {
  while (true) {
    const option = await askMode(settings);
    if (option === '3') {
      settings = await askSettings(settings);
      continue;
    }
    selectedMode = option;
    break;
  }

  if (selectedMode === '1') {
    await require('./services/spotify').authorizeSpotify();
  } else {
    selectedFont = await askFont();
    selectedColor = await askColor();
  }

  mainLoop();
}

module.exports = {
  start,
};
