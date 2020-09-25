const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const validator = require('validator')
const logger = require('../helpers/logger');
// TODO : "HIDE" key in the website
const public_key = fs.readFileSync(path.join(__dirname , '../assets', 'public.pem'), 'utf8');
const SUPPORTED_ALGS = ['RS256', 'RS384', 'RS512', 'HS256', 'HS384', 'HS512'];

const handleVerify = (err, decoded) => {
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
    logger.info(`${alg} alg Detected in JWT from client`);
    try {
        return jwt.verify(token, public_key, signOptions, handleVerify);
    } catch (e) {
        throw Error(e.message);
    }
}

const verifyRoute = (req, res, next) => {
    const token = req.get("Token");
    let decoded = '';
    if (!token) {
        logger.info(`No token provided in /verify. Alg: ${alg}, decoded: ${decoded}`)
        return res.send("No token was provided. \nPlease provide a 'Token' header");
    }
    try{
        decoded = jwt.decode(token, {"complete": true});
    }
    catch(e){
        logger.error(`error decoding jwt token: ${token}, err: ${e.message}`)
        return next(new Error(e.message));
    }
    const decoded_str = JSON.stringify(decoded);
    const { alg } = decoded.header || '';

    if (alg === "none"){
        logger.warning(`User tried None algorithm. \n Token: ${decoded_str})`)
        res.statusCode = 401;
        return next(new Error('None none for you!'));
    }
    // Check unsupported alg use
    if(!SUPPORTED_ALGS.includes(alg)){
        logger.warning(`Unsupported algorithm ${alg} ${decoded}`)
        res.statusCode = 401;
        return next(new Error("Unsupported algorithm. Nice try."));
    }
    // Verify token according to algorithm
    try {
        const tokenVerificationResult = verifyToken(token, alg);
        logger.info(tokenVerificationResult);
        return res.send(tokenVerificationResult);
    }
    catch (e) {
        const errorMessage = e.message
        logger.error(`Error on verify token ${token} : ${errorMessage}`);
        return next(new Error(errorMessage));
    }
}

module.exports = verifyRoute;
