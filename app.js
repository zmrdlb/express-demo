var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//for parsing multipart/form-data，处理文件上传非常有用
//https://www.npmjs.com/package/multer
//var multer = require('multer');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var subapp = express();

//识别环境
if(process.argv.length >=3 && process.argv[2] == '--dev'){
    app.set('env','development');
}else{
    app.set('env','production');
}
console.log(app.get('env'));

//subapp setting

//当运行npm run start时，执行了app.use('/subapp', subapp);
//触发此事件 - 已挂载
subapp.on('mount',function (parent){
    console.log(parent === app);
});
subapp.get('/', function(req, res){
    res.send('subapp index home');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
//app.use(multer().array()); // for parsing multipart/form-data
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/subapp', subapp);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

//设置app.locals
app.locals._author = 'zmrdlb';

module.exports = app;
