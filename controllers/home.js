import logger from 'helpers/logger'

const getHome = (req, res) => {
// middleware - require token
    const token = req.get("Token");
    if(token) {
        logger.info(`Exercise completed! Token: ${token} Returning flag`)
        return res.send("FLAG!")
    }
    else{
        logger.info(`Unauthorized token access - token`)
        return res.send("UNAUTHORIZED PAGE TODO")
    }


}
module.exports = getHome;