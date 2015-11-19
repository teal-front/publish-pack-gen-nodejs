### 安装Sass
首先要安装[Ruby](http://rubyinstaller.org/downloads)和[Sass](http://sass-lang.com)，详细可参考：[http://www.w3cplus.com/sassguide/install.html](http://www.w3cplus.com/sassguide/install.html) 或者网上大把教程


### Sublime Text安装Sass Build插件
##### 1. 安装 Package Control Plugin

打开：`View > Show Console`    

输入：

###### Sublime Text2
	
	import urllib2,os,hashlib; h = 'eb2297e1a458f27d836c04bb0cbaf282' + 'd0e7a3098092775ccb37ca9d6b2e4b7d'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); os.makedirs( ipp ) if not os.path.exists(ipp) else None; urllib2.install_opener( urllib2.build_opener( urllib2.ProxyHandler()) ); by = urllib2.urlopen( 'http://packagecontrol.io/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); open( os.path.join( ipp, pf), 'wb' ).write(by) if dh == h else None; print('Error validating download (got %s instead of %s), please try manual install' % (dh, h) if dh != h else 'Please restart Sublime Text to finish installation')


###### Sublime Text3

	import urllib.request,os,hashlib; h = 'eb2297e1a458f27d836c04bb0cbaf282' + 'd0e7a3098092775ccb37ca9d6b2e4b7d'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); by = urllib.request.urlopen( 'http://packagecontrol.io/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); print('Error validating download (got %s instead of %s), please try manual install' % (dh, h)) if dh != h else open(os.path.join( ipp, pf), 'wb' ).write(by)

详见：[https://packagecontrol.io/installation#st3](https://packagecontrol.io/installation#st3)


##### 2. 安装 Package Control Plugin

`Ctrl+Shift+P` (Linux/Windows) 或` Command+Shift+P` (OS X)，然后输入'install'会看到`Package Control: Install Package`并选择。      

等待列表出来，输入`Sass`会看到`SASS Build System`选择安装。

安装完成后，`Ctrl+B` (Linux/Windows) or `Command+B` (OS X)可编译Sass为CSS，还会有一个`.map`文件。

更多详细见官方：[https://github.com/jaumefontal/SASS-Build-SublimeText2](https://github.com/jaumefontal/SASS-Build-SublimeText2)


>最后，如果编译失败，或许就是`中文`目录的问题,改成英文目录再试下。


## 编译异常处理

> 最后，如果编译失败，或许就是`中文`目录的问题,改成英文目录再试下。     
    
还有一种情况是.SCSS里有中文注释也会引起编译失败，可参考下面方法解决：

1. 找到Ruby安装目录如下文件，如：    
	
		D:\Ruby22-x64\lib\ruby\gems\2.2.0\gems\sass-3.4.16\lib\sass\engine.rb

2. 打开`engine.rb`文件
3. 添加下面代码到各种`require 'sass/*'`后面即可

		Encoding.default_external = Encoding.find('utf-8');

