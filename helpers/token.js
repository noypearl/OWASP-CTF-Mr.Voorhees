const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const logger = require('../helpers/logger');
const names = ["Jason", "Tommy", "Pamela", "Roy", "Alice", "Vera", "Sara", "Tamara", "Chris"];
const private_key = fs.readFileSync(path.join(__dirname , '../assets', 'private.key'), 'utf8');

module.exports = {
    getNewToken: () => {
        const username = names[Math.floor(Math.random() * names.length)];
        logger.info(`Generating RSA token for username ${username}`);
        try {
            return jwt.sign({username}, private_key, {algorithm: 'RS256'});
        } catch (e) {
            logger.error(`Error generating token for user named ${username} - ${e.message}`)
            throw new Error(`There was a problem generating token`);
        }
    }
//    TODO - verifyToken
};

