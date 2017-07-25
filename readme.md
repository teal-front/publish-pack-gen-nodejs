## summary
author: teal
beginTime: 2016-12-21

## 目的
1. Web服务器
   操作流程：选中自己的提交版本 - 确认文件 - 生成对应的包下载
   对应的Server方法： 
    svn-cli获取svn服务器上指定版本号对应的文件；
    把上一步获取的文件按照具体项目的站点结构打包成zip包；([archiver](archiver))
    写入打包的操作日志
2. 浏览器上（前期可先做成服务器上脚本）
	页面实时获取最新版本，也可手动刷新；选择提交版本；生成zip包


## development log

1. 2016-12-22
   在app.js中加了几个核心的方法，引用了native-zip & archiver的npm包，其中native-zip的包里有个svn-interface的npm包，是对svn-cli方法的包装，很方便使用；
2. 2017-01-11
	把SVN的几个核心方法找到了，放在FE_Play下
	还需研究下在odms系统里点击上传时，怎么选择版本号，然后把文件下载到本地
3. 2017-01-13
    基本的查询版本号、下载包的功能都实现了
4. 2017-02-10
    把页面放在Chrome Extensions里了
    支持CORS访问
5. 2017-03-26
    使用复选框
    集成到Chrome插件中
    界面优化
6. 2017-05
    支持JS自动压缩   
7. 2017-06-14
    在插件上加上了下载文件时的loading效果
4. todo
    文件路径可以选择
    下载文件时，有进度条
    createZip.sh里execFilePaths的文件路径，除去重复的路径
 