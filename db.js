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

// 查询bloglist
function selectBlogList(){
  return new Promise(function (resolve, reject) {
    connection.query('SELECT * from blogs', function (error, results, fields) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
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

// 新建blog
function createBlog(blog){
  return new Promise(function (resolve, reject) {
    connection.query('INSERT INTO blogs(title,content,createtime,author) VALUES("'+blog.title+'","'+blog.content+'","'+formatDate(new Date())+'","'+blog.author+'")', function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// 新建blog
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

module.exports = {
  selectBlogList,
  selectBlogDetail,
  selectUser,
  createBlog,
  updateBlog,
  deleteBlog,
  checkLogin
};