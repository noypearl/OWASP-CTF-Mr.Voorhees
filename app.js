const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const indexRouter = require('./routes/index');
const logger = require('./helpers/logger');
const morganLogsFormat = ":remote-addr :method :url :status :res[content-length] - :response-time ms :req[user-agent]";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// TODO - fix logging
app.use(morgan(morganLogsFormat));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

// error 404 middleware - return static error page
app.use((req, res) => {
  const { method, url } = req;
    logger.warn(`Invalid ${method} request to ${url}, returning 404`);
    return res.status(404).sendFile(path.join(__dirname , 'public', '/error.html'));
});

// error route - returns error page
app.use((err, req , res, next) => {
  // TODO - replace with dynamic error page with error message
  if (err) {
    logger.error(`Error middleware in ${req.url}. Error: ${err.message}`);
    return res.send('Server error');
  }
  return next()
});

module.exports = app;
