const path = require('path');
const logger = require('../helpers/logger');

const returnErrorPage = (err, req, res, next) => {
    logger.info('Returning error page.');
    logger.error("test")
    logger.info("test")
    logger.error(`request for ${req.originalUrl}: ${err}`);
}

module.exports = returnErrorPage;
