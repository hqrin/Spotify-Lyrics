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
    return response.data.syncedLyrics || null;
  } catch (error) {
    return null;
  }
}

function parseLyrics(lrc) {
  const lyrics = [];
  if (!lrc) return lyrics;

  const lines = lrc.split('\n');
  const lrcReg = /\[(\d+):(\d+\.\d+)\](.*)/;

  for (const line of lines) {
    const match = lrcReg.exec(line);
    if (match) {
      const time = (parseInt(match[1], 10) * 60 + parseFloat(match[2])) * 1000;
      lyrics.push({ time, text: match[3].trim() });
    }
  }

  return lyrics;
}

module.exports = {
  getLyrics,
  parseLyrics,
};
