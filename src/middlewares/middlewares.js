const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const getLogger = require('../helpers/logger');
const { SERVER_ERROR } = require('../helpers/responses.json');
const { robotsFilePath, errorPagePath } = require('../helpers/staticFiles');

const robotsFileContent = fs.readFileSync(robotsFilePath, 'utf-8');

module.exports = {
  loggerMiddleware: (req, res, next) => {
    const reqId = uuidv4();
    const getLoggerForModule = getLogger({ reqId });
    req.getLogger = getLoggerForModule;
    req.reqId = reqId;
    req.getLogger('[INFO]').info(`got a new request ${req.path}`);
    next();
  },
  notFoundMiddleware: (req, res) => {
    const { method, url, getLogger } = req;
    const logger = getLogger('[notFoundMiddleware]');
    logger.warn(`Invalid ${method} request to ${url}, returning error page`);
    return res.status(404).sendFile(errorPagePath);
  },
  onErrorMiddleware: (err, req, res) => {
    const { method, url, getLogger } = req;
    const logger = getLogger('[onErrorMiddleware]');
    logger.error(`Error middleware ${method} request to ${url}.-  error ${err.message}`);
    return res.status(SERVER_ERROR.code).send(SERVER_ERROR.name);
  },
  robotsMiddleware: (req, res) => {
    res.type('text/plain');
    res.status(200).send(robotsFileContent);
  },
};
