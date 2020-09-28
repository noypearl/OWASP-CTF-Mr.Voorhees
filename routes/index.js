const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const tokenController = require('../controllers/token');
const homeController = require('../controllers/home');
const { tokenValidationMiddleware, tokenVerifierMiddleware } = require('../middlewares');
// TODO - the middlewares work
// App routes
router.get('/', [tokenValidationMiddleware,tokenVerifierMiddleware],homeController);


module.exports = router;
