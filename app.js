var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var todoDetail = require('./routes/todoDetail');
var users = require('./routes/users');

// mongooseを用いてMongoDBに接続する
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/todo_test');

var collectionName;

var app = express();

// ToDoスキーマを定義する
var Schema = mongoose.Schema;
var todoSchema = new Schema({
  isCheck: { type: Boolean, default: false },
  text: String,
  createdDate: { type: Date, default: Date.now },
  limitDate: Date
});
var listSchema = new Schema({
  text: String,
  limitDate: { type: Date, default: Date.now },
  num: { type: Number, default: 0 },
  checkedNum: { type: Number, default: 0 }
})
mongoose.model('Todo', todoSchema);
mongoose.model('TodoList', listSchema);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/tododetail', todoDetail);
app.use('/users', users);

app.get('/todosearch', function (req, res) {
  var TodoList = mongoose.model('TodoList');
  var name = req.query.name;
  TodoList.find({ text:name }, function (err, lists) {
    res.send(lists);
  });
});

// /todolistにGETアクセスして，Todoリスト一覧を取得
app.get('/todolist', function (req, res) {
  var TodoList = mongoose.model('TodoList');
  TodoList.find({}, function (err, lists) {
    res.send(lists);
  });
});

// todolistにPOSTアクセスしたとき、ToDoを追加するAPI
app.post('/todolist', function (req, res) {
  var name = req.body.name;
  // ToDoの名前と期限のパラーメタがあればMongoDBに保存
  if (name) {
    var TodoList = mongoose.model('TodoList');
    var todolist = new TodoList();
    console.log(name);
    todolist.text = name;
    todolist.save();

    res.send(true);
  } else {
    res.send(false);
  }
});

app.get('/todoName', function (req, res) {
  res.send(collectionName);
});

app.post('/todoName', function (req, res) {
  collectionName = req.body.name;
});

app.get('/detail', function (req, res) {
  console.log(collectionName);
  var Todo = mongoose.model(collectionName, todoSchema);
  // すべてのToDoを取得して送る
  Todo.find({}, function (err, todos) {
    res.send(todos);
  });
});

// // /todoにGETアクセスしたとき、ToDo一覧を取得するAPI
// app.get('/todo', function (req, res) {
//   var Todo = mongoose.model('Todo');
//   // すべてのToDoを取得して送る
//   Todo.find({}, function (err, todos) {
//     res.send(todos);
//   });
// });

// todoにPOSTアクセスしたとき、ToDoを追加するAPI
app.post('/detail', function (req, res) {
  var name = req.body.name;
  var limit = req.body.limit;
  console.log(req.body.target);
  // ToDoの名前と期限のパラーメタがあればMongoDBに保存
  if (name && limit) {
    var Todo = mongoose.model(collectionName, todoSchema);
    var todo = new Todo();
    todo.text = name;
    todo.limitDate = limit;
    todo.save();

    res.send(true);
  } else {
    res.send(false);
  }
});

module.exports = app;

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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