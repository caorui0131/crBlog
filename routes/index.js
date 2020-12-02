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

router.get('/blog/login', async function(req, res, next) {
  console.log('login');
  res.render('login', {  });
});




module.exports = router;
