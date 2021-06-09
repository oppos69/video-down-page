var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var settings = require('./config/settings');
var session = require('express-session');
var flash = require('connect-flash/lib');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('express-art-template'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: settings.cookieSecret,
    key: settings.cookieSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 1000*60*60*24*30}
}));
app.use(function(req, res, next){
    res.locals.session = req.session;
    app.locals.moment = require('moment/moment');//时间格式化
    app.locals.moment.locale('zh-cn');
    next();
});

app.use(flash());
app.use(function(req, res, next){
    res.locals.errors = req.flash('error');
    res.locals.infos = req.flash('info');
    res.locals.success = req.flash('success');
    next();
});

app.use(function(req,res,next) {
    // let domain = req.headers['referer'].match(/^(\w+:\/\/)?([^\/]+)/i);
    // res.header("X-Frame-Options", "ALLOW-FROM https://example.com/");
    next();
});

app.use('/', require('./routes'));
app.use('/down', require('./routes/down'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    let url = '/' + req.url.substr(1).replace('/','');
    if (404 === err.status) {
        // res.writeHead(302, {'Location': url});
        res.end();
    }
    else {
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    }
});

module.exports = app;
