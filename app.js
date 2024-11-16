var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// config mongoose
const mongoose = require('mongoose');
require('./models/user');
require('./models/payment');
require('./models/delivery');
require('./models/category');
require('./models/product');
require('./models/bill');
require('./models/billDetail');
require('./models/size');
require('./models/productSize');
require('./models/cart');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var categoriesRouter = require('./routes/categories');
var productsRouter = require('./routes/products');
// var sizesRouter = require('./routes/sizes');

var app = express();

// cấu hình swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./utils/config-swagger');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//connect database
mongoose.connect('mongodb+srv://tientqps27928:tqtienps27928@and103.mora3.mongodb.net/assignment')
// mongoose.connect('mongodb://localhost:27017/assignment')
  .then(() => console.log('>>>>>>>>>> DB Connected!!!!!!'))
  .catch(err => console.log('>>>>>>>>> DB Error: ', err));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/products', productsRouter);
// app.use('/sizes', sizesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
