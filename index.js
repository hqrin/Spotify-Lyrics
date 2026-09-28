require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');
const http = require('http');
const open = require('open');
const url = require('url');
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');

// --- CONFIGURACIÓN ---
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8888/callback';

const MIN_UPDATE_INTERVAL = 2500; // Aumentado ligeramente para mayor seguridad
const JITTER_MAX = 1200; // Aumentado para que el ritmo de actualización sea más humano
const FAST_MUSIC_THRESHOLD = 3000; // ms entre versos para considerar música "rápida"
// ---------------------

const spotifyApi = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    redirectUri: SPOTIFY_REDIRECT_URI
});

let currentLyrics = [];
let lastTrackId = null;
let lastSentText = "";
let lastUpdateTime = 0;
let selectedMode = null;
let selectedColor = '1';
let selectedFont = 'Standard';

const colors = {
    '1': { name: 'Arcoíris', func: (t) => getRainbowText(t) },
    '2': { name: 'Cian Neón', func: chalk.cyanBright },
    '3': { name: 'Verde Matrix', func: chalk.greenBright },
    '4': { name: 'Rosa Fucsia', func: chalk.magentaBright }
};

const rainbowColors = [
    chalk.red, chalk.yellow, chalk.green, chalk.cyan, chalk.blue, chalk.magenta
];

function getRainbowText(text) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        const color = rainbowColors[i % rainbowColors.length];
        result += color(text[i]);
    }
    return result;
}

function printHeader() {
    console.log(chalk.gray("  --------------------------------------------------"));
    console.log(`  ${chalk.cyan("»")} ${chalk.white("Developer")} : ${chalk.cyan("Hellsa")}`);
    console.log(`  ${chalk.cyan("»")} ${chalk.white("GitHub")}    : ${chalk.cyan("github.com/Hellsa")}`);
    console.log(`  ${chalk.cyan("»")} ${chalk.white("Version")}   : ${chalk.cyan("1.0.0")}`);
    console.log(chalk.gray("  --------------------------------------------------"));
}

function drawUI(data) {
    console.clear();
    console.log(`\n  Song: ${data.song || '---'}`);
    console.log(`  Author: ${data.author || '---'}`);
    console.log(`  Progress: ${data.progress || '0:00'}`);
    console.log(`  Lyrics: ${data.lyrics || '---'}`);
    console.log(`  Cooldown: ${MIN_UPDATE_INTERVAL/1000}s`);
}

function splitText(text, maxLen = 25) {
    if (text.length <= maxLen) return text;
    const words = text.split(' ');
    let line1 = "";
    let line2 = "";
    for (let word of words) {
        if ((line1 + word).length < maxLen) line1 += word + " ";
        else line2 += word + " ";
    }
    return line1.trim() + "\n" + line2.trim();
}

function drawLargeLyrics(data) {
    console.clear();
    const colorObj = colors[selectedColor] || colors['1'];
    console.log(`\n  ${chalk.bold(data.song)} - ${data.author} (${data.progress})\n`);
    
    if (data.lyrics) {
        const processedText = splitText(data.lyrics, 25);
        figlet.text(processedText, { font: selectedFont, horizontalLayout: 'fitted' }, function(err, largeText) {
            if (err) {
                console.log(colorObj.func(data.lyrics));
            } else {
                console.log(colorObj.func(largeText));
            }
        });
    } else {
        console.log(chalk.gray("  (Waiting for lyrics...)"));
    }
}

function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function getLyrics(track, artist) {
    try {
        const cleanTrack = track.replace(/\(.*?\)/g, '').trim();
        const response = await axios.get(`https://lrclib.net/api/get`, {
            params: { artist_name: artist, track_name: cleanTrack }
        });
        return response.data.syncedLyrics || null;
    } catch (e) { return null; }
}

function parseLyrics(lrc) {
    const lyrics = [];
    if (!lrc) return lyrics;
    const lines = lrc.split('\n');
    const lrcReg = /\[(\d+):(\d+\.\d+)\](.*)/;
    for (const line of lines) {
        const match = lrcReg.exec(line);
        if (match) {
            const time = (parseInt(match[1]) * 60 + parseFloat(match[2])) * 1000;
            lyrics.push({ time, text: match[3].trim() });
        }
    }
    return lyrics;
}

async function updateDiscord(text) {
    if (selectedMode !== '1') return false;
    const now = Date.now();
    if (now - lastUpdateTime < MIN_UPDATE_INTERVAL) return false;
    await new Promise(r => setTimeout(r, Math.random() * JITTER_MAX));
    try {
        await axios.patch('https://discord.com/api/v9/users/@me/settings', 
        { custom_status: { text: text || null, emoji_name: "🎵" } },
        { headers: { 
            'Authorization': DISCORD_TOKEN,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }});
        lastUpdateTime = Date.now();
        return true;
    } catch (e) { return false; }
}

