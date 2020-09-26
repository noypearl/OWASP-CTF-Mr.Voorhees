const logger = require('../helpers/logger');
// const { authorizeUserByToken } = require('../middlewares');

const getHome = (req, res) => {
// middleware - require token
    const token = req.cookies && req.cookies.token || ''
    if(token) {
        logger.info(`Exercise completed! Token: ${token} Returning flag`)
        return res.send("FLAG!")
    }
    else{
        logger.info(`Unauthorized token access - token`)
        return res.send("UNAUTHORIZED PAGE TODO")
    }
}

module.exports = getHome;

