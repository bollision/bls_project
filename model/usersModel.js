const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';

const async = require('async');

const usersModel = {
    add(data,cb){
        MongoClient.connect(url,function(err,client){
            // if(err) throw err;
            if (err) {
                console.log('连接数据库失败',err);
                cb({code: -100, msg: '连接数据库失败'});
                return;
            }
            const db = client.db('bao');
            //1.把data里的isAdmin修改为is_admin
            //2.写一个_id，默认充1开始
            //3.下一个人注册,得先得到之前的用户表的记录条数,条数+1写给下一个注册的_id
            //4.相同用户名的不允许注册成功

            var savedata = {
                username:data.username,
                password:data.password,
                nickname:data.nickname,
                phone:data.phone,
                is_admin:data.isAdmin
            };
            // console.log(savedata);
            let phoneNum = 0;
            async.series([
                //查询是否已经注册
                function(callback){
                    db.collection('users').find({username:savedata.username}).count(function(err,num){
                        if(err){
                            callback({code:-101,msg:'查询是否已经注册失败'});
                        }else if(num != 0){
                            console.log('该用户名已经注册过了');
                            callback({code:-102,msg:'该用户名已经注册过了'});
                        }else{
                            console.log('当前用户可以注册');
                            callback(null);
                        }
                    })
                },
                //查询users表的所有记录条数
                function(callback){
                    db.collection('users').find().count(function(err,num){
                        if(err){
                            callback({code:-101,msg:'查询users表的记录条数失败'});
                        }else if(num <= 0){
                            savedata._id = 1;
                            callback(null);
                        }else{
                            console.log('查询成功');
                            phoneNum = num;
                            callback(null,num);
                        }
                    })
                },
                 //取到最后一条数据，拿到最后一条数据的_id,根据这个_id让这个_id+1
                 function(callback){
                    // console.log(num);
                    // console.log(typeof Num);
                    if(phoneNum <= 0){
                        savedata._id = 1;
                        callback(null);
                    }else{
                        db.collection('users').find().skip(phoneNum-1).toArray(function(err,data){
                            if (err) {
                                callback({code: -101,msg: '查询最后一条数据失败'});
                            }else {
                                //console.log(savedata);
                                savedata._id= data[0]._id +1;
                                callback(null);
                            }
                        })
                    }
                },
                
                //写入数据库的操作
                function(callback){
                    db.collection('users').insertOne(savedata,function(err){
                        if(err){
                            callback({code:-101,msg:'写入数据库失败'});
                        }else{
                            callback(null);
                        }
                    })
                }
            ],function(err,results){
                if(err){
                    console.log('上面的三步操作可能出了问题',data);
                    cb(err);
                }else{
                    cb(null);
                }
                client.close();
            });
        })
    },

  //登录
  login (data, cb) {
      MongoClient.connect(url, function(err, client) {
        if (err) {
          cb({code: -100, msg: '数据库连接失败'});
        } else {
          const db = client.db('bao');
  
          db.collection('users').find({
            username: data.username,
            password: data.password
          }).toArray(function(err, data) {
            if (err) {
              console.log('查询数据库失败', err);
              cb({code: -101, msg: err});
              client.close();
            } else if (data.length <= 0) {
              // 没有找到，用户不能登录
              console.log('用户不能登录');
              cb({code: -102, msg: '用户名或密码错误'});
            } else {
              console.log('用户可以登录');
              // 这里需要将 用户名，昵称、与是否是管理员这两个字段告诉给前端
              cb(null, {
                username: data[0].username,
                nickname: data[0].nickname,
                isAdmin: data[0].is_admin
              });
            }
            client.close();
          })
        }
      })
  },

  getUserList(data, cb) {
    MongoClient.connect(url, function(err, client) {
      if (err) {
        cb({code: -100, msg: '链接数据库失败'});
      } else {
        var db = client.db('bao');
        var limitNum = parseInt(data.pageSize);
        var skipNum = data.page * data.pageSize - data.pageSize;

        async.parallel([
          function (callback) {
            // 查询所有记录
            db.collection('users').find().count(function(err, num) {
              if (err) {
                callback({code: -101, msg: '查询数据库失败'});
              } else {
                callback(null, num);
              }
            })
          },

          function (callback) {
            // 查询分页的数据
            db.collection('users').find().limit(limitNum).skip(skipNum).toArray(function(err, data) {
              if (err) {
                callback({code: -101, msg: '查询数据库失败'});
              } else {
                callback(null, data);
              }
            })
          }
        ], function(err, results) {
          if (err) {
            cb(err);
          } else {
            cb(null, {
              totalPage: Math.ceil(results[0] / data.pageSize),
              userList: results[1],
              page: data.page,
            })
          }
          // 关闭连接
          client.close();
        })
      }
    })
  },

  //删除
  delete(data,cb){
    // console.log(data);
    MongoClient.connect(url,function(err,client){
        if(err){
            cb({code:-101,msg:'数据库连接失败'});
        }else{
            const db = client.db('bao');
            const limitNum = parseInt(data.pageSize);
            const skipNum = data.page * data.pageSize - data.pageSize;
            async.series([
                //删除数据
                function(callback){
                    db.collection('users').deleteOne({'_id':parseInt(data._id)},function(err){
                        if(err){
                            callback({code:-101,msg:'删除失败'});
                        }else{
                            // console.log('删除失败');
                            callback(null);
                        }
                    })
                },
                //查询记录的条数
                function(callback){
                    db.collection('users').find().count(function(err,num){
                        if(err){
                            callback({code:-101,msg:'查询记录条数失败'});
                        }else{
                            callback(null,num);
                        }
                    })
                },
                //查询分页的数据
                function(callback){
                    db.collection('users').find().limit(limitNum).skip(skipNum).toArray(function(err,data){
                        if(err){
                            callback({code:-101,msg:'查询分页数据失败'})
                        }else{
                            callback(null,data);
                        }
                    })
                }
            ],function(err,result){
                if(err){
                    cb(err);
                }else{
                    cb(null,{
                        totalPage:Math.ceil(result[1]-data.pageSize),
                        userList:result[2],
                        page:data.page
                    })
                    // console.log(result);
                }
                client.close();
            })
        }
    })
  },

  //修改
  update(data,cb){
    // console.log(data);
    MongoClient.connect(url,function(err,client){
        if(err){
            // console.log('数据库连接失败');
            cd({code:-100,msg:'数据库连接失败'});
        }else{
            const db = client.db('bao');
            let updateData = {
                // password:data.password,
                nickname:data.nickname,
                phone:data.phone,
                sex:data.sex,
                is_admin:data.isAdmin,
                age:data.age
            };
            const limitNum = parseInt(data.pageSize);
            const skipNum = data.page * data.pageSize - data.pageSize;
            async.series([
                function(callback){
                    console.log(callback);
                    db.collection('users').update({'_id':parseInt(data._id)},{$set:{
                        // password:data.password,
                        nickname:data.nickname,
                        phone:data.phone,
                        sex:data.sex,
                        is_admin:data.isAdmin,
                        age:data.age
                    }},function(err){
                        if(err){
                            callback({code:-101,msg:'修改数据失败'});
                        }else{
                            callback(null);
                        }
                    })
                },function(callback){
                    //查询记录的条数
                    db.collection('users').find().count(function(err,num){
                        if(err){
                            callback({code:-101,msg:'查询记录条数失败'});
                        }else{
                            callback(null,num);
                        }
                    })
                },function(callback){
                    //查询分页的数据
                    db.collection('users').find().limit(limitNum).skip(skipNum).toArray(function(err,data){
                        if(err){
                            callback({code:-101,msg:'查询分页数据失败'});
                        }else{
                            callback(null,data);
                        }
                    })
                }
            ],function(err,result){
                if(err){
                    cb(err);
                }else{
                    cb(null,{
                        totalPage:Math.ceil(result[1]/data.pageSize),
                        userList:result[2],
                        page:data.page
                    });
                    // console.log(result);
                }
                client.close();
            })
        }
    })
  },

  //搜索
  SearchList(data,cb){
    console.log(data);
    MongoClient.connect(url,function(err,client){
        if(err){
            console.log('连接数据库失败');
            cb({code:-1,msg:'连接数据库失败'});
        }else{
            const db = client.db('bao');
            const limitNum = parseInt(data.pageSize);
            const skipNum = data.page * data.pageSize - data.pageSize;
            async.parallel([//并行无关联
                function(callback){
                    db.collection('users').find({nickname:data.nickname}).count(function(err,num){
                        if(err){
                            callback({code:-101,msg:'查询失败'});
                        }else{
                            callback(null,num);
                        }
                    })
                },function(callback){
                    //查询所有符合模糊匹配的数据
                    db.collection('users').find({nickname:data.nickname}).limit(limitNum).skip(skipNum).toArray(function(err,data){
                        if(err){
                            console.log('搜索模糊匹配失败');
                            callback({code:-101,msg:'搜索模糊匹配失败'});
                        }else{
                            callback(null,data);
                        }
                    })
                }  
            ],function(err,result){
                if(err){
                    cb(err);
                }else(
                    cb(null,{
                        totalPage:Math.ceil(result[0]/data.pageSize),
                        userList:result[1],
                        page:data.page
                    })
                )
            })
        }
    })
  }
}



module.exports = usersModel;