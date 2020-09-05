const jwt = require('jsonwebtoken');
import {secret} from 'helpers/constants';

const getToken = (req, res) => {
    const token = jwt.sign({ "username": "guest" }, secret, {algorithm: 'HS256'});
    res.json({'token': token});
}

module.exports = getToken;