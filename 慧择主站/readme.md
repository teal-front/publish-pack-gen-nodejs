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
    


### 源代码管理
	当前项目源代码是以svn进行管理，一条开发主干，测试环境代码是由trunk代码创建一个tag副本，当有开发的代码需发布到测试环境中时，我们从测试tag合并trunk上相应版本的代码，然后提交到tag。然后从服务器上通过svn进行代码更新。
	服务器上项目地址为 /srv/www/huize/server   更新代码时通过cd命令进入该目录，执行svn up进行代码更新。
### 服务器配置
	1. Nodejs安装
	现服务器上使用nvm进行Node版本管理。先安装nvm。地址： https://github.com/creationix/nvm
	通过nvm安装Nodejs  nvm install v4.3.1    nvm use v4.3.1
	2. 安装svn 
	http://serverfault.com/questions/332166/upgrade-subversion-1-6-to-1-7-on-centos-cant-find-yum-repository 可参照安装最新版svn
	3. 安装pm2
	npm install pm2 -g
	4. 若机器上没有安装nginx  安装nginx:       
	vi /etc/yum.repos.d/nginx.repo
	粘贴以下内容到nginx.repo，并保存
	[nginx]
	name=nginx repo
	baseurl=http://nginx.org/packages/centos/6/$basearch/
	gpgcheck=0
	enabled=1
	yum install nginx
	5. 配置nginx
	vi /etc/nginx/nginx.conf
	
	server {
	  listen 80;
	  server_name pdetail.huize.com;
	  server_name is.huize.com;	
	  access_log logs / pdetail.huize.com.access.log;
	  location / {
	    proxy_pass http: //192.168.48.22:8080;
	    proxy_read_timeout 300 s;
	    proxy_set_header Host $host;
	    prox y_set_header X - Real - IP $remote_addr;
	    proxy_set_header X - Forwarded - For $proxy_add_x_forwarded_for;
	    proxy_redirect off;
	  }
	}
	}

	3.项目发布
		1、编写pm2配置文件 pm2官方文档 http://pm2.keymetrics.io/
		2、svn checkout代码
		3、npm install
		3、pm2 start pm2.json 
		4、pm2简要操作
		重启 pm2 restart id/name
		停止 pm2 stop id/name
		日志 pm2 logs id/name
		详情 pm2 info id/name
	4. 日常更新(测试环境需先从trunk上merge代码)
	cd /srv/www/huize/server
	svn up
	如果只更新ejs无需重启项目，如果有node项目源文件更新 pm2 restart id/name
### 关于现有nodejs项目的一些规范
	1. url 设置参照restful规范
	文章：http://www.ruanyifeng.com/blog/2014/05/restful_api.html
	http://mccxj.github.io/blog/20130530_introduce-to-rest.html
	优良的设计推荐  https://developer.github.com/v3/
	2. 使用promise进行流程控制
![](http://img.huizecdn.com/demo/nodejs/n-001.png)
