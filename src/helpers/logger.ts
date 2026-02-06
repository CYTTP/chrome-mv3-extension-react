/**
 * 简单的日志工具函数
 */

const isDev = import.meta.env.DEV;

/**
 * 格式化日志前缀
 */
function getPrefix(level: string): string {
  const now = new Date();
  const time = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  return `[${time}] [${level}]`;
}

/**
 * DEBUG 日志 - 仅开发环境
 */
export function logDebug(...args: any[]) {
  if (isDev) {
    console.log(getPrefix('DEBUG'), ...args);
  }
}

/**
 * INFO 日志
 */
export function logInfo(...args: any[]) {
  console.log(getPrefix('INFO'), ...args);
}

/**
 * WARN 日志
 */
export function logWarn(...args: any[]) {
  console.warn(getPrefix('WARN'), ...args);
}

/**
 * ERROR 日志
 */
export function logError(...args: any[]) {
  console.error(getPrefix('ERROR'), ...args);
}

/**
 * 默认导出
 */
export default {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
};
