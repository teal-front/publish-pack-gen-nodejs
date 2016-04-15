/**
 * 子菜单组件
 */
define(function(require,exports,module) {
    "use strict";
    var SubMenu = function () {
        SubMenu.prototype.init.apply(this, arguments);
    };

    SubMenu.prototype = {
        init: function () {
            var context = $("#submenulist");
            context.delegate("li", "mouseover", function () {//子菜单显示切换
                var siblingDiv = $("a", this).siblings("div");
                $("a",this).addClass("main-menu-link-hover");
                if (siblingDiv.length > 0) {
                    siblingDiv.removeClass("fn-hide");
                }
            });
            context.delegate("li", "mouseout", function () {
                var siblingDiv = $("a", this).siblings("div");
                $("a",this).removeClass("main-menu-link-hover");
                if (siblingDiv.length > 0) {
                    siblingDiv.addClass("fn-hide");
                }
            });
        }
    };

    module.exports = SubMenu;
});