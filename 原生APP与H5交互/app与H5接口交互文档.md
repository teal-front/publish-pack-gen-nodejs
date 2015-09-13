### app与H5接口交互文档

### 一、方法如何调用：
#### 1、iOS

+ 由H5调用此方法

```
var dataStr = JSON.stringify({test:123});
location.href = "objc://recommendDetail//" + dataStr;
```
+ 由iOS端调用此方法

```
var shareDataStr = JSON.stringify({name:"tom"});
window.getShareData = function(args){
	console.log(args);		//args为ios调用时候传递的参数
    return shareDataStr;	//shareDataStr此时应该为全局变量或者闭包参数
}
```

#### 2、android
```
var dataStr = JSON.stringify({test:123});
WebviewAndJsMutual.callProDetail(dataStr);
```


### 二、安卓和iOS通用方法

#### 1、`JSClose`  关闭当前webView
```
	if(core.app.isIos){
        location.href="objc://JSClose";
    }else if(core.app.isAndroid){
        WebviewAndJsMutual.JSClose();
    }
```

#### 2、`JSToHome`  关闭当前页并跳转到首页
> 调用方法同`JSClose`一样
案例：产品详情找不到产品，出现404页面，H5点击按钮回到H5首页，APP点击回到APP主界面

#### 3、`JSRefresh`  刷新数据
```
if(core.app.isIos){
    location.href="objc://JSRefresh";
}else if(core.app.isAndroid){
    WebviewAndJsMutual.JSRefresh();
}
else{
    setTimeout(function(){
        location.href="/u/"+shopId+"/userCard";
    },1000);
}
```
> 案例：    
1、webview嵌入编辑微名片页面    
2、修改微名片的`姓名`    
3、点击保存    
4、同步刷新APP本身自带的`姓名`缓存数据。


### 三、安卓私有方法

#### 1、拨打电话
```
//android src
void callPhone(String phoneNumber);
//H5调用
WebviewAndJsMutual.callPhone('10086');
```