const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifierController = require('../controllers/verifier');
const errorController = require('../controllers/error');

// App routes
// router.get('/', homeController);
// router.post('/token', tokenController);
router.get('/verify', verifierController);
router.get('/error', errorController);

// Returns signed JWT
router.get('/print', (req, res) => {
  const token = req.get("Token");
  const decoded = jwt.decode(token, {"complete": true});
  return res.json({"full_token": decoded,"header": decoded.header.alg});
});

// TODO : Error page
module.exports = router