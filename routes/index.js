var express = require('express');
var router = express.Router();
var db = require('../db');


/* GET home page. */
router.get('/',async function(req, res, next) {
  // let start = Promise.resolve({});
  // start.then(result => {
  //     db.selectBlogList();
  // }).then(result=>{
  //     console.log('获取用户基本信息及操作完成');
  //     return res.render('blog', {});
  // });
  blogList= await db.selectBlogList().catch((err) => {
    console.error(err);
    throw err;
  });
  res.render('index', { blogList });
});
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
    // console.log(result[0].username);
    // res.setHeader('Set-Cookie',`name=${username};path=/;httpOnly;`)
    // response.addHeader("Set-Cookie", `name=${username}; Path=/; HttpOnly`);
    // 同时设2个cookie，取前端能改的name2展示前端页面（改了也无所谓因为 取不到后端的值），取前端改不了的cookie的username查询用户列表
    res.cookie('name',result[0].username,{path:'/',expires: new Date(Date.now()+900000),httpOnly:true})
    res.cookie('name2',result[0].username,{path:'/',expires: new Date(Date.now()+900000)})
    var tips='登录成功';
    var  resultData=Object.assign({tips},{backurl})
    res.json(resultData)
    console.log('result[0]:',result[0])
  }else{
    res.json('登录失败，请稍后再试');
    console.log('login username or password is error');
  }
});
// 退出登录
router.post("/logout",function(req, res, next){
  res.cookie('name','',{path:'/',expires: new Date(Date.now()-1000),httpOnly:true})
  res.cookie('name2','',{path:'/',expires: new Date(Date.now()-1000)})
  console.log("退出登录成功")
  res.json("退出登录成功")
})



module.exports = router;
