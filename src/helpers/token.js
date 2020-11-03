const jwt = require('jsonwebtoken');
const fs = require('fs');
const { privateKeyPath } = require('./staticFiles');

const names = ['Jason', 'Tommy', 'Pamela', 'Roy', 'Alice', 'Vera', 'Sara', 'Tamara', 'Chris'];
const privateKeyContent = fs.readFileSync(privateKeyPath, 'utf8');

module.exports = {
  getNewToken: async (getLogger) => {
    const logger = getLogger('[getNewToken]');
    const username = names[Math.floor(Math.random() * names.length)];

    try {
      logger.info('Trying to sign token with private key and RSA');
      const newToken = await jwt.sign({ username }, privateKeyContent, { algorithm: 'RS256' });
      logger.info('newToken = ', newToken);
      return newToken;
    } catch (e) {
      logger.error(`Throwing error generating token for user named ${username} - ${e.message}`);
      throw new Error('There was a problem generating token');
    }
  },
};
