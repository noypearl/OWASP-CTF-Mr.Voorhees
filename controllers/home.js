const path = require('path');
const logger = require('../helpers/logger');

const getHome = (req, res) => {
    logger.info(`Returning homepage at ${req.method} request to ${req.url}`)
    return res.sendFile(path.join(__dirname , '../public', '/index.html'));
}


module.exports = getHome;

