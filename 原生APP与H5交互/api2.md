### app与H5接口交互文档

#### 1、跳转至产品库
	if(core.app.isAndroid){
		WebviewAndJsMutual.JSToProductLibrary();
	}else{
		var result = JMWebHelp.JSToProductLibrary();
	}

#### 2、跳转至零元赠险
	if(core.app.isAndroid){
		WebviewAndJsMutual.JSToZeroList();
	}else{
		var result = JMWebHelp.JSToZeroList();
	}
#### 3、测试分享功能
	var shareData={
	    url:window.location.href,
	    title:'微分享详情',
	    summary:'微分享详情内容内容内容内容内容内容内容内容内容内容内容内容',
	    pic:'http://images.hzins.com/short/jumiapp/fxlogo/mybx-logo.jpg'
	};

	var shareData1 = JSON.stringify(shareData);

	if(core.app.isAndroid){
		WebviewAndJsMutual.JSActionShare(shareData1);
	}else{
		var result = JMWebHelp.JSActionShare(shareData1);
	}
#### 4、跳转至产品分类列表
	varproductList={
	    "Id": 10,
	    "Name": "家财保险",
	    "ProductCount": 44,
	    "ImageUrl": "http://images.hzins.com/short/jumiapp/categories/home.png",
	    "position ": 1,
	    "Children": [
	        {
	            "Id": 213,
	            "Name": "自住型家财险",
	            "ProductCount": 29,
	            "ImageUrl": null,
	            "Children": [
	                
	            ]
	        },
	        {
	            "Id": 214,
	            "Name": "出租型家财险",
	            "ProductCount": 9,
	            "ImageUrl": null,
	            "Children": [
	                
	            ]
	        },
	        {
	            "Id": 215,
	            "Name": "承租型家财险",
	            "ProductCount": 2,
	            "ImageUrl": null,
	            "Children": [
	                
	            ]
	        },
	        {
	            "Id": 216,
	            "Name": "网店专用型家财险",
	            "ProductCount": 4,
	            "ImageUrl": null,
	            "Children": [
	                
	            ]
	        }
	    ]
	};

	var productList1 = JSON.stringify(productList);
	
	if(core.app.isAndroid){
		WebviewAndJsMutual.JSToProductTypeList(productList1);
	}else{
		var result = JMWebHelp.JSToProductTypeList(productList1);
	}

#### 5、跳转至服务卡首页
	if(core.app.isAndroid){
		WebviewAndJsMutual.JSToIMiCardRoot();
	}else{
		var result = JMWebHelp.JSToIMiCardRoot();
	}
#### 6、跳转至公司分类后的产品列表
	var companyProduct ={
		"Id":1,
		"CompNameCn":"中国人寿保险股份有限公司",
		"CompNum":"101",
		"imgLogo":"http://images.hzins.com/upload/admin/2/25/25a/25a1/25a1fa0b2404476b8013c73fcadcf26c.jpg",
		"imgSmallLogo":"http://images.hzins.com/upload/admin/d/d7/d73/d736/d7361e9bcefa47098576200b3fba9805.jpg",
		"SimpName":"中国人寿"
	}
	
	var companyProduct1 = JSON.stringify(companyProduct);
	
	if(core.app.isAndroid){
		WebviewAndJsMutual.JSToCompanyProduct(companyProduct1);
	}else{
		var result = JMWebHelp.JSToCompanyProduct(companyProduct1);
	}
#### 7、跳转至推荐注册页面
	if(core.app.isAndroid){
		WebviewAndJsMutual.JSToRecommendRegister();
	}else{
		var result = JMWebHelp.JSToRecommendRegister();
	}
#### 8、跳转至红包页面
	if(core.app.isAndroid){
		WebviewAndJsMutual.JSToRedPackets();
	}else{
		var result = JMWebHelp.JSToRedPackets();
	}
#### 9、跳转至账户余额页面
	if(core.app.isAndroid){
		WebviewAndJsMutual.JSToMyAccount();
	}else{
		var result = JMWebHelp.JSToMyAccount();
	}
#### 10、跳转至微营销页面
	if(core.app.isAndroid){
		WebviewAndJsMutual.JSToMyMarketing();
	}else{
		var result = JMWebHelp.JSToMyMarketing();
	}
#### 11、调用native登陆界面
	if(core.app.isAndroid){
		WebviewAndJsMutual.JSActionLogin('loginCallback');
	}else{
		var result = JMWebHelp.JSActionLogin('loginCallback');
	}

	window.loginCallback = function(session){
		console.log(session);
	}
#### 12、测试摄像头【IOS】
	var result = JMWebHelp.JSGetCameraStatue();
#### 13、测试网络【IOS】
	var result = JMWebHelp.JSGetCurrentNetworkState();
#### 14、测试APP提示框【IOS】
	var data1= {
		title:"按钮标题",
		message:"这是H5发给APP的一条消息",
		btnTitle:"确认"
	}
	JMWebHelp.JSInvokeAlertView(JSON.stringify(data1));
