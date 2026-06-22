const http = require('http');
const url = require('url');
const open = require('open');
const SpotifyWebApi = require('spotify-web-api-node');
const config = require('../config');

const spotifyApi = new SpotifyWebApi({
  clientId: config.SPOTIFY_CLIENT_ID,
  clientSecret: config.SPOTIFY_CLIENT_SECRET,
  redirectUri: config.SPOTIFY_REDIRECT_URI,
});

const SCOPES = ['user-read-currently-playing'];
const SERVER_PORT = 8888;

function createAuthorizeURL() {
  return spotifyApi.createAuthorizeURL(SCOPES);
}

function setSpotifyTokens(body) {
  spotifyApi.setAccessToken(body['access_token']);
  spotifyApi.setRefreshToken(body['refresh_token']);
}

async function authorizeSpotify() {
  return new Promise((resolve, reject) => {
    const authorizeURL = createAuthorizeURL();
    const server = http.createServer(async (req, res) => {
      const query = url.parse(req.url, true).query;
      if (query.code) {
        try {
          const data = await spotifyApi.authorizationCodeGrant(query.code);
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

    server.listen(SERVER_PORT, () => {
      open(authorizeURL).catch(reject);
    });

    server.on('error', reject);
  });
}

function getCurrentPlayingTrack() {
  return spotifyApi.getMyCurrentPlayingTrack();
}

module.exports = {
  authorizeSpotify,
  getCurrentPlayingTrack,
};
