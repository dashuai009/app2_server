//  0X表示未被翻开    1X表示已被翻开
//  X=9表示雷   0~8表示附近雷数 
// playing 正在玩
// success 成功结束
//fail 失败




var a = new Array(75 * 75);
var dx = [-1, 0, 1, 0, -1, -1, 1, 1];
var dy = [0, 1, 0, -1, -1, 1, 1, -1];
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
    let status = new Array(0);

    for (let i = 0; i < length; ++i) {
        status.push(0);
    }
    for (let i = 0; i < L; ++i) {
        status[a[i]] = 9;
        console.log(a[i]);
    }
    console.log('adfad', status);
    for (let i = 0; i < L; ++i) {
        let x, y;
        x = Math.floor((a[i] + 0.1) / Y);
        y = a[i] % Y;
        console.log('x=', x, 'y=', y);
        for (let j = 0; j < 8; ++j) {
            let xx = x + dx[j];
            let yy = y + dy[j];
            if (0 <= xx && xx < X && 0 <= yy && yy < Y) {
                if (status[xx * Y + yy] != 9) {
                    status[xx * Y + yy]++;
                }
            }
        }
    }
    let res = {
        result: "playing",//已成功，已失败
        map: status
    };
    console.log('新建棋局状态：', res)
    return res;
}



//前端0~8表示已被翻的这个地方的数字 9表示雷
//-1表示未被翻开
// playing 正在玩  // success 成功结束  //fail 失败

exports.toUserMap = function (serverA, X, Y) {
    console.log('toUserMAp before:', serverA);
    //将服务器中存储的状态图转换为前端可以看的图
    console.log(X, Y);
    var userA = new Array(X * Y);
    for (let i = 0; i < X * Y; ++i) {
        if (serverA.result == 'playing') {
            if ((serverA.map)[i] >= 10) {
                userA[i] = serverA.map[i] % 10;
            } else {
                userA[i] = -1;
            }
        } else {
            userA[i] = (serverA.map)[i] % 10;
        }
    }
    let res = {
        result: serverA.result,
        map: userA
    }
    console.log('toUserMAp after:', res);
    return res;
}


//地图形式为服务器存储的形式
exports.click = function (a, x, y, X, Y, L) {
    if (a.map[x * Y + y] == 9) {
        a.result = 'fail';
        for (let i = 0; i < X * Y; ++i) {
            if (a.map[i] < 10) {
                a.map[i] += 10;
            }
        }
        return;
    }

    let head, tail;
    head = 0;
    tail = 0;
    qu[tail] = x * Y + y;
    tail += 1;
    a.map[x * Y + y] += 10;

    while (head < tail) {
        let front = qu[head];
        ++head;
        if (a.map[front] == 10)
            for (let i = 0; i < 8; ++i) {
                let xx = Math.floor((front + 0.1) / Y) + dx[i];
                let yy = front % Y + dy[i];
                if (0 <= xx && xx < X && 0 <= yy && yy < Y && a.map[xx * Y + yy] < 9) {
                    //   <9未被翻开且没有雷
                    a.map[xx * Y + yy] += 10;
                    qu[tail++] = xx * Y + yy;
                }
            }
    }
    let cnt = 0;
    for (let i = 0; i < X * Y; ++i) {
        if (a.map[i] < 10) {
            ++cnt;
        }
    }
    if (cnt == L) {
        a.result = 'success';
        for (let i = 0; i < X * Y; ++i)
            if (a.map[i] < 9) {
                a.map[i] += 10;
            }
    }
    console.log('cnt=',cnt)
    return;
}
