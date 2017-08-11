# 前言

阅读之前，请先阅读：[业务核心库 node-coreui-pc](https://github.com/zmrdlb/node-coreui-pc)，[node-express](http://www.expressjs.com.cn/)

此项目是使用[业务核心库](https://github.com/zmrdlb/node-coreui-pc)的具体业务工程demo。即我们开发项目的时候工程目录设计如下：

- 业务核心库

- 具体业务项目（会使用业务核心库里面的代码）

`重点说明`:  此项目是基于node-express搭建，请确保先熟悉node-express。

# 搭建环境

1 . 在D:\mycoderoot\project-frame（可自行更改）下，git clone 

- https://github.com/zmrdlb/node-coreui-pc.git

- https://github.com/zmrdlb/express-demo.git

- https://github.com/zmrdlb/tool.git

2. 分别切换到 tool, node-core-ui 和 express-demo

安装所需要的npm包：

```
npm install
```

3 . fiddler配置 (其他可以设置代理的任意工具都行)

REGEX:http://web.zmrdlb.net/nodecore/*

D:\mycoderoot\project-frame\node-coreui-pc\

4 . 切换到目录D:\mycoderoot\project-frame\express-demo

运行如下命令

```
npm run dev
```

5. 在浏览器中输入以下地址

```
http://localhost:3000/
```

现在程序跑起来了

# demo页地址

- 首页：http://localhost:3000/
- demo页不传参数：http://localhost:3000/demo
- demo页传参数：http://localhost:3000/demo/900124
- 系统弹层使用页：http://localhost:3000/layer
- localStorage数据缓存页：http://localhost:3000/storage

## io接口请求

再查看demo页之前，请先运行以下命令，开启node写的简单接口模拟

```
npm run interstart
```

- 接口请求 - [node-coreui-pc](https://github.com/zmrdlb/node-coreui-pc)中的js/widget中的io使用方式：http://localhost:3000/io
- 接口请求 - [node-io-fetch](https://github.com/zmrdlb/node-io-fetch)使用方式：http://localhost:3000/iofetch

## 用户登录信息会话验证

使用 [cookie-session](https://github.com/expressjs/cookie-session#readme) 中间件，实现了简单的用户登录信息会话验证：

1. 任何访问 /users/* 路径，首先会判断用户信息是否过期；

2. 过期则重定向到登录页面，登录成功后进入首页；

> 为了测试效果，本次设置的用户信息有效期为 `2分钟`

- 用户首页：http://localhost:3000/users

## 开发模式

如果你想修改部分代码，并测试。那么请切换到express-demo目录下，运行如下命令：

```
grunt develop -v --base=D:\mycoderoot\project-frame\tool\node_modules
```

运行后，此命令将监听你修改的js脚本：public/javascripts/page/**/*.js，并进行相关编译。

# 技术点

- node
- npm
- es6等js高级语法
- browserify
- stringify
- babel

# 工程目录设计说明

此项目是根据express官网提供的项目生成命令生成，所以整体目录结构及语法请先阅读[node-express官网](http://www.expressjs.com.cn/)。

下面列举下针对此项目的特别说明：

## package.json

与一般的package.json不同的是，你会看到 `“browser”` 有很多配置：

```
"libutil-datetime": "../node-coreui-pc/js/widget/util/datetime.js",
    "libutil-deviceevtname": "../node-coreui-pc/js/widget/util/deviceevtname.js",
    "libutil-resize": "../node-coreui-pc/js/widget/util/resize.js",
    "libutil-scroll": "../node-coreui-pc/js/widget/util/scroll.js",
    "libutil-tool": "../node-coreui-pc/js/widget/util/tool.js",
    "libutil-tpl": "../node-coreui-pc/js/widget/util/tpl.js",
    "libutil-winresize": "../node-coreui-pc/js/widget/util/winresize.js",
    "libutil-winscroll": "../node-coreui-pc/js/widget/util/winscroll.js",
    "libutil-workerControl": "../node-coreui-pc/js/widget/util/workerControl.js",
    "libutil-csssuport": "../node-coreui-pc/js/widget/util/csssuport.js",
    "liblayer-alert": "../node-coreui-pc/js/widget/ui/layer/alert.js",
    "liblayer-alertControl": "../node-coreui-pc/js/widget/ui/layer/alertControl.js",
    "liblayer-alertSingle": "../node-coreui-pc/js/widget/ui/layer/alertSingle.js",
    "liblayer-baseControl": "../node-coreui-pc/js/widget/ui/layer/baseControl.js",
    "liblayer-bombLayer": "../node-coreui-pc/js/widget/ui/layer/bombLayer.js",
    "liblayer-confirm": "../node-coreui-pc/js/widget/ui/layer/confirm.js",
    "liblayer-confirmControl": "../node-coreui-pc/js/widget/ui/layer/confirmControl.js",
    "liblayer-confirmSingle": "../node-coreui-pc/js/widget/ui/layer/confirmSingle.js",
    "liblayer-layer": "../node-coreui-pc/js/widget/ui/layer/layer.js",
    "liblayer-mask": "../node-coreui-pc/js/widget/ui/layer/mask.js",
    "liblayer-positionBomb": "../node-coreui-pc/js/widget/ui/layer/positionBomb.js",
    "libio-ioconfig": "../node-coreui-pc/js/widget/io/ioconfig.js",
    "libio-interio": "../node-coreui-pc/js/widget/io/interio.js",
    "libio-storage": "../node-coreui-pc/js/widget/io/storage.js",
    "core-baseview": "../node-coreui-pc/js/common/base.view.js",
    "core-ui-alert": "../node-coreui-pc/js/ui/ui.alert.js",
    "core-ui-confirm": "../node-coreui-pc/js/ui/ui.confirm.js",
    "core-ui-layer": "../node-coreui-pc/js/ui/ui.layer.js",
    "core-ui-loading": "../node-coreui-pc/js/ui/ui.loading.js",
    "core-ui-toast": "../node-coreui-pc/js/ui/ui.toast.js"
```

你应该已经猜到了，这些就是对 node-coreui-pc 中的js组件的别名设置。如果要引用这些组件，直接 require('别名')即可

## app.js

express自行生成的，应用的入口。里面声明了对路由的引用，以及各种中间件。更多详情请阅读官网，这里不做过多说明。

## routes

express自行生成的存放路由的入口。更多详情请阅读官网，这里不做过多说明。

## views

express自行生成的存放模板入口，这里使用 ejs 模板。

我针对模板进行了拆分：

### layout

- meta.ejs : html头部meta声明部分
- style.ejs: 公共的css引用。此处引用了 node-coreui-pc 中的 global.css
- js.ejs: 公共的js引用。此处引用了 node-coreui-pc/js/widget/lib/ 中的 jquery.js 和 polyfill.js

### demo.ejs

具体页面对layout中模板引用的例子，每次新建页面copy此模板进行更改即可

## public

### images / stylesheets

顾名思义，不做过多说明

### javascripts

#### page - 开发源码存放区

此处中的代码，和平常的node代码编写一样，存放各个页面需要的业务js代码。

#### bundle - 最终浏览器可访问的代码存放区

使用 grunt-browserify 将page中的代码，编译成浏览器可识别的代码

> 我们平时开发时，就在page里面开发，然后开启 grunt develop 来监听更改

# 提测或上线前代码编译

1 . 在D:\mycoderoot\project-frame下新建dist目录，切换到：D:\mycoderoot\project-frame\dist

2 . 在dist下，git clone node-coreui-pc 和 express-demo，分别新建并切换到product分支。我们规定product分支存放提测线上代码。后续大家可以根据需要自由发挥。(实际中，提测和线上应该是两个不同的分支)

3 . 如果首次载入node-coreui-pc，或者修改了node-coreui-pc，先切换到node-coreui-pc下，运行：grunt -v --base=D:\mycoderoot\project-frame\tool\node_modules

4 . 在express-demo下运行 grunt -v --base=D:\mycoderoot\project-frame\tool\node_modules

5. 修改fiddler配置为：

- REGEX:http://web.zmrdlb.net/nodecore/*

- D:\mycoderoot\project-frame\dist\node-coreui-pc\

6. ctrl+c 切断原来的express-demo的运行，切换到dist/express-demo下

- 清空 package.json中devDependencies选项，此处我已清空

- 运行如下命令

```
npm install
npm start
```

7. 打开浏览器访问：http://localhost:3000

可以查看控制台，此处加载的js,css资源都是编译压缩过的，并且带有版本号

# 线上环境部署

我们基于node-express开发了网站，放到线上环境如何部署呢？这里官方推荐使用 [PM2](http://pm2.keymetrics.io/)

关于pm2的官方文档，我在csdn上大体翻译了一遍，后续会进行部署跟进，并添加说明。

csdn翻译

- [PM2 - Quick Start](http://blog.csdn.net/zmrdlb/article/details/72831575)
- [pm2 - Documentation - (Cluster Mode&Process File)](http://blog.csdn.net/zmrdlb/article/details/76635056)
- [PM2 - Documentation - (Graceful restart/reload & Environment management & Log Management)](http://blog.csdn.net/zmrdlb/article/details/76840906)
- [PM2 - Documentation - (Update PM2 & Deployment)](http://blog.csdn.net/zmrdlb/article/details/76906519)
- [PM2 - Documentation - (Startup Script & Docker Integration & Process Metrics & Process Actions)](http://blog.csdn.net/zmrdlb/article/details/76924185)
- [PM2 - Documentation - (Watch & Restart & Monitoring & Source map)](http://blog.csdn.net/zmrdlb/article/details/77009095)
- [PM2 - Documentation - (Specifics,ES6/AuthBind...)](http://blog.csdn.net/zmrdlb/article/details/77054265)
- [PM2 - Documentation - (PM2 API & Using PM2 in Cloud Providers & Expose static files)](http://blog.csdn.net/zmrdlb/article/details/77062898)
- [PM2 - Documentation - (Install as .deb & Download as ZIP & Contributing - 贡献)](http://blog.csdn.net/zmrdlb/article/details/77067665)

