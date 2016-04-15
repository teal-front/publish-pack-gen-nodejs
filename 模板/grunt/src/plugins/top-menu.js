/**
 *顶部菜单.
 */
define(["jquery","underscore","exports","require","module","helper","layer"],function($,_,exports,require,module,helper,layer) {
    "use strict";
    var TopMenu = function () {
        TopMenu.prototype.init.apply(this, arguments);
    };
    TopMenu.prototype = {
        personInfo:{},
        init: function () {
            var self = this;
            require(["require-text!/html/public/top-menu.html"], function (html) {//加载模板
                helper.request.getCrossJson({url: "//passport.huize.com/Signin/GetCustomerStateData4Jsonp"}, function (data) {
                    $(".top-nav-wrap").html(_.template(html)(data));
                    self.initActions();
                    if(data.CustomerCode!=="0") {
                        window.hzins={};//储存共享信息
                        window.hzins.login=true;//已经登陆
                        helper.request.getCrossJson({url: "//i.hzins.com/MyFavorite/GetMiniMyFavorite4Jsonp"}, function (data) {
                            require(["require-text!/html/public/top-menu-favorite.html"], function (html) {//加载收藏列表
                                var them=_.template(html)(data);
                                $("#favoriteItems").html(_.template(html)(data));
                            });
                        });
                    }
                });


            });
        },
        initActions:function() {  //顶部菜单栏交互
            $(".account-item,#myinfo li").bind("mouseover", function () {
                $(".drop-menu-item-body", this).removeClass("fn-hide");
                $(this).addClass("quick-menu-item-hover");
            });
            $(".account-item,#myinfo li").bind("mouseout", function () {
                $(".drop-menu-item-body", this).addClass("fn-hide");
                $(this).removeClass("quick-menu-item-hover");
            });
            $("#favoriteItems").delegate("a['rel=delFav']","click",function(){//删除收藏
                helper.request.getCrossJson({url:"//i.hzins.com/myfavorite/Delete",data:{productProtectPlanId:$(this).attr("pid")}},function(data){
                     if(data.IsSuccess){
                         layer.msg('删除收藏');
                     }
                });
            });
        }
    };

    module.exports = TopMenu;
});
