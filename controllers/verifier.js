const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const logger = require('../helpers/logger');

const public_key = fs.readFileSync(path.join(__dirname , '../assets', 'public.pem'), 'utf8');
const SUPPORTED_ALGS = ['RS256', 'RS384', 'RS512', 'HS256', 'HS384', 'HS512'];

const verifyTokenHandler = (err, decoded) => {
    logger.info(`Handling verify on ${decoded.header} ${decoded.body}`);
    if (err){
        logger.error(err.message);
        throw Error(err.message);
    }
    else{
        return decoded;
    }
}

// hehe :)
const verifyToken = (token, alg) => {
    const signOptions = {
        algorithm: alg
    }
    logger.info(`${alg} alg Detected in JWT from client. Token ${token}`);
    try {
        return jwt.verify(token, public_key, signOptions, verifyTokenHandler);
    } catch (e) {
        throw new Error(e.message);
    }
}

const verifyRoute = (req, res, next) => {
    const { cookies } = req
    const token = cookies && cookies.token || ''
    let decoded = '';
    if (!token) {
        logger.info(`No token provided in /verify. Alg: ${alg}, decoded: ${decoded}`)
        return res.send("No token was provided. \nPlease provide a 'Token' header");
    }
    try{
        decoded = jwt.decode(token, {"complete": true});
    }
    // TODO - fix DRY of error object
    catch(e){
        const errorMessage = e.message
        logger.error(`error decoding jwt token: ${token}, err: ${errorMessage}`)
        return next(new Error(errorMessage));
    }
    const decoded_str = JSON.stringify(decoded);
    const { alg = '' }  = decoded.header;
    if (alg === "none"){
        const err = new Error('None none for you!');
        logger.error(`User tried None algorithm. \n Token: ${decoded_str}), error - ${err.message}`)
        err.status = 401;
        return next(err.message);
    }
    // Check unsupported alg use
    if(!SUPPORTED_ALGS.includes(alg)){
        const err = new Error('Unsupported algorithm. Nice try');
        logger.error(`Unsupported algorithm ${alg} ${decoded_str} - error - ${err.message}`)
        res.status = 401;
        return next(err.message);
    }
    // Verify token according to algorithm
    try {
        const tokenVerificationResult = verifyToken(token, alg);
        logger.info(`verified token: ${JSON.stringify(tokenVerificationResult)}`);
        return res.send(tokenVerificationResult);
    }
    catch (e) {
        const errorMessage = e.message;
        logger.error(`Error on verify token ${token} : ${errorMessage}`);
        return next(new Error(errorMessage));
    }
}

module.exports = verifyRoute;
