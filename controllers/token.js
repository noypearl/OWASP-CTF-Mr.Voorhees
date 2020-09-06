const jwt = require('jsonwebtoken');
const secret = require('../helpers/constants').secret;

const getToken = (req, res) => {
    const token = jwt.sign({ "username": "guest" }, secret, {algorithm: 'HS256'});
    res.json({'token': token});
}

module.exports = getToken;