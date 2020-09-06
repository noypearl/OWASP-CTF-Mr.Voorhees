const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./helpers/logger');
const indexRouter = require('./routes/index');

const app = express();

app.use((req, res, next) => {
  logger.info(`${req.method} for ${req.path}. Cookies: ${req.cookies}`)
  next();
})

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

app.get('*', (req, res) => {
  logger.info('returning error page');
  res.sendFile(path.join(__dirname , 'public', 'error.html'));
});

module.exports = app;