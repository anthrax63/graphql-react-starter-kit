import {logLevel} from '../config';
import chalk from 'chalk';

// noinspection JSPotentiallyInvalidConstructorUsage
const colors = new chalk.constructor({enabled: true});
const LogRange = ['debug', 'info', 'warn', 'error'];

function shouldViewLog(logLevelName) {
  let i = LogRange.indexOf(logLevelName);
  if (i === undefined) {
    i = LogRange.length - 1;
  }
  return i >= LogRange.indexOf(logLevel);
}

function getPrefix(logLevelName) {
  const message = `${new Date().toISOString()} ${logLevelName.toUpperCase()}: `;
  switch (logLevelName) {
    case 'info':
      return colors.green.bold(message);
    case 'debug':
      return colors.blue.bold(message);
    case 'warn':
      return colors.yellow.bold(message);
    case 'error':
      return colors.red.bold(message);
    default:
      return message;
  }
}

function writeLog(levelName, messages) {
  if (shouldViewLog(levelName)) {
    console.log(getPrefix(levelName), ...messages);
  }
}

export function logInfo(...messages) {
  writeLog('info', messages);
}

export function logWarn(...messages) {
  writeLog('warn', messages);
}

export function logDebug(...messages) {
  writeLog('debug', messages);
}

export function logError(...messages) {
  writeLog('error', messages);
}

export default {
  debug: logDebug,
  error: logError,
  info: logInfo,
  warn: logWarn
};
