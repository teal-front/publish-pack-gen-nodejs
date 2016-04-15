var utils = require('./utils');
var ShoppingCartService = require('../services/shopping-cart-service');

var __combineShoppingCart = function (req, res, next) {
    utils.checkLoginState(req)
        .then(function (result) {
            if (result.result) {
                var userId = req.session.user.UserId;
                var insuranceSlipsIds = req.cookies.InsureNums;

                if (userId && insuranceSlipsIds) {
                    insuranceSlipsIds = insuranceSlipsIds.split(',');
                    ShoppingCartService.combine(userId, insuranceSlipsIds)
                        .then(function (result) {
                            if (result.code === 0) {
                                next();
                            } else {
                                console.log('合并购物车失败');
                                next();
                            }
                        });
                } else {
                    next();
                }
            } else {
                next();
            }
        })
        .catch(function (err) {
            console.error(err);
            next();
        });
};

module.exports = {
    combineShoppingCart: __combineShoppingCart
};
