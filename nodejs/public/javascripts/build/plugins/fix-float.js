/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(function(a,b,c){"use strict";var d=function(){d.prototype.init.apply(this,arguments)};d.prototype={init:function(a){var b=a.el,c=a.fixPanel;if(0!==b.length&&0!==c.length){var d=function(){var d=document.body.scrollTop||document.documentElement.scrollTop,e=document.documentElement.clientHeight,f=c.offset().top-parseInt(c.css("padding-top"));a.fixbuttom?f+c.outerHeight()-d>e?b.addClass(a.fixClass):b.removeClass(a.fixClass):d>=f?(a.callback&&a.callback("add"),b.addClass(a.fixClass)):(a.callback&&a.callback("remove"),b.removeClass(a.fixClass))};$(window).bind("scroll",d),d()}}},c.exports=d});