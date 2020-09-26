const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const tokenController = require('../controllers/token');
const verifierController = require('../controllers/verifier');
const homeController = require('../controllers/home');
const { tokenMiddleware } = require('../middlewares');


// App routes
router.post('/verify', tokenMiddleware, verifierController);
router.get('/', tokenMiddleware, homeController);
router.get('/token', tokenController);

// TODO - delete before uploading to production
// Returns signed JWT
router.get('/print', (req, res) => {
  const token = req.get("Token");
  const decoded = jwt.decode(token, {"complete": true});
  return res.json({"full_token": decoded,"header": decoded.header.alg});
});


module.exports = router;
