const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const tokenController = require('../controllers/token');
const verifierController = require('../controllers/verifier');
const homeController = require('../controllers/home');
const { tokenValidationMiddleware, tokenVerifierMiddleware } = require('../middlewares');

// App routes
router.post('/verify', tokenValidationMiddleware, verifierController);
router.get('/', [tokenValidationMiddleware, tokenVerifierMiddleware], homeController);
//TODO - make / return token if not provided instead of /token controller
router.get('/token', tokenController);


module.exports = router;
