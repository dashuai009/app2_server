var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var mysql = require('mysql');
const { resourceLimits } = require('worker_threads');
var oper = require('./mine');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123asdASD',
    database: 'mine',
    charset: 'UTF8'
});




//新建用户，
var sqlNewUser = 'insert into user(name,passwd,curMineId) values(?,?,-1);';
//查询用户密码
var sqlQueryPwd = 'select passwd from user where user.name=?;';

//查询用户当前正在玩的游戏id
var sqlSelectCurID = 'select curMineID from user where user.name=? and user.passwd=?';
//修改用户当前正在玩的游戏id
var sqlUpdateCurId = 'UPDATE user SET curMineId=? WHERE user.name=? and user.passwd=?';

//根据id查询当前正在玩的地图
var sqlMapAndXAndY = 'select status,X,Y,L from map where map.id=?';

var sqlUpdateMap = 'UPDATE map SET status=? WHERE map.id=?;';

var errSql = {
    status: "fail",
    msg: "查询据库失败"
}
var fuckU = {
    status: "fail",
    msg: "What are you 弄啥嘞？"
}


var sqlNewMap = 'insert into map(name,passwd,id,X,Y,L,startTime,init,status) values(?,?,?,?,?,?,?,?,?);';



// 创建 application/x-www-form-urlencoded 编码解析
//var urlencodedParser = bodyParser.urlencoded({ extended: false })


//设置跨域访问
app.all("*", function (req, res, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers", "content-type");
    //跨域允许的请求方式 
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.sendStatus(200);  //让options尝试请求快速结束
    else
        next();
})

app.use('/public', express.static('public'));

app.get('/index.html', function (req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})



app.post('/login', function (req, res) {
    console.log('登录用户信息', req.body);
    var response;
    connection.query(sqlQueryPwd, [req.body.userName], function (err, result) {
        console.log(err);
        console.log(result);
        if (err) {
            response = errSql;
        } else {
            if (result[0].passwd == req.body.pwdHash) {
                response = {
                    status: 'success',
                    msg: 'log in successfully'
                }
            } else {
                response = {
                    status: 'fail',
                    msg: '密码错误！'
                }
            }
        }
        console.log(response);
        res.end(JSON.stringify(response));
    });
})

app.post('/signup', function (req, res) {
    console.log('注册用户发送信息', req.body);
    var response;
    //新建用户，初始局面为-1
    connection.query(sqlNewUser, [req.body.userName, req.body.pwdHash], function (err, result) {
        if (err) {
            console.log('[New user ERROR] - ', err.message);
            response = {
                status: 'fail',
                msg: 'User exists!'
            };
        } else {
            response = {
                status: 'success',
                msg: 'Create sucessfully!'
            };
        }
        console.log('响应结果', response);
        res.end(JSON.stringify(response));
    });

})



app.post('/startGame', function (req, res) {
    console.log('开始游戏的信息：', req.body);
    let userName0 = req.body.userName;
    let pwdHash0 = req.body.pwdHash;
    let X = req.body.X; let Y = req.body.Y; let L = req.body.L;
    let response;
    let startStatus = oper.newMap(X, Y, L);
    let newID = new Date().getTime() * 100;
    connection.query(
        sqlNewMap,
        [userName0, pwdHash0, newID, X, Y, L, new Date().getTime(), JSON.stringify(startStatus), JSON.stringify(startStatus)],
        function (err, result) {
            if (err) {
                console.log(err);
                response = errSql;
                res.end(JSON.stringify(response));
            } else {
                console.log('新建游戏的id', newID);
                connection.query(sqlUpdateCurId, [newID, req.body.userName, req.body.pwdHash], function (err, result) {
                    console.log(err, result);
                    if (err) {
                        response = errSql;
                    } else {
                        let tmp = oper.toUserMap(startStatus, req.body.X, req.body.Y)//返回json格式，不是字符串！
                        response = {
                            status: "success",
                            msg: tmp.result,
                            map: tmp.map
                        }
                    }
                    res.end(JSON.stringify(response));
                });
            }
        }
    )
})

app.post('/clickHere', function (req, res) {
    var response;
    let X, Y, L;
    let clickx = req.body.X;
    let clicky = req.body.Y;
    console.log('点击信息:', req.body);
    connection.query(sqlSelectCurID, [req.body.userName, req.body.pwdHash],
        function (err, result) {
            console.log('查询用户当前玩的游戏id的结果', result);
            if (err) {
                response = errSql;
                console.log(err);
                res.end(JSON.stringify(response));
            } else {//查询到用户当前玩的游戏id
                let id = result[0].curMineID;
                let a;
                console.log('查询到的id', id);
                connection.query(sqlMapAndXAndY, [id], function (err, result) {
                    if (err) {
                        response = errSql;
                        console.log(err);
                        res.end(JSON.stringify(response));
                    } else {//找到棋局
                        a = JSON.parse(result[0].status);
                        X = result[0].X;
                        Y = result[0].Y;
                        L = result[0].L;
                        console.log('数据库中的地图：', a, L);
                        console.log(a.result == 'playing', (a.map)[clickx * Y + clicky], a.map[clickx * Y + clicky] < 10)
                        if (a.result == 'playing' && 0 <= a.map[clickx * Y + clicky] && a.map[clickx * Y + clicky] < 10) {
                            oper.click(a, clickx, clicky, X, Y, L);
                            connection.query(sqlUpdateMap, [JSON.stringify(a), id]);
                            let tmp = oper.toUserMap(a, X, Y);
                            response = {
                                status: "success",
                                msg: tmp.result,
                                map: tmp.map
                            }
                        } else {
                            response = fuckU;
                        }
                        console.log(response);
                        res.end(JSON.stringify(response));
                    }
                })
            }
        }
    )
})

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})
