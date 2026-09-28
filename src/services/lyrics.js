const axios = require('axios');

async function getLyrics(track, artist) {
  try {
    const cleanTrack = track.replace(/\(.*?\)/g, '').trim();
    const response = await axios.get('https://lrclib.net/api/get', {
      params: {
        artist_name: artist,
        track_name: cleanTrack,
      },
    });
    // Prefer synced (LRC) lyrics when available
    if (response.data) {
      if (response.data.syncedLyrics) return response.data.syncedLyrics;
      if (response.data.lrc) return response.data.lrc;
      if (response.data.lyrics) return response.data.lyrics;
    }

    // Fallback: try a simple lyrics API (plain lyrics, no timestamps)
    try {
      const fallback = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(cleanTrack)}`);
      if (fallback && fallback.data && fallback.data.lyrics) return fallback.data.lyrics;
    } catch (e) {
      // ignore fallback errors
    }

    return null;
  } catch (error) {
    return null;
  }
}

function parseLyrics(lrc) {
  const lyrics = [];
  if (!lrc) return lyrics;

  const lines = lrc.split('\n').map((l) => l.trim()).filter(Boolean);
  const lrcReg = /\[(\d+):(\d+\.\d+)\](.*)/;

  // If we detect at least one timestamped line, parse as LRC
  const hasTimestamps = lines.some((line) => lrcReg.test(line));

  if (hasTimestamps) {
    for (const line of lines) {
      const match = lrcReg.exec(line);
      if (match) {
        const time = (parseInt(match[1], 10) * 60 + parseFloat(match[2])) * 1000;
        lyrics.push({ time, text: match[3].trim() });
      }
    }
    return lyrics;
  }

  // Fallback: plain lyrics without timestamps -> assign progressive timestamps
  const step = 3000; // 3s per line as approximation
  for (let i = 0; i < lines.length; i += 1) {
    lyrics.push({ time: i * step, text: lines[i] });
  }

  return lyrics;
}

module.exports = {
  getLyrics,
  parseLyrics,
};
