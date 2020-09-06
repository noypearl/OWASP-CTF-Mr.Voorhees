const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const private_key = fs.readFileSync(path.join(__dirname , '../assets', 'private.key'), 'utf8');

const getToken = (req, res) => {
    const token = jwt.sign({ "username": "guest" }, private_key, {algorithm: 'RS256'});
    res.json({'token': token});
}

module.exports = getToken;