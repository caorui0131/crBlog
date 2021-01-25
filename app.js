var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('./config')

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var mobileRouter = require('./routes/mobile');
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

app.use('/',async function(req, res, next) {
  var isMobileOrPC = getMachine(req);
  res.locals.isMobileOrPC=isMobileOrPC;
  console.log('isMobileOrPC:',isMobileOrPC)
  next();
})
app.use(function(req,res,next){
  var userName=req.cookies.name;
  var port = req.app.settings.port || cfg.port;
  var protocol=req.protocol;
  var hostname=req.hostname;
  var path=req.path;
  // console.log('22222223:',req.protocol + '://' + req.hostname  + ( port == 80 || port == 443 ? '' : ':'+port ) + req.path);
  // 在本次会话创建一个全局变量
  res.locals.currentUserName=userName;
  res.locals.protocol=protocol;
  res.locals.hostname=hostname;
  res.locals.path=path;
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
app.use('/mobile', mobileRouter);
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

// 判断页面是在移动端还是PC端打开的
function getMachine(req) {
  var deviceAgent = req.headers["user-agent"].toLowerCase();
  var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
  if (agentID) {
    return "Mobile";
  } else {
    return "PC";
  }
}
module.exports = app;
