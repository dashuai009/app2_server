# app2_server

## mine.js

处理地图，包括
- 生成一张地图
- 将地图转化为用户可见的数据

## server.js

### 数据库查询

```js
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
```

### express框架

使用了nodejs的express框架

- signup 注册
- login 登录
- startGame 开始游戏
- clickHere 点击某个格子
