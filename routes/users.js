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
  if (!/^[a-zA-Z0-9_-]{4,10}$/.test(req.body.username)) {
    res.render('werror', { code: -1, msg: '用户名必须是4-10位' });
    return;
  }

  if (!/^\w{6,12}$/.test(req.body.password)) {
    res.render('werror', { code: -1, msg: '密码必须是6-12位，包含数字字母下划线' });
    return;
  }

  if (!/^[\u4e00-\u9fa5_a-zA-Z]{3,7}$/.test(req.body.nickname)) {
    res.render('werror', { code: -1, msg: '昵称必须是3-7位字符' });
    return;
  }

  if (!/^1(3|4|5|7|8)\d{9}$/.test(req.body.phone)) {
    res.render('werror', { code: -1, msg: '手机号不合法' });
    return;
  }

  usersModel.add(req.body, function(err) {
    if (err) {
      // 如果有错误，直接将错误信息渲染到页面
      res.render('werror', err);
    } else {
      // 注册成功
      console.log(req.body);
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

//退出登录
router.get('/logout', function(req, res) {
  // 清除cookie
  res.clearCookie('username');
  res.clearCookie('nickname');
  res.clearCookie('isAdmin');
  // 跳转 登录页
  res.redirect('/login.html');
})

//删除操作
router.get('/delete',function(req,res){
  var page = req.query.page || 1;
  var pageSize = req.query.pageSize || 5;
  var nicknameUrl = req.query.nickname || '';
  console.log('++++++++++++++++++++++');
  usersModel.delete({
    page:page,
    pageSize:pageSize,
    _id:req.query._id
  },function(err,data){
    if(err){
      res.render('bug',err);
    }else{
      res.redirect('/user-manager.html?page='+page);
    }
  })
})


//修改操作
router.post('/update',function(req,res){
  var page = req.body.page || 1;
  var pageSize = req.body.pageSize || 5;
  var nicknameUrl = req.body.nickname || '';
  usersModel.update({
    page:page,
    pageSize:pageSize,
    nickname:req.body.nickname,
    phone:req.body.phone,
    sex:req.body.sex,
    age:req.body.age,
    _id:req.body._id,
    isAdmin:req.body.isAdmin
  },function(err,data){
    if(err){
      res.render('bug',err);
    }else{
      res.render('user-manager',{
        username:req.cookies.username,
        nickname:req.cookies.nickname,
        isAdmin:parseInt(req.cookies.isAdmin) ? '(管理员)' : '(普通用户)',
        userList:data.userList,
        page:data.page,
        totalPage:data.totalPage,
        nicknameUrl:nicknameUrl
      })
    }
  })
})

//搜索的处理
router.post('/search',function(req,res){
  var page = req.body.page || 1;
  var pageSize = req.body.pageSize || 5;
  console.log(req.body.nickname);
  let nickname = new RegExp(req.body.nickname);
  var nicknameUrl = req.body.nickname;
  if(nicknameUrl == ''){
    res.redirect('/user-manager.html');
  }else{
    usersModel.SearchList({
      page:page,
      pageSize:pageSize,
      nickname:nickname
    },function(err,data){
      if(err){
        res.render('bug',err);
      }else{
        res.render('user-manager',{
          username:req.cookies.username,
          nickname:req.cookies.nickname,
          isAdmin:parseInt(req.cookies.isAdmin) ? '(管理员)' : '(普通用户)',
          userList:data.userList,
          page:data.page,
          totalPage:data.totalPage,
          nicknameUrl:nicknameUrl
        })
      }
    })
  }
})


module.exports = router;
