const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const tokenController = require('../controllers/token');
const verifierController = require('../controllers/verifier');
const homeController = require('../controllers/home');
const { tokenValidationMiddleware } = require('../middlewares');


// App routes
router.post('/verify', tokenValidationMiddleware, verifierController);
router.get('/', tokenValidationMiddleware, homeController);
//TODO - make / return token if not provided instead of /token controller
router.get('/token', tokenController);

// TODO - delete before uploading to production
// Returns signed JWT
router.get('/print', (req, res) => {
  const token = req.cookies && req.cookies.token || ''
  const decoded = jwt.decode(token, {"complete": true});
  return res.json({"full_token": decoded,"header": decoded.header.alg});
});


module.exports = router;
