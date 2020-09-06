const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const tokenController = require('../controllers/token');
const errorController = require('../controllers/error');
const verifierController = require('../controllers/verifier');
const homeController = require('../controllers/home');

// App routes
router.post('/verify', verifierController);
router.get('/', homeController);
router.get('/token', tokenController);
router.get('/error', errorController);

// Returns signed JWT
router.get('/print', (req, res) => {
  const token = req.get("Token");
  const decoded = jwt.decode(token, {"complete": true});
  return res.json({"full_token": decoded,"header": decoded.header.alg});
});

module.exports = router;