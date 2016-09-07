/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["insure","helper"],function(a,b){"use strict";var c=function(){var b,c=a.prototype.getQueryValue("dev");try{b="true"===localStorage.getItem("dev")}catch(d){}return c&&(b="true"===c),b},d={init:function(){this.insure()},insure:function(){var d=b.url.getUrlVar("insureNumber"),e="/api/insurance-slips/"+d+"/page-info",f={el:$("#insureBox"),platform:1,getServiceTimeUrl:"/api/tools/date/now",getDataUrl:e,postUrl:"/",parseExcelUrl:"/api/insurance-slips/groups/parse-excel",uploadUrl:"/api/upload",uploadSWFUrl:"/swf/Uploader.swf",inheritInt:function(){var a=this;a.destinationInt()},success:function(){this.info("所有数据",this.data)},error:function(a){this.message.show(a,"error",1e4),this.info(a)},debug:c()},g=new a(f);window.myInsure=window.hz=g}};return d});