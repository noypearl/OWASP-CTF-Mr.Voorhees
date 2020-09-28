const validator = require('validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const jwt_decode = require('jwt-decode');
const path = require('path');
const logger = require('./helpers/logger');
// TODO - rearrange the code to be less trash with verifier
const { getNewToken } = require('./helpers/token');
const SUPPORTED_ALGS = ['RS256', 'RS384', 'RS512', 'HS256', 'HS384', 'HS512'];
const public_key = fs.readFileSync(path.join(__dirname, './assets', 'public.pem'), 'utf8');

// hehe :)
const verifyToken = (token, alg) => {
    const signOptions = {
        algorithm: alg
    }
    logger.info(`${alg} alg Detected in JWT from client. Token ${token}`);
    return jwt.verify(token, public_key, signOptions);
}


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
            logger.error(`Invalid input was provided instead of JWT token to middleware in ${url}. Token: ${token}`)
            return res.status(401).send("Nope. Try again.")
        }
        logger.info(`middleware valid token to ${url}. Token: ${token}`)
        next()
    },
    // TODO - use better structure
    tokenVerifierMiddleware : (req, res, next) => {
        const { cookies } = req
        const token = cookies && cookies.token || ''
        let decoded = {};
        if (!token) {
        logger.error("No token provided in tokenVerifierMiddleware. Calling next")
            return next(new Error ("Server Error"));
        }
        try{
            const body = jwt_decode(token);
            if (typeof body !== "object") {
                logger.error("Token body is not an object. Body: ${body}, Token: ${token}, Throwing server error");
                return res.status(400).send("Nope. Try again.");
            }
            const header = jwt_decode(token, {header: true});
            if (typeof header !== "object"){
                logger.error("Token header is not an object. Header: ${header}, Token: ${token}, Throwing server error")
                return res.status(400).send("Nope. Try again.");
            }
            if (!body.hasOwnProperty("username")) {
                logger.error("Missing username from token header. Header: ${header}, Token: ${token}, throwing server error")
                return res.status(400).send("Wait a minute - Who Are You??");
            }

            decoded = {
                'header': header, ...body
            }
            const decodedStr = JSON.stringify(decoded);
            const { alg = '' }  = decoded.header || 'RS256';
            if (alg === "none"){
                logger.error(`User tried None algorithm. \n Token: ${decodedStr})`)
                return res.status(401).send('None none for you!');
            }
            // Check unsupported alg use
            if(!SUPPORTED_ALGS.includes(alg)){
                logger.error(`Unsupported algorithm ${alg} . Token: ${decodedStr}`)
                return res.status(401).send("Unsupported algorithm. Nice try");
            }

            const verifiedToken = verifyToken(token, alg);
            // check solution
            const { username} = verifiedToken;
            if(username.toLowerCase() === "admin"){
                logger.info(`Exercise completed! Token: ${JSON.stringify(verifiedToken)}. Forwarding to home with finished key`)
                // TODO - change to real flag
                res.isPwned = true;
                return next();
            }
            else{
                logger.info(`Unauthorized token access with username ${username} and token ${verifiedToken}.\nMoving to home controller`)
                return next()
            }
        }
        catch(e){
            logger.error(`error verifying jwt token: ${token}, Error: ${e.message}, Returning Nope Try again`)
            return res.status(400).send("Nope. Try again.");
        }

    }
}
