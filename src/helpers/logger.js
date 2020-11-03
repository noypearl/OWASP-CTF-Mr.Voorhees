const appRoot = require('app-root-path');
const winston = require('winston');
const util = require('util');

const getLogger = ({ reqId }) => winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(
      (info) => `${info.reqId} ${info.timestamp} ${info.level}: ${info.message}${
        info.splat !== undefined ? `${info.splat}` : ' '
      }`,
    ),
  ),
  defaultMeta: { reqId },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${appRoot}/logs/all.txt` }),
  ],
});

module.exports = ({ reqId }) => {
  const logger = getLogger({ reqId });

  return (moduleName) => ({
    info(...msg) {
      logger.info(util.format(moduleName, ...msg));
    },
    warn(...msg) {
      logger.warn(util.format(moduleName, ...msg));
    },
    error(...msg) {
      logger.error(util.format(moduleName, ...msg));
    },
    destroy: () => logger.destroy(),
  });
};
