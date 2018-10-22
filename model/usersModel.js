const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';

const async = require('async');

const usersModel = {
    add(data,cb) {
        MongoClient.connect(url,function(err,client){
            if (err) {
                console.log('链接数据库失败',err);
                cb({ code:-100,msg:'链接数据库失败'});
                return;
            };
            const db = client.db('bao');

            let saveData = {
                username:data.username,
                password:data.password,
                nickname:data.nickname,
                phone:data.phone,
                is_admin:data.is_admin
            };


            //async
            async.series([
                function(callback){
                    //查询是否已经注册
                    db.collection('users').find({username: saveData.username}).count(function(err,num){
                        if (err) {
                            callback({ code: -101, msg: '查询是否已注册失败' });
                        } else if (num !== 0) {
                            console.log('用户已经注册过了');
                            callback({ code: -102, msg: '用户已经注册过了'});
                        } else {
                            console.log('当前用户可以注册');
                            callback(null);
                        }
                    })
                },

                function (callback) {
                    // 查询表的所有记录条数
                    db.collection('users').find().count(function(err, num) {
                      if (err) {
                        callback({ code: -101, msg: '查询表的所有记录条数失败'});
                      } else {
                        saveData._id = num + 1;
                        callback(null);
                      }
                    })
                  },

                function (callback) {
                    // 写入数据库的操作
                    db.collection('users').insertOne(saveData, function(err) {
                      if (err) {
                        callback({ code: -101, msg: '写入数据库失败'});
                      } else {
                        callback(null);
                      }
                    })
                }
            ],function(err, results){
                // 不管上面3个异步操作是否都成功，都会进入到这个最终的回调里面
                if (err) {
                  console.log('上面的3步操作，可能出了问题', err);
                  // 还得告诉前端页面
                  cb(err);
                } else {
                  cb(null);
                }
        
                client.close();
            })


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
    }
}
module.exports = usersModel;