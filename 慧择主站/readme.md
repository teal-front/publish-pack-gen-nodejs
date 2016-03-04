#  慧择主站重构前端技术规范 #
### 技术规范 ###
     
    1. 服务端：
	    Web服务端：Nodejs
	    Http框架：Express
	    模板引擎：EJS
    2. 客户端：
	    模块化工具：Requiejs
	    JS库：jQuery
    3. CSS 工具：
  	  	SASS+COMPASS
    4. 自动化构建工具：
   		Grunt
### 重构规范 ###

    1. CSS以模块为一个SCSS文件，然后在大文件里面进行组装，这样在后期的迭代方便删除与添加，不产生额外的内容；
    2. CSS原则为：继承+组合；原则上选择器不超过两级；
    3. CSS Sprite通过Compass自动合成；

### 目录规范 ###
![text](images/InsertPic_BEED(02-02-09-17-36).jpg)

### 静态资源 ###

    1. 在本地搭建静态资服务，静态资源不放在项目的Public目录下；
    2. 静态资源目录SVN
    	CSS：https://hz-test-new/svn/web/trunk/static.huizecdn.com/css/hz/www
    	JS：https://hz-test-new/svn/web/trunk/static.huizecdn.com/js/hz/www
		images:https://hz-test-new/svn/web/trunk/img.huizecdn.com/hz/www
### 版本号  ###
    1. 所有框架版本号以《前端开发规范》为准；
	2. 文件版本号通过Grunt根据文件是否变化自动添加；

### Node与Java通讯 ###
	1. 以刘斌写的Node与Java通讯组件为准，与渠道保持一至，今后其它产品线也一样，有不明白的或疑问的地方随时与刘斌沟通；

### 其它 ###
    1. 所有js代码需要通过JSHint检验；
    2. 对于比较耗时的页面，采用BigPipe技术，缩短整体等待时间；关于JS渲染页面对SEO的影响，将采用两套方案进行，如果是爬虫或客户不支持JS的情况下，采用服务端渲染，其它情况就采用JS渲染。了解Bigpipe；
    3. 关于React.js UI组件框架，我们想在合适的场景 小范围内试用，（我们不是一味追求新技术，但也不拒绝，我们是一种拥抱的态度，如果能带来大的好处，代码复用，利于代码维护管理，提升用户体验，能提高开发效率的，我们愿意小范围内偿试，然后再慢慢推广开来），了解React
    如有不明白的，随时和我沟通！
    