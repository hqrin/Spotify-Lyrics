const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');
const { printHeader } = require('./render');

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askYesNo(question) {
  return new Promise(async (resolve) => {
    while (true) {
      const answer = (await ask(question)).toLowerCase();
      if (['s', 'si', 'y', 'yes'].includes(answer)) return resolve(true);
      if (['n', 'no'].includes(answer)) return resolve(false);
      console.log(chalk.red('  Respuesta no válida. Escribe s/n.'));
    }
  });
}

async function askMode(currentSettings) {
  while (true) {
    console.clear();
    console.log(chalk.white(' ▄█       ▄██   ▄      ▄████████  ▄█   ▄████████    ▄████████    ▄████████    ▄███████▄ '));
    console.log(chalk.white('███       ███   ██▄   ███    ███ ███  ███    ███   ███    ███   ███    ███   ███    ███ '));
    console.log(chalk.white('███       ███▄▄▄███   ███    ███ ███▌ ███    █▀    ███    █▀    ███    █▀    ███    ███ '));
    console.log(chalk.white('███       ▀▀▀▀▀▀███  ▄███▄▄▄▄██▀ ███▌ ███          ███          ███          ███    ███ '));
    console.log(chalk.white('███       ▄██   ███ ▀▀███▀▀▀▀▀   ███▌ ███        ▀███████████ ▀███████████ ▀█████████▀  '));
    console.log(chalk.white('███       ███   ███ ▀███████████ ███  ███    █▄           ███          ███   ███        '));
    console.log(chalk.white('███▌    ▄ ███   ███   ███    ███ ███  ███    ███    ▄█    ███    ▄█    ███   ███        '));
    console.log(chalk.white('█████▄▄██  ▀█████▀    ███    ███ █▀   ████████▀   ▄████████▀   ▄████████▀   ▄████▀      '));
    console.log(chalk.white('▀                     ███    ███                                                         '));
    printHeader();
    console.log(chalk.white('\n  Selecciona una opción:'));
    console.log(chalk.white('  [1] Discord Lyrics Status'));
    console.log(chalk.white('  [2] Terminal Lyrics Mode'));
    console.log(chalk.white('  [3] Settings'));
    console.log(chalk.white('  [4] Exit'));

    const answer = await ask('\n  > ');
    if (answer === '1' || answer === '01') return '1';
    if (answer === '2' || answer === '02') return '2';
    if (answer === '3' || answer === '03') return '3';
    if (answer === '4' || answer === '04') process.exit(0);
    console.log(chalk.red('  Opción no válida. Intenta de nuevo.'));
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
}

async function askFont() {
  while (true) {
    console.clear();
    printHeader();
    console.log(chalk.bold.white('\n  ---  ELIGE UN ESTILO ---'));
    console.log(chalk.cyan('  [01]') + ' Standard');
    console.log(chalk.cyan('  [02]') + ' Big');
    console.log(chalk.cyan('  [03]') + ' Mini');

    const answer = await ask('\n  > ');
    if (answer === '2' || answer === '02') return 'Big';
    if (answer === '3' || answer === '03') return 'Mini';
    return 'Standard';
  }
}

async function askColor() {
  while (true) {
    console.clear();
    printHeader();
    console.log(chalk.bold.white('\n  ---  ELIGE UN COLOR ---'));
    console.log(chalk.cyan('  [01]') + ' Arcoíris');
    console.log(chalk.cyan('  [02]') + ' Cian Neón');
    console.log(chalk.cyan('  [03]') + ' Verde Matrix');
    console.log(chalk.cyan('  [04]') + ' Rosa Fucsia');


    const answer = await ask('\n  > ');
    const normalized = answer.replace(/^0+/, '') || '1';
    if (['1', '2', '3', '4'].includes(normalized)) return normalized;
  }
}

async function askLanguage(currentLanguage) {
  const languages = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    pt: 'Português',
    de: 'Deutsch',
    it: 'Italiano',
    ja: '日本語',
    ko: '한국어',
    ru: 'Русский',
    zh: '中文',
  };

  while (true) {
    console.clear();
    printHeader();
    console.log(chalk.bold.white('\n    SELECCIONA UN IDIOMA '));
    Object.entries(languages).forEach(([key, label]) => {
      const active = key === currentLanguage ? chalk.green(' (activo)') : '';
      console.log(chalk.cyan(`  [${key}]`) + ` ${label}${active}`);
    });

    const answer = (await ask('\n  > ')).toLowerCase();
    if (languages[answer]) return answer;
    console.log(chalk.red('  Idioma no válido, intenta de nuevo.'));
  }
}

async function askSettings(currentSettings) {
  console.clear();
  printHeader();
  console.log(chalk.bold.white('\n   SETTINGS ---'));
  const translationEnabled = await askYesNo(
    `\n  Traducción de letras está actualmente ${currentSettings.translationEnabled ? 'activada' : 'desactivada'}.\n  ¿Deseas activarla? [s/n]: `
  );

  let targetLanguage = currentSettings.targetLanguage;
  if (translationEnabled) {
    targetLanguage = await askLanguage(currentSettings.targetLanguage);
  }

  console.log(chalk.green('\n  Configuración guardada. Volviendo al menú principal...'));
  await new Promise((resolve) => setTimeout(resolve, 900));

  return {
    translationEnabled,
    targetLanguage,
  };
}

module.exports = {
  askMode,
  askFont,
  askColor,
  askSettings,
};
