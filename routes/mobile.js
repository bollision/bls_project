var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
    dest: 'D:/temp'
})
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017 ";
var fs =require('fs');
var path = require('path');
var async = require('async');


router.get('/list',function(req,res) {
    console.log('111111111111111111111111111111')
    var page = parseInt(req.query.page);
    var pageSize = parseInt(req.query.pageSize);
    console.log(page, pageSize)
    var totalPage = 0;//总页数


    MongoClient.connect(url,function(err,client) {
        if (err) {
            console.log('数据库连接失败');
            res.send({ code:-1,msg:"获取列表失败"});
        } else {

            var db = client.db('bao');

            async.parallel([
                function(callback){
                    db.collection('phone').find().count(function(err,num){
                        if (err) {
                            callback({ code: -1,msg:'查询失败'})
                        } else{
                            totalPage = Math.ceil(num / pageSize);
                            console.log(totalPage);
                            callback(null);
                        }
                    })
                },

                function(callback){
                    //分页
                    db.collection('phone').find().limit(pageSize).skip(page*pageSize-pageSize).toArray(function(err,array){
                        if (err) {
                            callback({ code: -1,msg:'查询失败'})
                        } else{
                        callback(null,array);
                        console.log(array);
                        }
                    })

                }
            ],function(err,results){
                if (err) {
                    res.send(err)
                } else{
                    console.log(222222222222222222222);
                res.send({ code: 0, msg: '查询成功', data: {
                    list: results[1],
                    totalPage:totalPage
                }})
                }
                
                client.close();
            })   
        }
    })

})


router.post('/add',upload.single('phoneImg'),function(req,res){

    fs.readFile(req.file.path,function(err,filedata){
        if(err){
            console.log('读取文件失败');
            res.send({colde: -1,msg:'新增手机失败'});
        } else{
            var fileName = new Date().getTime()+'_'+req.file.originalname;
            var dest_path = path.resolve(__dirname,'../public/phones/',fileName);

            fs.writeFile(dest_path,filedata,function(err){
                if (err){
                    console.log('写入文件失败');
                    res.send({ code:-1,msg:'新增手机失败' });
                } else {
                    //写入数据库
                    MongoClient.connect(url,function(err,client){
                        if(err){
                            console.log('链接数据库失败');
                            res.send({colde: -1,msg:'新增手机失败'});
                        } else {
                            var db = client.db('bao');

                            var saveData = req.body;
                            saveData.fileName = fileName;

                            let mobileNum = 0;
                            async.series([
                                //查询users表的所有记录条数
                                function(callback){
                                    db.collection('phone').find().count(function(err,num){
                                        if(err){
                                            callback({code:-101,msg:'查询users表的记录条数失败'});
                                        }else if(num <= 0){
                                            saveData._id = 1;
                                            callback(null);
                                        }else{
                                            console.log('查询成功');
                                            mobileNum = num;
                                            callback(null,num);
                                        }
                                    })
                                },
                                 //取到最后一条数据，拿到最后一条数据的_id,根据这个_id让这个_id+1
                                 function(callback){
                                    if(mobileNum <= 0){
                                        saveData._id = 1;
                                        callback(null);
                                    }else{
                                        db.collection('phone').find().skip(mobileNum-1).toArray(function(err,data){
                                            if (err) {
                                                callback({code: -101,msg: '查询最后一条数据失败'});
                                            }else {
                                                //console.log(savedata);
                                                saveData._id= data[0]._id +1;
                                                callback(null);
                                            }
                                        })
                                    }
                                },
                                //写入数据库的操作
                                function(callback){
                                    db.collection('phone').insertOne(saveData,function(err){
                                        if(err){
                                            console.log('写入数据库失败');
                                            res.send({colde: -1,msg:'新增手机失败'});
                                        } else {
                                            console.log('成功了');
                                            res.send({code: 0,msg:'新增手机成功'});
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
                        }
                    });
                }
            })
        }
    })
})


router.post('/updata',upload.single('rewriteImg'),function(req,res){

    var saveData = req.body;
    console.log(saveData);
    //console.log(saveData.phoneId);  
    //console.log(saveData.rewriteImg); 

    if(saveData.rewriteImg){
        console.log("===================");
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('链接数据库失败');
                res.send({colde: -1,msg:'新增手机失败'});
            } else {
                var db = client.db('bao');

                db.collection('phone').update( {'_id' : parseInt(saveData.phoneId)} ,{$set:{
                    phoneName:saveData.phoneName,
                    phoneBrand:saveData.phoneBrand,
                    phoneGuideP:saveData.phoneGuideP,
                    phoneRecoverP:saveData.phoneRecoverP
                }},function(err){
                    if(err){
                        res.send({code:-101,msg:'修改数据失败'});
                    }else{
                        res.send({code:0,msg:'修改数据成功'});
                    }
                })
                client.close();
            }
        })
    } else {
        fs.readFile(req.file.path,function(err,filedata){
            if(err){
                console.log('读取文件失败');
                res.send({colde: -1,msg:'修改手机失败'});
            } else{
                var fileName = new Date().getTime()+'_'+req.file.originalname;
                var dest_path = path.resolve(__dirname,'../public/phones/',fileName);
    
                fs.writeFile(dest_path,filedata,function(err){
                    if (err){
                        console.log('写入文件失败');
                        res.send({ code:-1,msg:'修改手机失败' });
                    } else {
                        //写入数据库
                        MongoClient.connect(url,function(err,client){
                            if(err){
                                console.log('链接数据库失败');
                                res.send({colde: -1,msg:'修改手机失败'});
                            } else {
                                var db = client.db('bao');
    
                                saveData.fileName = fileName;

                                db.collection('phone').update( {'_id' : parseInt(saveData.phoneId)} ,{$set:{
                                    phoneName:saveData.phoneName,
                                    phoneBrand:saveData.phoneBrand,
                                    phoneGuideP:saveData.phoneGuideP,
                                    phoneRecoverP:saveData.phoneRecoverP,
                                    fileName:saveData.fileName
                                }},function(err){
                                    if(err){
                                        res.send({code:-101,msg:'修改数据失败'});
                                    }else{
                                        res.send({code:0,msg:'修改数据成功'});
                                    }
                                })
                                client.close();

                            }
                        })
                    }
                })
            }
        })
    }
})

router.get('/delete',function(req,res){
    MongoClient.connect(url,function(err,client) {
        if (err) {
            console.log('数据库连接失败');
            res.send({ code:-1,msg:"获取列表失败"});
        } else {
            var db = client.db('bao');
            db.collection('phone').deleteOne({'_id':parseInt(req.query._id)},function(err){
                if(err){
                    console.log('删除数据失败');
                    res.send({ code:-1,msg:"删除数据失败"});
                } else {
                    console.log('删除成功');
                    res.send({code:0,msg:"删除成功"})
                }
            })
        }
        client.close();
    })
})



module.exports = router;
