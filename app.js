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
// TODO - fix logging - prevent static files
app.use(morgan(morganLogsFormat));
app.use(express.static(path.join(__dirname, 'public')));

// error route - returns error page
app.use('/' ,(err, req , res, next) => {
  // TODO - replace with dynamic error page with error message
    const { method, url } = req;
    logger.error(`Error middleware ${method} request to ${url}.-  error ${err.status}: ${err.message}`);
    // Return 401 error messages
    if(err.status === 401 || err.status === 400) {
      return res.status(err.status).send(err.message);
    }
    logger.info("returning Server Error generic message");
    return res.status(500).send('Server Error');
});
app.use('/', indexRouter);

// error 404 and unsupported methods middleware - return static error page
app.use((req, res) => {
  const { method, url } = req;
    logger.warn(`Invalid ${method} request to ${url}, returning 404`);
    return res.status(404).sendFile(path.join(__dirname , 'public', '/error.html'));
});



module.exports = app;
