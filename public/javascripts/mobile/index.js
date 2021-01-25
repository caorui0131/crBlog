$(function () {
    (function(){
        return{
            // isMobileOrPC:function(params){
            //     // 判断页面是在移动端还是PC端打开的
            //     if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
            //         console.log('此用户是通过移动端访问网站的')
            //         window.location.href = "/mobile";
            //     } else {
            //         console.log('此用户是通过PC端访问网站的')
            //         // window.location.href = "/";
            //     }
            // },
            clickBlogItem:function(params){
                $(document).on('touchend','.blogItem',function(){
                    alert(1)
                });
            },
            init:function(){
                // this.isMobileOrPC();
                // this.clickBlogItem();
            },
        }
    })().init();
});
  
