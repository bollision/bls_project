var express = require('express');
var router = express.Router();
const usersModel = require('../model/usersModel.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//注册管理
router.post('/register',function (req,res){
  //1.用户名必须是5-10个字符
  if (!/^\w{5,10}$/.test(req.body.username)) {
    res.render('werror', { code: -1, msg: '用户名必须是5-10位' });
    return;
  }

  usersModel.add(req.body, function(err) {
    if (err) {
      // 如果有错误，直接将错误信息渲染到页面
      res.render('werror', err);
    } else {
      // 注册成功

      res.redirect('/login.html');
    }
  });
})

//登录管理
router.post('/login',function(req,res){
  //调用login方法
  usersModel.login(req.body,function(err,data){
    if(err){
      res.render('werror',err);
    } else {
      //跳到首页
      console.log('当前登录用户信息是',data);
      //写cookie
      res.cookie('username', data.username, {
        maxAge: 1000 * 60 * 1000000, // 单位是毫秒，
      })

      res.cookie('nickname', data.nickname, {
        maxAge: 1000 * 60 * 1000000, // 单位是毫秒，
      })

      res.cookie('isAdmin', data.isAdmin, {
        maxAge: 1000 * 60 * 1000000, // 单位是毫秒，
      })

      res.redirect('/');
    }
  })
})











module.exports = router;
