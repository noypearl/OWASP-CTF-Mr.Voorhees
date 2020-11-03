const express = require('express');

const router = express.Router();
const homeController = require('../controllers/home');
const { tokenValidationHandler, tokenVerifierHandler } = require('../helpers/handlers');
// App routes
router.get('/', [tokenValidationHandler, tokenVerifierHandler], homeController);

module.exports = router;
