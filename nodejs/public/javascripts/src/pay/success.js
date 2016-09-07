/**
 * Created by hz16032113 on 2016/4/11.
 */
define(function(){
    "use strict";
    var Success = {
        init : function(){
            this.initData();
            this.render();
            this.initEvents();
        },
        render : function(){
            $("#kfLink").attr("href","http://kefu.hzins.com/chat?domain=hzins&businessType=Xm4FWr0dncw&referrer="  + encodeURIComponent(window.location.href));
        },
        command : {
            share : function(shareObj){
                var
                    o = shareObj || {},
                    url = "";
                    switch (o.type){
                        case "qqweibo" :
                            url += 'http://v.t.qq.com/share/share.php?title=' + o.content + '&url=' + o.url + '&pic=' + o.picurl.join("|");
                            break;
                        case "qqzone" :
                            url += 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?desc=&summary=' + o.title + '&url=' + o.url + '&pics=' + o.picurl.join("|") + "&title=" + $("div[data-product-title]").data("product-title") || "";
                            break;
                        case "sinaweibo" :
                            url += 'http://v.t.sina.com.cn/share/share.php?title=' + o.title + '&url=' + o.url + '&content=utf-8&sourceUrl=' + o.url + '&pic=' + o.picurl.join("||") + "&searchPic=false&appkey=3813649018";
                    }
                var transferWindow = window.open('about:blank');
                transferWindow.location.href = encodeURI(url);
            }
        },
        initData : function(){
            this.data.share.content = $(".pay-success-share-area").val();
            this.data.share.url = $(".share-others-content .share-link").text();
            $(".pay-success-share-pic").each(function(){
                if($(this).hasClass("pay-success-share-pic-selected")){
                    Success.data.share.pic["pic_" + $(this).index()] = $(this).find("img").attr("src");
                }
            });
        },
        data : {
            share : {
                type : "sinaweibo",
                content : "",
                url : "",
                pic : {
                }
            }
        },
        initEvents : function(){
            var P = this;
            $(".pay-success-share-item").click(function(){
                var index = $(this).index();
                $(this).siblings(".pay-success-share-item").removeClass("active");
                $(this).addClass("active");
                if($(this).hasClass("wx-item")){
                    $(".share-others-content").hide();
                    $(".share-wx-content").show();
                    $(".pay-success-share-foot").hide();
                }
                else{
                    $(".pay-success-share-foot").show();
                    $(".share-others-content").show();
                    $(".share-wx-content").hide();
                    P.data.share.type = index === 1 ? "sinaweibo" : (index === 5 ? "qqzone" : "qqweibo");
                }
            });
            $(".pay-success-share-pic").click(function(){
                var
                    localData = P.data,
                    isSelected = $(this).hasClass("pay-success-share-pic-selected");
                if(!isSelected){
                    localData.share.pic["pic_" + $(this).index()] = $(this).find("img").attr("src");
                }
                else{
                    localData.share.pic["pic_" + $(this).index()] = "";
                }
                $(this).toggleClass("pay-success-share-pic-selected");
                var selectedLength = $(".pay-success-share-pic-selected").length;
                $(".share-pic-selected").text(selectedLength);
                $(".share-pic-left").text(3 - selectedLength);
            });
            $("#share").click(function(){
                var
                    shareData = P.data.share,
                    picArray = [];
                $.each(shareData.pic,function(i,v){
                    picArray.push(v);
                });
                P.command.share(
                    {
                        type : shareData.type,
                        title : shareData.content,
                        content : shareData.content,
                        url : shareData.url,
                        picurl : picArray
                    }
                );
            });
        }
    }
    return Success;
})