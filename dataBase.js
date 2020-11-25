const { response } = require('express');
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
var sqlSelectCurID = 'select curMineID from user where user.name=? and user.passed=?';
//修改用户当前正在玩的游戏id
var sqlUpdateCurId = 'UPDATE table_name SET curMineID=? WHERE user.name=? and user.passed=?';

//根据id查询当前正在玩的地图
var sqlMapAndXAndY = 'select status,x,y from map where map.id=?';

var errSql = {
    status: "fail",
    msg: "查询据库失败"
}
var fuckU = {
    status: "fail",
    msg: "What are you 弄啥嘞？"
}


var sqlNewMap = 'insert into map(name,passwd,X,Y,startTime,init,status) values(?,?,?,?,?,?,?);SELECT @@IDENTITY;';
exports.newUser = function (userName0, pwdHash0) {//新建用户，初始局面为-1
    connection.connect();
    var flag = true;
    connection.query(sqlNewUser, [userName0, pwdHash0], function (err, result) {
        if (err) {
            console.log('[New user ERROR] - ', err.message);
            flag = false;
        }
    });
    connection.end();
}

exports.login = function (userName0, pwdHash0) {
    connection.connect();
    var response;
    connection.query(sqlQueryPwd, [userName0], function (err, result) {
        console.log(err);
        console.log(result);
        if (err) {
            response = {
                status: 'fail',
                msg: '数据库查询失败！'
            }
        } else {
            if (result.RowDataPacket.passwd == pwdHash0) {
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
    })
    connection.end();
    return response;
}

function newGameID(userName0, pwdHash0, X, Y, L, startStatus) {
    let res;
    connection.query(sqlNewMap, [userName0, pwdHash0, X, Y, L, new Date().getTime(), startStatus, startStatus], function (err, result) {
        if (err) {
            res = -1;
            console.log(err);
        } else {
            res = result.RowDataPacket.id;
        }
    })
    return res;
}
exports.startGame = function (userName0, pwdHash0, X, Y, L) {
    let response;
    connection.connect();
    let startStatus = oper.newMap(X, Y, L);
    console.log(startStatus);
    let newID = newGameID(userName0, pwdHash0, X, Y, L, startStatus);
    if (newID == -1) {
        response = errSql;
        console.log(err);
    } else {
        connection.query(sqlUpdateCurId, [userName0, pwdHash0], function (err, result) {
            console.log(err, result);
        });
        response = {
            status: "success",
            msg: "开始游戏~~",
            map: oper.toUserMap(startStatus, X, Y)//返回json格式，不是字符串！
        }
    }
    connection.end();
}

exports.clickHere = function (userName0, pwdHash0, x, y) {
    connection.connect();
    let response;
    let X, Y;
    connection.query(sqlSelectCurID, [userName0, pwdHash0], function (err, result) {
        if (err) {
            response = errSql;
            console.log(err);
        } else {
            id = result.RowDataPacket.curMineId;
        }
    })

    let a;
    connection.query(sqlMapAndXAndY, [id], function (err, result) {
        if (err) {
            response = errSql;
            console.log(err);
        } else {
            a = JSON.parse(result.RowDataPacket.status);
            X = result.RowDataPacket.X;
            Y = result.RowDataPacket.Y;
        }
    })
    if (a.status == 'playing' && 0 <= a.map[x * Y + y] && a.map[x * Y + y] < 10) {
        oper.click(a, x, y, X, Y);
        response = {
            status: "sucess",
            msg: oper.toUserMap(a)
        }
    } else {
        response = fuckU;
    }
    connection.end();
}
