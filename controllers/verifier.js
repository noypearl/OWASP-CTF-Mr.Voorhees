const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const logger = require('../helpers/logger');
const jwt_decode = require('jwt-decode');
const public_key = fs.readFileSync(path.join(__dirname , '../assets', 'public.pem'), 'utf8');
const SUPPORTED_ALGS = ['RS256', 'RS384', 'RS512', 'HS256', 'HS384', 'HS512'];

const throwErrorWithMessageAndStatus = (message, status) => {
    const err = new Error(message);
    err.status = status;
    throw err;
}

// hehe :)
const verifyToken = (token, alg) => {
    const signOptions = {
        algorithm: alg
    }
    logger.info(`${alg} alg Detected in JWT from client. Token ${token}`);
    try {
        return jwt.verify(token, public_key, signOptions);
    } catch (e) {
        throw new Error(e.message);
    }
}

const getVerifiedToken = (token) => {
    if (!token) {
        const errMessage = "Wait a minute - Who Are You??";
        logger.info(`No token was provided in ${req}. Alg: ${alg}. Throwing ${errMessage}`)
        throwErrorWithMessageAndStatus(errMessage, 401)
    }
    let decoded = '';
    try{
        const body = jwt_decode(token);
        if (typeof body !== "object") {
            logger.error("Token body is not an object. Body: ${body}, Token: ${token}, Throwing server error");
            throwErrorWithMessageAndStatus("Nope. Try again.", 400);
        }
        const header = jwt_decode(token, {header: true});
        if (typeof header !== "object"){
            logger.error("Token header is not an object. Header: ${header}, Token: ${token}, Throwing server error")
            throwErrorWithMessageAndStatus("Nope. Try again.", 400)
        }
        if (!body.hasOwnProperty("username")) {
           logger.error("Missing username from token header. Header: ${header}, Token: ${token}, throwing server error")
            throwErrorWithMessageAndStatus(("Wait a minute - Who Are You??"));
        }
        decoded = {
            'header': header, ...body
        }
    }
    catch(e){
        logger.error(`error decoding jwt token: ${token}, Error: ${e.message}, Throwing Server Error`)
        // Prevent from informative errors
        if(e.status && e.status === 400) {
            throwErrorWithMessageAndStatus(e.message, 401);
        }
        else {
            throwErrorWithMessageAndStatus("Nope. Try again", 400)
        }
    }
    const decoded_str = JSON.stringify(decoded);
    const { alg = '' }  = decoded.header || 'RS256';
    if (alg === "none"){
        logger.error(`User tried None algorithm. \n Token: ${decoded_str})`)
        throwErrorWithMessageAndStatus('None none for you!', 401)
    }
    // Check unsupported alg use
    if(!SUPPORTED_ALGS.includes(alg)){
        const errMessage = 'Unsupported algorithm. Nice try';
        logger.error(`Unsupported algorithm ${alg} . Token: ${decoded_str}`)
        throwErrorWithMessageAndStatus(errMessage, 401);
    }
    // Verify token according to algorithm
    try {
        const tokenVerificationResult = verifyToken(token, alg);
        logger.info(`verified token: ${JSON.stringify(tokenVerificationResult)}`);
        // returns the token as json
        return tokenVerificationResult;
    }
    catch (e) {
        const errorMessage = e.message;
        logger.error(`Error on verify token ${JSON.stringify(token)} : ${errorMessage}`);
        throwErrorWithMessageAndStatus("Server Error", 500);
    }
}
module.exports = getVerifiedToken;
