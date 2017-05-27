var express = require('express');
var cookieSession = require('cookie-session')
var router = express.Router();

/**
 * cookie会话中间件。该中间件将给req添加session属性，代表当前加载的会话。
 * 如果req.session改变（注意必须有值），则默认会发送一个set-cookie头部到response。
 *
 */
router.use(cookieSession({
  //设置的cookie名字，默认是session
  name: 'session',
  //用户sign和verify cookie值的键值列表。sign用keys[0]，剩下的其他key用于verify
  keys: ['key1','key2'],
  //如果keys没有提供，则配置secret作为单独键值
  // secret: '',

  // Cookie Options
  // 24 hours 毫秒为单位
  maxAge: 2 * 60 * 1000
  //过期时间，一个Date对象
  // expires: new Date("2018-12-01 00:00:00"),
  // //cookie路径，default: '/'
  // path: '/',
  // //cookie域，没有默认值
  // domain: '',
  // //{Boolean|String} default:false 指示cookie是否是 a "same site" cookie。
  // //可设置的值有：false | true(等同于strict) | 'strict' | 'lax'
  // sameSite: false,
  // //指示cookie是否只能通过https发送。default: false
  // //false: http; true: https
  // secure: false,
  // //指示cookie是否只能通过http或https发送，而不是通过客户端javascript ( and not made available to client JavaScript)
  // //default: true
  // httpOnly: true,
  // //指示cookie是否要签名。default: true
  // signed: true,
  // //指示是否要覆盖同名之前设置过的cookie. default: true
  // overwrite: true
}));

//除了 /login 其他都要验证用户信息，没有用户信息就重定向到登录页面
router.get('*',function(req, res, next){
    console.log('/users下挂载请求路径',req.path);
    if(req.path == '/login'){
        next();
    }else{
        if(req.session.user){ //用户信息存在
            next();
        }else{ //用户信息不存在
            res.redirect('/users/login');
        }
    }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
    // console.log(req.cookies.name); 可以打印出客户端传递过来的cookie, 键值为name的值
    res.send('当前用户信息'+JSON.stringify(req.session.user));
});

//登录页
router.get('/login', function(req, res, next){
    res.render('login', {title: '登录'})
});

//登录接口
router.post('/login', function(req, res, next){
    //设置Content-Type: application/json
    res.type('json');

    var username = req.body.username,
        password = req.body.password;

    //想设置一下业务错误的状态码，发现状态码会影响客户端对数据的解析。暂时发现206能用
    if(!username){
        res.status(206).json({
            code: 'A0003',
            errmsg: '用户名不能为空'
        });
    }else if(!password){
        res.status(206).json({
            code: 'A0004',
            errmsg: '密码不能为空'
        });
    }else{
        req.session.user = {
            username: username,
            password: password
        };
        res.json({
            code: 'A0001',
            errmsg: 'success',
            data: req.session.user
        });
    }
});

module.exports = router;
