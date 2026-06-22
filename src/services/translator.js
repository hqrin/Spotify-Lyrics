const axios = require('axios');

const TRANSLATOR_API_URL = 'https://api.mymemory.translated.net/get';

async function translateText(text, targetLang) {
  if (!text || !targetLang || targetLang === 'en') return text;

  try {
    const response = await axios.get(TRANSLATOR_API_URL, {
      params: {
        q: text,
        langpair: `auto|${targetLang}`,
      },
    });

    const translated = response.data.responseData.translatedText;
    return translated || text;
  } catch (error) {
    return text;
  }
}

module.exports = {
  translateText,
};
