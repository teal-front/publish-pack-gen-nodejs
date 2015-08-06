### 线上BUG收集


#### 1、出行目的地 保存按钮第一次点击无效，第二次才生效的BUG
>
原因：T.PagePannel.js使用了CSS3的效果，`div.style.webkitTransform`
解决：
1. T.PagePannel.js  注释`div.style.webkitTransform`，可使用`div.style.transform`
2. T.js T.fade.show等方法需要兼容`div.style.transform`

#### 2、产品详情页面部分产品打开后页面一片空白
原因：P.utils.getInsDetailHtml方法下Remark字段未做判断是否为空对象
解决：
````
var Remark = ProtectItemListCache[item.id].Remark || "";    
改成
var Remark = (ProtectItemListCache[item.id] || {}).Remark || "";
````
