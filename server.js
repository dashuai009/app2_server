var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var dataBase=require('./dataBase.js');

// 创建 application/x-www-form-urlencoded 编码解析
//var urlencodedParser = bodyParser.urlencoded({ extended: false })


 //设置跨域访问
app.all("*",function(req,res,next){
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin","*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers","content-type");
    //跨域允许的请求方式 
    res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.sendStatus(200);  //让options尝试请求快速结束
    else
        next();
})

app.use('/public', express.static('public'));
 
app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})
 
app.get('/process_get', function (req, res) {
 
   // 输出 JSON 格式
   var response = {
       "status":'fail',
       "msg":'User exists!'
   };
   console.log(response);
   res.end(JSON.stringify(response));
})
 
app.post('/login',function(req,res){

    //console.log(req);

    var response = {
        "status":'fail',
        "msg":'User exists!'
    };
    console.log(response);
    console.log(req.path);
    res.end(JSON.stringify(response));
})

app.post('/signup',function(req,res){
    dataBase.newUser(req.body.userName,req.body.pwdHash);

    var response = {
        "status":'fail',
        "msg":'User exists!'
    };
    console.log(response);
    console.log(req.path);
    res.end(JSON.stringify(response));

})
var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})