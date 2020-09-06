const path = require('path');
const logger = require('../helpers/logger');

const returnErrorPage = (req, res) => {
    logger.info('Returning error page.')
    return res.sendFile(path.join(__dirname , 'public', 'error.html'));
}

module.exports = returnErrorPage;