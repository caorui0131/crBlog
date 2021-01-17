var mysql = require('mysql');//从node_modules中引入包

var connection = mysql.createConnection({//创建一个mysql链接对象
  host     : 'localhost',
  port     : 3306,
  user     : 'root',
  password : 'Cr18811657411',
  database : 'blog'
});
 
connection.connect();//开始链接
// 查询mysql中的数据-测试
// connection.query('SELECT * from blogs', function (error, results, fields) {
//   console.log(results)
// });

//非数据库相关函数
// 格式化时间
function formatDate(date) {
  var date = new Date(date);
  var YY = date.getFullYear() + '-';
  var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
  var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return YY + MM + DD + " " + hh + mm + ss;
}

// blogs表
// 查询bloglist
function selectBlogList(tagidCode){
  return new Promise(function (resolve, reject) {
    var whereSql = "";
    if(tagidCode && tagidCode!=''){
      whereSql += " AND blogs.tagId = "+tagidCode;
    }
    connection.query('SELECT * from blogs where 1=1'+whereSql, function (error, results, fields) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        // console.log('results:',results)
        for(i=0;i<results.length;i++){
          // console.log('results.createtime:',results[i].createtime)
          // console.log('formatDate(results.createtime):',formatDate(results[i].createtime))
          results[i].createtime=formatDate(results[i].createtime)
        }
        resolve(results);
      }
    });
  });
};

// 查询blogDetail
function selectBlogDetail(id){
  return new Promise(function (resolve, reject) {
    connection.query('SELECT * from blogs WHERE id='+id, function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// 新建blog
function createBlog(blog){
  return new Promise(function (resolve, reject) {
    console.log('formatDate(new Date()):',formatDate(new Date()))
    connection.query('INSERT INTO blogs(title,content,createtime,author) VALUES("'+blog.title+'","'+blog.content+'","'+formatDate(new Date())+'","'+blog.author+'")', function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// 更新blog
function updateBlog(blog){
  return new Promise(function (resolve, reject) {
    connection.query('UPDATE blogs SET title = "'+blog.title+'",content="'+blog.content+'",author="'+blog.author+'",createtime="'+formatDate(new Date())+'" where id = '+blog.id, function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// 删除blog
function deleteBlog(id){
  return new Promise(function (resolve, reject) {
    connection.query('DELETE FROM blog.blogs where id ='+id, function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// users表
// 查询user主页
function selectUser(id){
  return new Promise(function (resolve, reject) {
    connection.query('SELECT * from blogs WHERE author="'+id+'"', function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// 登录信息检查
function checkLogin(data){
  return new Promise(function (resolve, reject) {
    connection.query(`select username,password from users where username='${data.username}'and password='${data.password}';`, function (error, results, fields) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.error(results);
        resolve(results);
      }
    });
  });
}

// tags表
// 查询taglist
function selectTagList(){
  return new Promise(function (resolve, reject) {
    connection.query('SELECT * from tags', function (error, results, fields) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        // console.log(results);
        resolve(results);
      }
    });
  });
};

// 查询taglist
function selectTagDetail(id){
  return new Promise(function (resolve, reject) {
    connection.query('SELECT * from tags WHERE id='+id, function (error, results, fields) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};
// 新建tag
function createTag(tag){
  return new Promise(function (resolve, reject) {
    connection.query('INSERT INTO tags(title) VALUES("'+tag.title+'")', function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
        console.log(results)
      }
    });
  });
};

// 更新tag
function updateTag(tag){
  return new Promise(function (resolve, reject) {
    connection.query('UPDATE tags SET title = "'+tag.title+'" where id = '+tag.id, function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
        
      }
    });
  });
};

// 删除tag
function deleteTag(id){
  return new Promise(function (resolve, reject) {
    connection.query('DELETE FROM tags where id ='+id, function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// 查询blog对应的tag名称
function selectBlogTag(){
  return new Promise(function (resolve, reject) {
    connection.query('SELECT blogs.id,blogs.title as blogTitle,tags.title as tagTitle FROM blog.tags,blog.blogs WHERE blogs.tagId = tags.id', function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// 查询tag在blog中绑定的次数
function countTagId(){
  return new Promise(function (resolve, reject) {
    connection.query('SELECT tagId,COUNT(tagId) as tagCount FROM blog.blogs GROUP BY tagId', function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        // console.log(results);
        resolve(results);
      }
    });
  });
};

// 查询tag绑定的blog
function selectTagIdOfBlogs(tagidCode){
  return new Promise(function (resolve, reject) {
    connection.query('SELECT *  FROM blog.blogs  where blogs.tagId = '+tagidCode, function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        // console.log(results);
        resolve(results);
      }
    });
  });
};

// 给blog绑定tag
function addBlogTag(data){
  return new Promise(function (resolve, reject) {
    connection.query('UPDATE blogs SET tagId = '+data.tagId+' where id = '+data.blogId, function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        console.log(results);
        resolve(results);
      }
    });
  });
};

module.exports = {
  // blogs表
  selectBlogList,
  selectBlogDetail,
  createBlog,
  updateBlog,
  deleteBlog,
  // users表
  selectUser,
  checkLogin,
  // tags表
  selectTagList,
  selectTagDetail,
  createTag,
  updateTag,
  deleteTag,
  selectBlogTag,
  countTagId,
  selectTagIdOfBlogs,
  addBlogTag

};