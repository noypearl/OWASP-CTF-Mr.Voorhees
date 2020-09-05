const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const indexRouter = require('./routes/index');

const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname , 'public', 'error.html'));
});

module.exports = app;