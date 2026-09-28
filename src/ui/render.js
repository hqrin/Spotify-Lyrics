const chalk = require('chalk');
const figlet = require('figlet');
const { MIN_UPDATE_INTERVAL } = require('../config');

const colors = {
  '1': { name: 'Arcoíris', func: (t) => getRainbowText(t) },
  '2': { name: 'Cian Neón', func: chalk.cyanBright },
  '3': { name: 'Verde Matrix', func: chalk.greenBright },
  '4': { name: 'Rosa Fucsia', func: chalk.magentaBright },
  '5': { name: 'Rojo', func: chalk.redBright },
  '6': { name: 'Amarillo', func: chalk.yellowBright },
  '7': { name: 'Azul', func: chalk.blueBright },
  '8': { name: 'Blanco', func: chalk.white },
  '9': { name: 'Negro', func: chalk.black },
  '10': { name: 'Gris', func: chalk.gray },
};

const rainbowColors = [chalk.red, chalk.yellow, chalk.green, chalk.cyan, chalk.blue, chalk.magenta];

function getRainbowText(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const color = rainbowColors[i % rainbowColors.length];
    result += color(text[i]);
  }
  return result;
}

function printHeader() {
  console.log(chalk.gray('  --------------------------------------------------'));
  console.log(`  ${chalk.cyan('»')} ${chalk.white('Developer')} : ${chalk.cyan('Hellsa')}`);
  console.log(`  ${chalk.cyan('»')} ${chalk.white('GitHub')}    : ${chalk.cyan('github.com/Hellsa')}`);
  console.log(`  ${chalk.cyan('»')} ${chalk.white('Version')}   : ${chalk.cyan('2.1.0')}`);
  console.log(chalk.gray('  --------------------------------------------------'));
}

function splitText(text, maxLen = 25) {
  if (text.length <= maxLen) return text;

  const words = text.split(' ');
  let line1 = '';
  let line2 = '';

  for (const word of words) {
    if ((line1 + word).length < maxLen) line1 += `${word} `;
    else line2 += `${word} `;
  }

  return `${line1.trim()}\n${line2.trim()}`;
}

function drawUI(data) {
  console.clear();
  console.log(`\n  Song: ${data.song || '---'}`);
  console.log(`  Author: ${data.author || '---'}`);
  console.log(`  Lyrics: ${data.lyrics || '---'}`);
  console.log(`  Progress: ${data.progress || '0:00'}`);
  console.log(`  Traductor: ${data.translationEnabled ? 'Habilitado' : 'Deshabilitado'}${data.translationEnabled ? ` (${data.targetLanguage})` : ''}`);
  console.log(`  Cooldown: ${MIN_UPDATE_INTERVAL / 1000}s`);
  if (data.originalLyrics && data.originalLyrics !== data.lyrics) {
    console.log(chalk.gray(`\n  Original: ${data.originalLyrics}`));
  }
}

function drawLargeLyrics(data, selectedColor, selectedFont) {
  console.clear();
  const colorObj = colors[selectedColor] || colors['1'];

  console.log(`\n  ${chalk.bold(data.song)} - ${data.author} (${data.progress})\n`);

  if (data.lyrics) {
    const processedText = splitText(data.lyrics, 25);
    figlet.text(processedText, { font: selectedFont, horizontalLayout: 'fitted' }, function (err, largeText) {
      if (err) {
        console.log(colorObj.func(data.lyrics));
      } else {
        console.log(colorObj.func(largeText));
      }
      if (data.originalLyrics && data.originalLyrics !== data.lyrics) {
        console.log(chalk.gray(`\n  Original: ${data.originalLyrics}`));
      }
      console.log(chalk.white(`\n  Traductor: ${data.translationEnabled ? 'Habilitado' : 'Deshabilitado'}${data.translationEnabled ? ` (${data.targetLanguage})` : ''}`));
    });
  } else {
    console.log(chalk.gray('  (Waiting for lyrics...)'));
  }
}

module.exports = {
  printHeader,
  drawUI,
  drawLargeLyrics,
  colors,
};
