var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123asdASD',
    database: 'mine',
    charset: 'UTF8'
});



var user = new Array();//{userName:string,pwdHash:string,id:string}
var map = {};//userName,pedHash,X,Y,status
var cnt = 0;

//新建用户，

exports.newUser = function (userName0, pwdHash0) {
    connection.connect();
    var mySquery1 = 'insert into user(name,passwd,curMineId) values(?,?,-1);';
    connection.query(mySquery1, [userName0, pwdHash0], function (err, result) {
        if (err) {
            console.log('[New user ERROR] - ', err.message);
            return false;
        }
        console(result);
    });
    connection.end();
    return true;//新建用户，初始局面为-1
}
//查找用户

exports.search = function (userName0, pwdHash0, id0) {
    for (x in user) {
        if (x.userName == userName0) {
            if (x.pwdHash == pwdHash0) {
                if (x.id == id0) {
                    return "Match";
                } else {
                    return "idError";
                }
            } else {
                return "pwdError";
            }
        }
    }
    return "noSuchUser";
}

function addMap(userName0, pwdHash0, X, Y) {
    x.id = cnt;
    ++cnt;
    X.status = [];
    for (var i = 0; i < X; ++i) {
        var col = [];
        col = [];
        for (var j = 0; j < Y; ++j) {
            col.push(3);
        }
        x.status.push(col);
    }
}
//新建雷局

exports.newMap = function (userName0, pwdHash0, X, Y) {
    for (x in user) {
        if (x.userName == userName0 && x.pwdHash == pwdHash0) {
            if (x.id == -1) {
                appMap(userName0, pwdHash0, X, Y);
            } else {
                return "aMapExist";
            }
        }
    }
    return "notMatch";
}

//对雷局进行操作

