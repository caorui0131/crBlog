var express = require('express');
var router = express.Router();
var db = require('../db');

/* blog页 */
router.get('/',async function(req, res, next) {
  var blogList= await db.selectBlogList().catch((err) => {
    console.error(err);
    throw err;
  });
  var tagList= await db.selectTagList().catch((err) => {
    console.error(err);
    throw err;
  });
  res.render('index', { blogList,tagList});
});

router.get('/blog/detail/:id', async function(req, res, next) {
  let id = req.params.id || '';
  console.log(id);
  let blog = {};
  blog= await db.selectBlogDetail(id).catch((err) => {
      console.error(err);
      throw err;
  });
  res.render('blogDetail', { blog });
});

/* user页 */
router.get('/user/:id', async function(req, res, next) {
  let id = req.params.id || '';
  console.log(id);
  let blogList = {};
  blogList= await db.selectUser(id).catch((err) => {
      console.error(err);
      throw err;
  });
  res.render('author', { blogList });
});

router.get('/login', async function(req, res, next) {
  console.log('login');
  var result = {};
  var backurl = req.query.backurl;
  if(backurl){
    result = Object.assign(result,{backurl});
  }
  res.render('login', result);
});

router.post('/login', async function(req, res, next) {
  var username=req.body.username;
  var password=req.body.password;
  var backurl=req.body.backurl;
  var data={
    username,
    password
  }
  var result=await db.checkLogin(data).catch((err) => {
    console.error(err);
    throw err;
  });
  if(result&&result.length>0){
    // 同时设2个cookie，取前端能改的name2展示前端页面（改了也无所谓因为 取不到后端的值），取前端改不了的cookie的username查询用户列表
    res.cookie('name',result[0].username,{path:'/',expires: new Date(Date.now()+9000000),httpOnly:true})
    res.cookie('name2',result[0].username,{path:'/',expires: new Date(Date.now()+9000000)})
    res.json({code:200,successText:'登录成功!',backurl});
  }else{
    res.json({code:400,errMsg:'登录失败，请检查您的输入是否正确!'});
    console.log('login username or password is error');
  }
});

// 退出登录
router.post("/logout",function(req, res, next){
  // res.cookie('name','',{path:'/',expires: new Date(Date.now()-1000),httpOnly:true})
  // res.cookie('name2','',{path:'/',expires: new Date(Date.now()-1000)})
  //删除Cookie  
  res.clearCookie('name');
  res.clearCookie('name2');
  res.json({code:200,successText:'退出登录成功!'});
})


// tags页
router.get('/tag',async function(req, res, next) {
  var tagList= await db.selectTagList().catch((err) => {
    console.error(err);
    throw err;
  });
  res.render('tagList', { tagList});
});

module.exports = router;
