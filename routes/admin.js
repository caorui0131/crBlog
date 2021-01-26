var express = require('express');
var router = express.Router();
var db = require('../db');

router.get('/',async function(req, res, next) {
  var tagidCode=req.query.tagidCode|| '';
  var userId = req.params.userId|| '';
  var userId = res.locals.currentUserName;
  var data={
    userId:"'"+userId+"'",
    tagidCode:tagidCode
  }
  blogList= await db.selectBlogList(data).catch((err) => {
    console.error(err);
    throw err;
  });
  var tagList= await db.selectTagList().catch((err) => {
    console.error(err);
    throw err;
  });
  res.render('admin', { blogList,tagList });
});
router.get('/createBlog', async function(req, res, next) {
  res.render('editBlog', {  url:'/admin/createBlog',buttonText:'新建博客'});
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
  if(blog.title.length>256){
    res.json({status: 500,blog,errorContent:"标题长度不能超过256字"})
  }
  if(blog.author.length>20){
    res.json({status: 500,blog,errorContent:"作者长度不能超过20字"})
  }
  var results=await db.createBlog(blog).catch((err) => {
    res.json({status: 500,errorContent:'修改博客失败，请稍后再试！'});
    console.error(err);
    throw err;
  });
  console.log('results:',results)
  
  if(results.affectedRows&&results.affectedRows>0){
    // express如何在res.redirect的同时返回数据
    // res.redirect('/admin')
    res.json({status: 200,successContents:'新建博客成功！'});
  }else{
    res.json({status: 500,errorContent:'修改博客失败，请稍后再试！'});
  }
  // res.render('admin', {  });
});
router.get('/editBlog/:id', async function (req, res, next) {
  let id = req.params.id;
  let blog = {};
  blog = await db.selectBlogDetail(id).catch((err) => {
    console.error(err);
    throw err;
  });
  if(blog.length<1){
    var err= new Error("未获得blog，id:"+id); 
    console.error(err);
    throw err;
  }
  res.render('editBlog', { blog:blog[0],url:'/admin/editBlog/'+id,buttonText:'更新博客'});
});
router.post('/editBlog/:id', async function (req, res, next) {
  let id = req.params.id;
  var blog = {
    id: id,
    title: req.body.title,
    content: req.body.content,
    author:req.body.author
  }
  if(blog.title.length>256){
    res.json({status: 500,blog,errorContent:"标题长度不能超过256字"})
  }
  if(blog.author.length>20){
    res.json({status: 500,blog,errorContent:"作者长度不能超过20字"})
  }
  blog = await db.updateBlog(blog).catch((err) => {
    res.json({status: 500,errorContent:'修改博客失败，请稍后再试！'});
    console.error(err);
    throw err;
  });
  // form表单同步方式：
  // res.redirect('/admin/editBlog/'+id);
  // AJAX异步方式：
  // res.render('editBlog', { blog,successContents:'修改博客成功！' });
  // res.json({ status: 200, successText: '修改博客成功！' });
  res.json({status: 200,successContents:'修改博客成功！'});
  
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

// tag
router.get('/createTag',async function(req, res, next) {
  res.render('editTag', { });
});
router.post('/createTag',async function(req, res, next) {
  var tag={
    tag:req.body.title
  }
  var tagList= await db.createTag(tag).catch((err) => {
    console.error(err);
    throw err;
  });
  // res.render('ediTag', { tagList});
});
router.get('/editTag/:id', async function (req, res, next) {
  let id = req.params.id;
  let tag = {};
  tag = await db.selectTagDetail(id).catch((err) => {
    console.error(err);
    throw err;
  });
  res.render('editTag', { tag });
});
router.post('/updateTag/:id', async function (req, res, next) {
  let id = req.params.id;
  var tag = {
    id: id,
    title: req.body.title
  }
  tag = await db.updateTag(tag).catch((err) => {
    console.error(err);
    throw err;
  });
  console.log(tag)
  // res.render('editBlog', { blog });
  // res.send(id);
  res.redirect('/admin/editTag/'+id);
});
router.get('/deleteTag/:id',async function(req, res, next) {
  try{
    var id=req.params.id;
    await db.deleteTag(id).catch((err) => {
      console.error(err);
      throw err;
    });
    res.redirect('/admin');
  }catch (e){
    console.log(e);
    throw e;
  }
});
router.get('/addTag/:id',async function(req, res, next) {
  try{
    var tagList= await db.selectTagList().catch((err) => {
      console.error(err);
      throw err;
    });
    // console.log(tagList)
    res.render('addTag', {tagList });
  }catch (e){
    console.log(e);
    throw e;
  }
});
router.post('/addTag/:id',async function(req, res, next) {
  try{
    var blogId=req.params.id;
    var tagId= req.body.tagId;
    console.log('tagIdtagId:',tagId)
    var data={
      blogId:blogId,
      tagId:tagId
    };
    await db.addBlogTag(data).catch((err) => {
      console.error(err);
      throw err;
    });
    res.redirect('/');
  }catch (e){
    console.log(e);
    throw e;
  }
});

module.exports = router;
