const http = require('http');
const open = require('open');
const SpotifyWebApi = require('spotify-web-api-node');
const config = require('../config');

const spotifyApi = new SpotifyWebApi({
  clientId: config.SPOTIFY_CLIENT_ID,
  clientSecret: config.SPOTIFY_CLIENT_SECRET,
  redirectUri: config.SPOTIFY_REDIRECT_URI,
});

const SCOPES = ['user-read-currently-playing'];

function createAuthorizeURL() {
  return spotifyApi.createAuthorizeURL(SCOPES);
}

function setSpotifyTokens(body) {
  spotifyApi.setAccessToken(body['access_token']);
  spotifyApi.setRefreshToken(body['refresh_token']);
}

async function authorizeSpotify() {
  return new Promise((resolve, reject) => {
    if (!config.SPOTIFY_CLIENT_ID || !config.SPOTIFY_CLIENT_SECRET) {
      reject(new Error('Configura SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET en .env.'));
      return;
    }

    const redirectURL = new URL(config.SPOTIFY_REDIRECT_URI);
    const serverPort = Number(redirectURL.port) || 80;
    const authorizeURL = createAuthorizeURL();
    const server = http.createServer(async (req, res) => {
      const callbackURL = new URL(req.url, config.SPOTIFY_REDIRECT_URI);
      if (callbackURL.pathname !== redirectURL.pathname) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }

      const authorizationError = callbackURL.searchParams.get('error');
      const code = callbackURL.searchParams.get('code');
      if (authorizationError) {
        res.statusCode = 400;
        res.end('Spotify authorization was declined. You can close this window.');
        server.close();
        reject(new Error(`Spotify authorization failed: ${authorizationError}`));
      } else if (code) {
        try {
          const data = await spotifyApi.authorizationCodeGrant(code);
          setSpotifyTokens(data.body);
          res.end('Authorized. You can close this window.');
          server.close();
          resolve();
        } catch (error) {
          res.statusCode = 500;
          res.end('Authorization failed.');
          server.close();
          reject(error);
        }
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });

    server.listen(serverPort, redirectURL.hostname, () => {
      open(authorizeURL).catch((error) => {
        server.close();
        reject(error);
      });
    });

    server.on('error', reject);
  });
}

async function getCurrentPlayingTrack() {
  try {
    return await spotifyApi.getMyCurrentPlayingTrack();
  } catch (error) {
    if (error.statusCode !== 401) throw error;

    const refreshed = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(refreshed.body.access_token);
    return spotifyApi.getMyCurrentPlayingTrack();
  }
}

module.exports = {
  authorizeSpotify,
  getCurrentPlayingTrack,
};
