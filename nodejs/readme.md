# Nodejs项目模板操作说明 #

## JS配置文件
	路径：public\javascripts\src\config
	依赖配置文件：requirejs-shim.js 可以为第三方组件手动添加版本号
	第三方脚本引用：others-scripts-aliases.json
	临时生成的中间文件：requirejs-aliases.js

	真正使用的配置文件：requirejs-config.js

## 打包(ZIP)说明
###1. 打包Nodejs文件，    
>运行文件：build-zip-nodejs.bat

###2. 打包Javascript文件，
>运行文件：build-zip-js.bat

###3. 打包CSS文件，       
>运行文件：build-zip-css.bat
2. 打包所有文件，       运行文件：build-zip-all.bat
## 文件监听
###1. 监听SASS文件
>watch-sass.bat
>watch-sass.bat
###2. 监听JS文件，自动更新配置文件
>watch-file-update-config.bat
## 更新文件文件
>update-config.bat