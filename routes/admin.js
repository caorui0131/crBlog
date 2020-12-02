var express = require('express');
var router = express.Router();
var db = require('../db');

router.get('/',async function(req, res, next) {
  blogList= await db.selectBlogList().catch((err) => {
    console.error(err);
    throw err;
  });
  res.render('admin', { blogList });
});
router.get('/createBlog', async function(req, res, next) {
  res.render('editBlog', {  });
});
// router.post('/editBlog',async function(req, res, next) {
//   blogList= await db.selectBlogList().catch((err) => {
//     console.error(err);
//     throw err;
//   });
//   res.render('admin', { blogList });
// });
router.post('/createBlog',async function(req, res, next) {
  var blog = {
    title: req.body.title,
    content: req.body.content,
    author:req.body.author
  }
  await db.createBlog(blog).catch((err) => {
    console.error(err);
    throw err;
  });
  // res.render('admin', {  });
});
router.get('/editBlog/:id', async function (req, res, next) {
  let id = req.params.id;
  let blog = {};
  blog = await db.selectBlogDetail(id).catch((err) => {
    console.error(err);
    throw err;
  });
  res.render('editBlog', { blog });
});
router.post('/editBlog/:id', async function (req, res, next) {
  let id = req.params.id;
  var blog = {
    id: id,
    title: req.body.title,
    content: req.body.content,
    author:req.body.author
  }
  blog = await db.updateBlog(blog).catch((err) => {
    console.error(err);
    throw err;
  });
  // res.render('editBlog', { blog });
  // res.send(id);
  res.redirect('/admin/editBlog/'+id);
});
router.get('/deleteBlog/:id',async function(req, res, next) {
  try{
    var id=req.params.id;
    await db.deleteBlog(id).catch((err) => {
      console.error(err);
      throw err;
    });
    res.redirect('/admin');
  }catch (e){
    console.log(e);
    throw e;
  }
  
});
module.exports = router;
