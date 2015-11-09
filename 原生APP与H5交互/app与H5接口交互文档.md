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

#### 4、`JSBuyJumiCard`  关闭当前页并跳转到聚米卡
> 调用方法同`JSBuyJumiCard`一样

#### 5、跳转到APP的产品详情页面

```
function getProductInfo(callback){
    var data;
    $.post("/ActivityMillionaire/GetProductInfo",{productid:ProductId,planid:PlanId},function(result){
        if(result && result.code === 0){
            if (typeof result.data != 'object') {
                data = JSON.parse(result.data);
            }
            data.introduction = data.introduction.replace(/<.*?>/g, "");
            detailStr = JSON.stringify(data);
        }
        callback && callback(detailStr);
    });
}

getProductInfo(function(detailStr){
    if(core.app.isIos){
        window.location.href = "objc://recommendDetail//" + detailStr;
    }
    else if(core.app.isAndroid){
        WebviewAndJsMutual.callProDetail(detailStr);
    }else{
        window.location.href = "/u/" + PartnerId + "/product/detail-" + ProductId + "?planId=" + PlanId;
    }
})
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

#### 2、显示、隐藏 android自带的loading
```
//参数 false:隐藏,true:显示
WebviewAndJsMutual.showProgress(false);
```

#### 3、上传图片
```
WebviewAndJsMutual.getPicData(JSON.stringify({
    functionName:'setPicData',
    maxSize:1024 * 1024 * 5,
    maxMsg:'上传图片不能大于5M'
}),'upload');

//获取android回调的数据
window.setPicData = function(imageData, id){
    if(typeof WebviewAndJsMutual != 'undefined'){
        //关闭android自带的loading
        WebviewAndJsMutual.showProgress(false);
    }
    
    //imageData  android传回的base64编码的图片数据
    //id 由getPicData传递的参数，原样传回，在上传多张图片的时候，用于区分标识
    console.log(imageData,id);
}
```
