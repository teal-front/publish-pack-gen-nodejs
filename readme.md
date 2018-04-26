## Summary
author: teal
description: git版本的
beginTime: 2017-3-27

## Use
1. Web服务器
   操作流程：选中自己的提交版本 - 确认文件 - 生成对应的包下载
   对应的Server方法： 
    git-cli获取git服务器上指定版本号对应的文件；
    把上一步获取的文件按照具体项目的站点结构打包成zip包；([archiver](archiver))
2. 需要在服务器上建立git仓库，并不间断的拉取


## Development log
1. 2017-3-27 尝试在本地获取git仓库的版本Log, 某个commit的相关文件，下载commit的相关文件。但git的大部分命令只适合在.git版本库中运行，没有像svn那样cli中支持远程获取
2. 2017-3-28 在本地拉取仓库，git命令在本地运行。需要设置定时任务去拉取最新代码，或实时触发拉取，现默认采用前者。

### Todo
- [x] 找到合适的git cli命令
