const { getNewToken } = require('../helpers/token');

const getTokenRoute = (req, res, next) => {
    const token = getNewToken();
    if (token){
        return res.send({token});
    }
    const err = new Error("failed to get token in token controller");
    return next(err)
}

module.exports = getTokenRoute;
