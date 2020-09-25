const validator = require('validator');
const logger = require('./helpers/logger');

module.exports = {
    // logs and verifies token and throws error in case something's wrong
    tokenMiddleware : (req, res, next) => {
        const token = req.get('Token')
        if (!token) {
            res.statusCode = 401;
            return next(new Error("No token was provided"));
        }
        if (!validator.isJWT(token)){
            logger.error(`Invalid input was provided instead of JWT token in ${req.url}. Token: ${token}`)
            return next(new Error("Nope. Try again"));
        }
        const { url } = req;
        logger.info(`${url} Token: ${token}`)
        return next()
    }
}
