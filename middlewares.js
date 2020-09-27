const validator = require('validator');
const path = require('path');
const logger = require('./helpers/logger');
// TODO - rearrange the code to be less trash with verifier
const verifierMiddleware = require('./controllers/verifier');
const { getNewToken } = require('./helpers/token');

module.exports = {
    // logs and verifies token and throws error in case something's wrong
    tokenValidationMiddleware: (req, res, next) => {
        const { url, method, cookies } = req;
        let token = cookies && cookies.token || ''
        // setting cookie token
        if (!token) {
            logger.info(`No token was provided in ${method} middleware to ${url}`)
            token = getNewToken();
            logger.info(`Setting new token from middleware - ${token}`);
            res.cookie('token', token);
            logger.info('Returning homepage');
            return res.sendFile(path.join(__dirname , 'public', '/index.html'));
        }
        if (!validator.isJWT(token)) {
            const err = new Error("Nope. Try again");
            err.status = 401;
            logger.error(`Invalid input was provided instead of JWT token to middleware in ${url}. Token: ${token}`)
            return next(err);
        }
        logger.info(`middleware valid token to ${url}. Token: ${token}`)
        return next()
    },
    tokenVerifierMiddleware : (req, res, next) => {
        const token = verifierMiddleware(req, res);
        const { username } = token || '';
        if(username === "admin"){
            logger.info(`Exercise completed! Token: ${JSON.stringify(token)}. Forwarding to home with finished key`)
            // TODO - change to real flag
            res.isPwned = true;
            return next()
        }
        logger.info(`Unauthorized token access with username ${username} and token ${JSON.stringify(token)}.\nMoving to home controller`)
        next();
    }
}
