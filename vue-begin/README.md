# vue-begin

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


# vue工程目录：从目录的层次上建立项目的层次结构，层次结构方便去对应的模块、功能进行开发，维护和索引
* package.json：管理项目中的依赖、脚本命令
* babel.config.js：配置整个项目中的es6语法
  * 可以安装babel语法
  * 定制化添加babel属性
* .eslintrc.js：配置了eslintrc扩展的语法，配置了基本的法则
* src
  * App.vue：入口文件
  * main.js：主js文件；有vue的实例，托管着app节点下面所有的DOM元素，让他形成一个虚拟的DOM，然后对这个虚拟的DOM进行操作
  * router
    * index.js：管理路由
  * store
    * index.js：Vuex
* public
  * index.html：模板的html；有一个根节点元素app
# vue工程目录的意义
* 区别的视图和组件