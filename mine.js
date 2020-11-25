//  0X表示未被翻开    1X表示已被翻开
//  X=9表示雷   0~8表示附近雷数 
// playing 正在玩
// success 成功结束
//fail 失败




var a = new Array(75 * 75);
var dx = [-1, 0, 1, 0];
var dy = [0, 1, 0, -1];
var qu = new Array(75 * 75);

exports.newMap = function (X, Y, L) {
    //根据行数、列数和雷数生成一个新的地图，
    //返回一个状态图，存在数据库里
    let length = X * Y;
    for (let i = 0; i < length; ++i) {
        a[i] = i;
    }
    let index = -1;
    const lastIndex = length - 1;
    while (++index < length) {
        const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
        const value = a[rand];
        a[rand] = a[index];
        a[index] = value;
    }
    let status = new Array(length);

    for (let i = 0; i < length; ++i) {
        status[i] = 0;
    }
    for (let i = 0; i < L; ++i) {
        status[a[i]] = 9;
    }
    for (let i = 0; i < L; ++i) {
        let x, y;
        x = i / Y;
        y = i % Y;
        for (let j = 0; j < 4; ++j) {
            let xx = x + dx[i];
            let yy = y + dy[i];
            if (0 <= xx && xx < X && 0 <= yy && yy < Y) {
                if (status[xx * Y + yy] != 9) {
                    status[xx * Y + yy]++;
                }
            }
        }
    }
    let res;
    res.result = "playing";//已成功，已失败
    res.status = status;
    return JSON.stringify(res);
}



//前端0~8表示已被翻的这个地方的数字 9表示雷
//-1表示未被翻开
// playing 正在玩  // success 成功结束  //fail 失败

exports.toUserMap = function (a, X, Y) {
    //将服务器中存储的状态图转换为前端可以看的图
    let b = new Array(X * Y);
    for (let i = 0; i < X * Y; ++i) {
        if (a.status == 'playing') {
            if (a.map[i] >= 10) {
                b[i] = a.map[i] % 10;
            } else {
                b[i] = -1;
            }
        } else {
            b[i] = a.map[i] % 10;
        }
    }
    let res;
    res.status = a.status;
    res.map = b;
    return res;
}

exports.click = function (a, x, y, X, Y) {
    if (a.map[x * Y + y] == 9) {
        a.status = 'fail';
        for (let i = 0; i < X * Y; ++i) {
            if (a.map[i] >= 10) {
                a.map[i] -= 10;
            }
        }
        return;
    }

    let head, tail;
    head = 0;
    qu[tail++] = x * Y + y;
    a.map[x * Y + y];

    while (head < tail) {
        let front = qu[head];
        ++head;
        for (let i = 0; i < 4; ++i) {
            let xx = front / Y + dx[i];
            let yy = front % Y + dy[i];
            if (0 <= xx && xx < X && 0 <= yy && yy < Y && a.map[xx * Y + yy] < 9) {
                //   <9未被翻开且没有雷
                a.map[xx * Y + yy] += 10;
                qu[tail++] = xx * Y + yy;
            }
        }
    }
    return;
}