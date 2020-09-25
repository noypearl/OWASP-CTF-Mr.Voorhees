const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const indexRouter = require('./routes/index');
const morganLogsFormat = ":remote-addr :method :url :status :res[content-length] - :response-time ms :req[user-agent]";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// TODO - fix logging
app.use(morgan(morganLogsFormat));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);



// error route - returns error page
app.use((err, req , res, next) => {
  // TODO - replace with dynamic error page with error message
  if (err) {
    console.log('there is an error will return 404')
    return res.send(err.message);
  }
  return next()
});

module.exports = app;
