const express = require('express');
const homeRouter = require('./home.route');

const router = express.Router();
router.use('/', homeRouter);

module.exports = router;
