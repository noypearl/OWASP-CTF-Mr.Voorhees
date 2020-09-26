const validator = require('validator');
const logger = require('./helpers/logger');

module.exports = {
    // logs and verifies token and throws error in case something's wrong
    tokenMiddleware : (req, res, next) => {
        const token = req.get('Token')
        if (!token) {
        logger.error(`No token was provided in middleware to ${req.url}`)
        const err = new Error("No token was provided");
        err.status - 401;
        return next(err);
        }
        if (!validator.isJWT(token)){
            const err = new Error("Nope. Try again");
            err.status - 401;
            logger.error(`Invalid input was provided instead of JWT token to middleware in ${req.url}. Token: ${token}`)
            return next(err);
        }
        const { url } = req;
        logger.info(`middleware valid token to ${url}. Token: ${token}`)
        return next()
    }
}
