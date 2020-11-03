const validator = require('validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const jwtDecode = require('jwt-decode');
const { getNewToken } = require('./token');
const { indexFilePath, publicKeyPath } = require('./staticFiles');

const SUPPORTED_ALGS = ['RS256', 'RS384', 'RS512', 'HS256', 'HS512'];
const publicKeyContent = fs.readFileSync(publicKeyPath, 'utf8');
const AppResponses = require('./responses.json');
const { responseByStatus } = require('./appResponses');

// hehe :)
const verifyToken = (getLogger, token, algorithm) => {
  const logger = getLogger('[tokenVerifierHandler.verifyToken]');
  const signOptions = {
    algorithm,
  };

  logger.info(`will verify token ${token}`);
  return new Promise((resolve, reject) => {
    jwt.verify(token, publicKeyContent, signOptions, (err, decoded) => {
      if (err) {
        logger.error('error in verify: ', err.message);
        return reject(err);
      }

      logger.info('succeeded to decode, =', decoded);
      return resolve(decoded);
    });
  });
};

module.exports = {
  // logs and verifies token and throws error in case something's wrong
  tokenValidationHandler: async (req, res, next) => {
    const { url, cookies, getLogger } = req;
    const logger = getLogger('[tokenValidationHandler]');
    let { token = '' } = cookies;
    // setting cookie token
    if (!token) {
      logger.info(`No token was provided in to ${url}`);

      token = await getNewToken(getLogger);
      logger.info(`Setting new token from handler - ${token}`);

      logger.info('Returning homepage');
      res.cookie('token', token);
      return res.sendFile(indexFilePath);
    }

    logger.info(`Got token ${token}`);
    if (!validator.isJWT(token)) {
      logger.error('Invalid input was provided instead of JWT token');
      return responseByStatus(res, AppResponses.TRY_AGAIN);
    }

    logger.info('Token is valid, calling next');

    req.token = token;
    return next();
  },
  tokenVerifierHandler: async (req, res, next) => {
    const { token, getLogger } = req;
    const logger = getLogger('[tokenVerifierHandler]');

    const sendTryAgain = (logInfo) => {
      logger.error(`${logInfo}, Returning ${AppResponses.TRY_AGAIN.name}`);
      return responseByStatus(res, AppResponses.TRY_AGAIN);
    };

    try {
      const body = jwtDecode(token);
      if (typeof body !== 'object') {
        return sendTryAgain(`Token body is not an object. Body: ${body}`);
      }

      logger.info('going to decode the headers of the jwt');
      const header = jwtDecode(token, { header: true });

      if (typeof header !== 'object') {
        return sendTryAgain(`Token header is not an object. Header: ${header}`);
      }

      if (!Object.hasOwnProperty.call(body, 'username')) {
        logger.error(`Missing username from token header. Header: ${JSON.stringify(header)}, returning ${AppResponses.WHO_ARE_YOU}`);
        return responseByStatus(res, AppResponses.WHO_ARE_YOU);
      }

      const decodedStr = JSON.stringify({ header, body });
      const { alg = 'RS256' } = header;
      logger.info('alg = ', alg);

      if (alg === 'none') {
        logger.error('User tried None algorithm. ');
        return responseByStatus(res, AppResponses.NONE_NONE);
      }

      // Check unsupported alg use
      if (!SUPPORTED_ALGS.includes(alg)) {
        logger.error(`Returning ${AppResponses.UNSUPPORTED_ALG.name} ${alg}. Token: ${decodedStr}.`);
        return responseByStatus(res, AppResponses.UNSUPPORTED_ALG);
      }
      logger.info('Going to verify token');
      const verifiedToken = await verifyToken(getLogger, token, alg);
      // check solution
      const { username } = verifiedToken;
      if (username.toLowerCase() === 'admin') {
        logger.info(`Exercise completed! Token: ${JSON.stringify(verifiedToken)}. Forwarding to home with finished key`);
        req.isPwned = true;
        return next();
      }

      logger.info(`Unauthorized token access with username ${username}.\nMoving to home controller`);
      return next();
    } catch (e) {
      logger.error(`error verifying jwt token: ${token}, Error: ${e.message}, Returning ${AppResponses.TRY_AGAIN.name}`);
      return responseByStatus(res, AppResponses.TRY_AGAIN);
    }
  },
};
