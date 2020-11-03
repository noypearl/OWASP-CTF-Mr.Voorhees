const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const indexRouter = require('./routes');

const publicRoute = path.join(__dirname, '..', '/public');
const backupRoute = path.join(__dirname, '..', '/backup');

const {
  loggerMiddleware, notFoundMiddleware, onErrorMiddleware, robotsMiddleware,
} = require('./middlewares/middlewares');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(loggerMiddleware);
app.use('/robots.txt', robotsMiddleware);
app.use('/public', express.static(publicRoute));
app.use('/backup', express.static(backupRoute));
app.use(favicon(path.join(publicRoute, 'favicon.ico')));
app.use('/', indexRouter);

// error 404 and unsupported methods middleware - return static error page
app.use(notFoundMiddleware);

// error route - returns error page
app.use(onErrorMiddleware);

module.exports = app;
