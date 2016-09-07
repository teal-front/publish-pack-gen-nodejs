/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["underscore","message"],function(a,b){"use strict";var c={init:function(){c.message=new Message,this.initEvents()},initEvents:function(){$("#jobSearchBtn").click(function(){c.command.search($.trim($("#searchJob").val()||""))})},command:{search:function(a){if(""!==a){c.message.show("正在搜索...","loading");var b=0,d="",e=new RegExp(a.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)"),"g");$(".search-keywords").text(a);for(var f=$("#jobDetails td"),g=f.length,h={},i={},j=0;g>j;j++){var k=f.eq(j);if(k.text().indexOf(a)>-1){if(k.find(".highlight").text()===a){b=$(".jobs-count").text();break}d=k.text().replace(e,function(a){return b++,"<strong class='highlight'>"+a+"</strong>"}),h[j]=d}else k.find(".highlight").length>0&&(d=k.html().replace(/<[^>]+>/g,""),i[j]=d)}for(var l in h)f.eq(l).html(h[l]);for(var l in i)f.eq(l).html(i[l]);$("#searchKeywords").text(a),0!==b?($("#searchTotal").find(".jobs-count").text(b),$("#searchEmpty").hide(),$("#searchTotal").show()):($("#searchTotal").hide(),$("#searchEmpty").show()),c.message.hide(),$("#searchTipTitle").hide(),$(".job-search-content").addClass("it-non-class")}}}};return c});