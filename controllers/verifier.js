const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const logger = require('../helpers/logger');
const jwt_decode = require('jwt-decode');
const public_key = fs.readFileSync(path.join(__dirname , '../assets', 'public.pem'), 'utf8');
const SUPPORTED_ALGS = ['RS256', 'RS384', 'RS512', 'HS256', 'HS384', 'HS512'];

const verifyTokenHandler = (err, decoded) => {
    const decoded_str = JSON.stringify(decoded);
    logger.info(`Handling verify on ${decoded_str}`);
    if (err){
        logger.error(err.message);
        throw Error(err.message);
    }
    else{
        return decoded;
    }
}

const throwUnauthorizedError = (errMessage) => {
    const err = new Error(errMessage);
    err.status = 401;
    throw err;
}

// hehe :)
const verifyToken = (token, alg) => {
    const signOptions = {
        algorithm: alg
    }
    logger.info(`${alg} alg Detected in JWT from client. Token ${token}`);
    try {
        return jwt.verify(token, public_key,{algorithm: "HS256"}, verifyTokenHandler);
    } catch (e) {
        throw new Error(e.message);
    }
}

const verifyTokenMiddleware = (req) => {
    const { cookies } = req
    const token = cookies && cookies.token || ''
    let decoded = '';
    if (!token) {
        const errMessage = "No token was provided.";
        logger.info(`No token was provided in ${req}. Alg: ${alg}`)
        throwUnauthorizedError(errMessage)
    }
    try{
        const body = jwt_decode(token);
        const header = jwt_decode(token, {header: true});
        decoded = {
            'header': header,...body
        }
    }
    // TODO - fix DRY of error object
    catch(e){
        logger.error(`error decoding jwt token: ${token}, err: ${e.message}`)
        throwUnauthorizedError(e);
    }
    const decoded_str = JSON.stringify(decoded);
    const { alg = '' }  = decoded.header || 'RS256';
    if (alg === "none"){
        const errMessage = 'None none for you!';
        logger.error(`User tried None algorithm. \n Token: ${decoded_str})`)
        throwUnauthorizedError(errMessage)
    }
    // Check unsupported alg use
    if(!SUPPORTED_ALGS.includes(alg)){
        const errMessage = 'Unsupported algorithm. Nice try';
        logger.error(`Unsupported algorithm ${alg} . Token: ${decoded_str}`)
        throwUnauthorizedError(errMessage);
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
        throwUnauthorizedError(errorMessage)
    }
}

module.exports = verifyTokenMiddleware;
