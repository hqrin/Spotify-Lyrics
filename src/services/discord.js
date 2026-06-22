const axios = require('axios');
const config = require('../config');

async function updateDiscordStatus(text) {
  const payload = {
    custom_status: {
      text: text || null,
      emoji_name: '🎵',
    },
  };

  try {
    await axios.patch(
      'https://discord.com/api/v9/users/@me/settings',
      payload,
      {
        headers: {
          Authorization: config.DISCORD_TOKEN,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      }
    );
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  updateDiscordStatus,
};
