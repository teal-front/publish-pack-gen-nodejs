/**
 * 分享组件.
 */
define(["jquery","underscore","exports","require","module"],function($,_,exports,require,module) {
    "use strict";
    var SharePanel = function () {
        SharePanel.prototype.init.apply(this, arguments);
    };

    var data = {
        sina: {
            text: "新浪微博",
            apiurl: "http://v.t.sina.com.cn/share/share.php",
            url: "url",
            title: encodeURIComponent("#精品推荐#你值得拥有"),
            shareIcon:"share-sina-icon",
            pic:"pic"
        },
        zone: {
            text: "QQ空间",
            apiurl: "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey",
            url: "url",
            title: encodeURIComponent("#精品推荐#你值得拥有"),
            shareIcon:"share-qz-icon",
            pic: "pics"
        }
    };
    var qqSettings = {
            url : window.location.href,
            title : encodeURIComponent($(".product-title").text()),
            site : "http://www.huize.com"
    };
    SharePanel.prototype = {
        init: function (config) {
            var shareBtn = $("#sharePanelBtn");
            var html = config.htmlUrl || "require-text!/html/public/share-panel.html";
            var pageId = config.pageId || 0;
            if (config.htmlUrl) {
                qqSettings.title = config.summary;
            }
            require([html, "jquery-prompt"], function (html, jqpromt) {
                var items = config.items;
                var temp = [];
                for (var i = 0; i < items.length; i++) {
                    var shareItem = data[items[i]];
                    shareItem.summary = encodeURIComponent(config.summary);
                    shareItem.picture=encodeURIComponent("//img.huizecdn.com/hz/www/page/payview/share/slogo.png");
                    if(items[i]==="sina"){//新浪微博处理
                        shareItem.title=encodeURIComponent(config.summary);
                    }
                    temp.push(shareItem);
                }
                shareBtn.attr("data-prompt-html", _.template(html)({datas: temp,productId:config.productId,planId:config.planId,shareUrl: encodeURIComponent(config.url),qqSettings:qqSettings,pageId:pageId}));
                shareBtn.attr("data-prompt-position", "bottom");
                shareBtn.prompt();
            });

        },
        initAction: function () {
            $("sharePanel").delegate("a", "click", function () {
                var type = $(this).attr("type");

            });
        }
    };

    module.exports = SharePanel;
});