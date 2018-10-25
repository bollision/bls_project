var express = require('express');
var router = express.Router();
var usersModel = require('../model/usersModel.js');


// 首页
router.get('/', function(req, res, next) {
  console.log('返回的操作是否有进来');
  // 判断用户是否已经登录，如果登录就返回首页，否则返回 登录页面
  if (req.cookies.username) {
    // 需要将 用户登录信息，传递给页面
    res.render('index', {
      username: req.cookies.username,
      nickname: req.cookies.nickname,
      isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : ''
    });
  } else {
    // 跳转到登陆页面
    res.redirect('/login.html');
  }

});

//注册界面
router.get('/register',function(req,res){
  res.render('register.ejs');
})
//登录界面
router.get('/login.html',function(req,res){
  res.render('login');
})


//用户管理页面
router.get('/user-manager.html',function(req,res){
  if (parseInt(req.cookies.isAdmin)) {
    // 需要查询数据库
    // 从前端取得2个参数
    let page = req.query.page || 1; // 页码数
    let pageSize = req.query.pageSize || 5; // 每页显示的条数

    usersModel.getUserList({
      page: page,
      pageSize: pageSize
    }, function(err, data) {
      if (err) {
        res.render('werror', err);
      } else {
        res.render('user-manager', {
          username: req.cookies.username,
          nickname: req.cookies.nickname,
          isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
          userList: data.userList,
          totalPage: data.totalPage,
          page: data.page
        });
      }
    });
  }
})


//手机管理页面
router.get('/mobile-manager.html',function(req,res){
  if(req.cookies.username){
    res.render('mobile-manager', {
      username: req.cookies.username,
      nickname: req.cookies.nickname,
      isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
    });
  }else{
    res.redirect('/login.html')
  }
})

//品牌管理
router.get('/brand-manager.html',function(req,res){
  if(req.cookies.username){
    res.render('brand-manager', {
      username: req.cookies.username,
      nickname: req.cookies.nickname,
      isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
    });
  }else{
    res.redirect('/login.html')
  }
})


module.exports = router;
