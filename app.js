var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let handlebars = require('handlebars')

const hbs = require('express-handlebars');
const session=require('express-session');
const nocache = require('nocache');
// const fileUpload=require('express-fileupload')




var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

const db=require('./config/connection')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

///////setting user layout has default layout 
app.engine('hbs', hbs.engine({ helpers:{inc:(value)=>{return parseInt(value)+1;}}, extname: 'hbs', layoutsDir: __dirname + '/views/layouts/',userDir:__dirname+'/views/user',adminDir:__dirname+'/views/admin', partialsDir: __dirname + '/views/partials/' }));


handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {
  var operators = {
    'eq': function (l, r) { return l == r; },
    'noteq': function (l, r) { return l != r; },
    'gt': function (l, r) { return Number(l) > Number(r); },
    'or': function (l, r) { return l || r; },
    'and': function (l, r) { return l && r; },
    '%': function (l, r) { return (l % r) === 0; }
  }
    , result = operators[operator](operand_1, operand_2);

  if (result) return options.fn(this);
  else return options.inverse(this);
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(nocache())
// app.use(fileUpload())

///session settings

app.use(session({
  secret: "prince",
  saveUninitialized:true,
  cookie: { maxAge: 600000000 },
  resave: false 
}));


////db connection

db.connect((err)=>{
  if(err)
  console.log("databse not connected" +err);
  else
  console.log("database connected succesfully");
})

/////////routes

app.use('/', userRouter);
app.use('/admin', adminRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('errorPage',{layout:'user-layout'})
  // next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{layout:'user-layout'});
});

module.exports = app;
