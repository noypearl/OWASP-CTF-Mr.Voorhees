const { responseByStatus } = require('../helpers/appResponses');
const { indexFilePath } = require('../helpers/staticFiles');
const AppResponses = require('../helpers/responses.json');

const getHome = (req, res) => {
  const {
    getLogger, method, url, isPwned,
  } = req;
  const logger = getLogger('[getHome]');
  logger.info('reached to getHome');

  if (isPwned) {
    logger.info('Got flag! Returning flag in /home');

    return responseByStatus(res, AppResponses.FLAG);
  }

  logger.info(`Returning homepage at ${method} request to ${url}`);
  return res.sendFile(indexFilePath);
};

module.exports = getHome;
