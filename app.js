var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
// var userRouter = require('./routes/user');
// var blogRouter = require('./routes/blog');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req,res,next){
  var userName=req.cookies.name;
  // 在本次会话创建一个全局变量
  res.locals.currentUserName=userName;
  next();
})
app.use('/', indexRouter);
app.use('/admin',function(req, res, next){
  // var userName=req.cookies.name;
  // console.log("userName:",userName&&userName.length>0);
  if(res.locals.currentUserName&&res.locals.currentUserName.length>0){
    next();
    return;
  }
  var backurl=req.originalUrl;
  res.redirect("/login?backurl="+backurl);
  //res.json("没有登录信息");
})
app.use('/admin', adminRouter);
// app.use('/user', userRouter);
// app.use('/blog', blogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