async function mainLoop() {
    try {
        const data = await spotifyApi.getMyCurrentPlayingTrack();
        const track = data.body;
        if (track && track.is_playing) {
            const item = track.item;
            const progress = track.progress_ms;
            if (item.id !== lastTrackId) {
                const rawLyrics = await getLyrics(item.name, item.artists[0].name);
                currentLyrics = parseLyrics(rawLyrics);
                lastTrackId = item.id;
                lastSentText = "";
                if (!rawLyrics && selectedMode === '1') updateDiscord(`Listening to ${item.name}`);
            }
            let targetLine = "";
            if (currentLyrics.length > 0) {
                // Encontrar el índice actual
                let currentIndex = 0;
                for (let i = 0; i < currentLyrics.length; i++) {
                    if (progress >= currentLyrics[i].time) currentIndex = i;
                    else break;
                }

                // Calcular "velocidad" basada en la duración del verso actual
                const nextLine = currentLyrics[currentIndex + 1];
                const duration = nextLine ? (nextLine.time - currentLyrics[currentIndex].time) : 5000;

                // Offset proporcional: buscamos que la letra aparezca con un adelanto
                // que dependa de la duración del verso, pero con límites de seguridad.
                // Mínimo 1.2s (para evitar cambios bruscos) y máximo 2.5s (para música muy lenta).
                const offset = Math.max(1200, Math.min(2500, duration * 0.5));

                for (const line of currentLyrics) {
                    if (progress + offset >= line.time) {
                        targetLine = line.text;
                    } else break;
                }
            }

            if (targetLine !== lastSentText && targetLine !== "" && selectedMode === '1') {
                const success = await updateDiscord(targetLine);
                if (success) lastSentText = targetLine;
            }
            const uiData = { song: item.name, author: item.artists[0].name, progress: formatTime(progress), lyrics: targetLine };
            if (selectedMode === '1') drawUI(uiData);
            else drawLargeLyrics(uiData);
        } else {
            // Limpiar estado de Discord si se detiene o pausa
            if (lastSentText !== "" && selectedMode === '1') {
                await updateDiscord("");
                lastSentText = "";
                lastTrackId = null;
            }
            if (selectedMode === '1') drawUI({ lyrics: "Paused" });
            else drawLargeLyrics({ song: "Paused", author: "---", progress: "0:00" });
        }
    } catch (e) {}
    setTimeout(mainLoop, 500);
}

function showMenu() {
    console.clear();
    console.log(chalk.bold.blue(figlet.textSync('Spotify Lyrics', { font: 'Small' })));
    printHeader();
    console.log(chalk.yellow("\n  Selecciona una opción:"));
    console.log(chalk.cyan("  [01]") + " Discord Lyrics Status");
    console.log(chalk.cyan("  [02]") + " Terminal Lyrics Mode");
    console.log(chalk.cyan("  [03]") + " Exit");
    
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('\n  > ', (answer) => {
        if (answer === '1' || answer === '01') {
            selectedMode = '1';
            rl.close();
            authenticate();
        } else if (answer === '2' || answer === '02') {
            selectedMode = '2';
            rl.close();
            showFontMenu();
        } else if (answer === '3' || answer === '03') {
            process.exit();
        } else {
            rl.close();
            showMenu();
        }
    });
}

function showFontMenu() {
    console.clear();
    printHeader();
    console.log(chalk.bold.magenta("\n  --- 📂 ELIGE UN ESTILO ---"));
    console.log(chalk.cyan("  [01]") + " Standard");
    console.log(chalk.cyan("  [02]") + " Big");
    console.log(chalk.cyan("  [03]") + " Mini");
    
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('\n  > ', (answer) => {
        if (answer === '2' || answer === '02') selectedFont = 'Big';
        else if (answer === '3' || answer === '03') selectedFont = 'Mini';
        else selectedFont = 'Standard';
        rl.close();
        showColorMenu();
    });
}

function showColorMenu() {
    console.clear();
    printHeader();
    console.log(chalk.bold.magenta("\n  --- 🎨 ELIGE UN COLOR ---"));
    console.log(chalk.cyan("  [01]") + " Arcoíris");
    console.log(chalk.cyan("  [02]") + " Cian Neón");
    console.log(chalk.cyan("  [03]") + " Verde Matrix");
    console.log(chalk.cyan("  [04]") + " Rosa Fucsia");
    
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('\n  > ', (answer) => {
        selectedColor = answer.replace('0', '') || '1';
        rl.close();
        authenticate();
    });
}

async function authenticate() {
    const scopes = ['user-read-currently-playing'];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    const server = http.createServer(async (req, res) => {
        const query = url.parse(req.url, true).query;
        if (query.code) {
            const data = await spotifyApi.authorizationCodeGrant(query.code);
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
            res.end('Authorized.');
            server.close();
            mainLoop();
        }
    }).listen(8888);
    await open(authorizeURL);
}

showMenu();
