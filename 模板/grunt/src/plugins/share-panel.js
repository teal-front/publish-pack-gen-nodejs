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
            title: "title",
            shareIcon:"share-sina-icon",
            pic: "pic"
        },
        zone: {
            text: "QQ空间",
            apiurl: "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey",
            url: "url",
            title: "title",
            shareIcon:"share-qz-icon",
            pic: "pics"
        }
    };

    SharePanel.prototype = {
        init: function (config) {
            var shareBtn = $("#sharePanelBtn");
            require(["require-text!/html/public/share-panel.html", "jquery-prompt"], function (html, jqpromt) {
                var items = config.items;
                var temp = [];
                for (var i = 0; i < items.length; i++) {
                    var shareItem = data[items[i]];
                    shareItem.summary = config.summary;
                    temp.push(shareItem);
                }
                shareBtn.attr("data-prompt-html", _.template(html)({datas: temp, shareUrl: config.url}));
                shareBtn.attr("data-prompt-position", "bottom");
                shareBtn.prompt();
            });

        },
        initAction: function () {
            $("sharePanel").delegate("a", "click", function () {
                var type = $(this).attr("type");
                var shareobj = data[type];

            });
        }
    };

    module.exports = SharePanel;
});