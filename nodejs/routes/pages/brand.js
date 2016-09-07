var express = require('express');
var _ = require('lodash');
var pub = require('../../lib/public');
var constants = require('../../lib/constants');
var BrandService = require('../../lib/services/brand-service');
var ProductService = require('../../lib/services/product-service');
var logger = require('../../lib/log').logger;
var Validator = require('../../lib/validator');
var InvalidError = require('../../lib/errors/invalid');
var NotFoundError = require('../../lib/errors/not-found');
var router = express.Router();

// 保险公司列表（保险品牌）
router.get('/list', function(req, res, next) {
    var sendResponse = function(records) {
        var obj = {
            layout: 'layout/page/layout-brand',
            title: constants.BRAND_LIST_TDK.TITLE,
            keyword: constants.BRAND_LIST_TDK.KEYWORDS,
            description: constants.BRAND_LIST_TDK.DESCRIPTION,
            data: records,
            jsName: 'brand-list',
            hasH5Page: true
        };

        // res.render('brand/brand-list', pub.renderData(obj));
        res.renderNormal('brand/brand-list', obj);
    };

    var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        next(error);
    };

    BrandService.findAll()
        .then(sendResponse)
        .catch(handleError);
});

// 保险公司产品列表页
router.get('/detail/:id', function(req, res, next) {
    var companyId = req.params.id;
    var categoryId = req.params.categoryId || 0;
    var page = req.query.page || 1;
    var pageSize = constants.COMPANY_PRODUCT_LIST_PAGE_SIZE;
    var cateList = [];
    var categoryName = '';
    var companyName = '';

    var sendResponse = function(results) {
        var record = results[0];
        var companyPageInfo = results[1].company;
        var categoryTreeDTO = results[1].categorytree;
        var allCompany = results[2];

        if (!companyPageInfo) {
            throw new NotFoundError();
        }

        var RenderProducts = require('../../lib/product-list');
        var rederProducts = new RenderProducts({ //产品列表
            productList: record.rows
        });
        companyName = companyPageInfo.simpName || '';
        // categoryTreeDTO.forEach(function(item, i) {
        //     if (item.id === categoryId) {
        //         categoryName = item.name;
        //     } else {
        //         var childrenList = item.childrenList || [];
        //         childrenList.forEach(function(item1, j) {
        //             if (item1.id === categoryId) {
        //                 categoryName = item1.name;
        //             }
        //         });
        //     }
        // });


        var title = companyName + categoryName + '-保险产品在线购买-慧择保险网';
        var keywords = companyName + categoryName + '产品,' + companyName + categoryName + ',' + companyName + categoryName + '产品在线购买';
        var description = '慧择保险网提供' + companyName + categoryName + '产品在线购买,网上3分钟轻松投保,选择多实惠多!免费注册会员,享受会员价!购买' + companyName + categoryName + '产品就上慧择网！';

        var obj = {
            layout: 'layout/page/layout-product-list',
            companyPageInfo: companyPageInfo,
            categoryTreeDTO: categoryTreeDTO,
            products: record,
            companyId: companyId,
            categoryId: categoryId,
            pageIndex: page,
            allCompany: allCompany,
            title: title,
            keyword: keywords,
            description: description,
            productListHtml: rederProducts.renderProductsList(),
            jsName: 'brand-product-list',
            hasH5Page: true
        };

        res.renderNormal('brand/brand-product-list', obj);
    };
    var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        if (error instanceof InvalidError) {
            next();
            return;
        }

        if (error instanceof NotFoundError) {
            next();
            return;
        }

        next(error);
    };

    new Validator(companyId).isNotEmpty().isNumber().validate()
        .then(function (result) {
            return Promise.all([
                BrandService.fetchProducts(result, cateList, +page, pageSize),
                BrandService.fetchCompanyPageInfo(result),
                BrandService.findAll()
            ]);
        })
        .then(sendResponse)
        .catch(handleError);
});

// 老保险公司产品列表页
router.get('/detail/:companyId/:categoryId', function(req, res, next) {
    var companyId = req.params.companyId;
    var categoryId = req.params.categoryId || 0;
    var page = req.query.page || 1;
    var pageSize = constants.COMPANY_PRODUCT_LIST_PAGE_SIZE;
    var cateList = [];
    var categoryName = '';
    var companyName = '';
    // cateList.push(categoryId);

    var sendResponse = function(results) {
        var record = results[0];
        var companyPageInfo = results[2].company;
        var categoryTreeDTO = results[2].categorytree || [];
        var allCompany = results[1];

        var RenderProducts = require('../../lib/product-list');
        var rederProducts = new RenderProducts({ //产品列表
            productList: record.rows
        });

        companyName = companyPageInfo.simpName || '';

        categoryTreeDTO.forEach(function (item, i) {
            if (item.id === ~~categoryId) {
                categoryName = item.name;
            } else {
                var childrenList = item.childrenList || [];
                childrenList.forEach(function (item1, j) {
                    if (item1.id === ~~categoryId) {
                        categoryName = item.name+item1.name;
                    }
                });
            }
        });


        var title = companyName + categoryName + '-保险产品在线购买-慧择保险网';
        var keywords = companyName + categoryName + '产品,' + companyName + categoryName + ',' + companyName + categoryName + '产品在线购买';
        var description = '慧择保险网提供' + companyName + categoryName + '产品在线购买,网上3分钟轻松投保,选择多实惠多!免费注册会员,享受会员价!购买' + companyName + categoryName + '产品就上慧择网！';

        var obj = {
            layout: 'layout/page/layout-product-list',
            companyPageInfo: companyPageInfo,
            categoryTreeDTO: categoryTreeDTO,
            products: record,
            companyId: companyId,
            categoryId: categoryId,
            pageIndex: page,
            allCompany: allCompany,
            productListHtml: rederProducts.renderProductsList(),
            title: title,
            keyword: keywords,
            description: description,
            jsName: 'brand-product-list'
        };

        res.renderNormal('brand/brand-product-list', obj);
    };
    var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        if (error instanceof InvalidError) {
            next();
            return;
        }
        
        if (error instanceof NotFoundError) {
            next();
            return;
        }

        next(error);
    };

    Promise.all([
            new Validator(companyId).isNotEmpty().isNumber().validate(),
            new Validator(categoryId).isNotEmpty().isNumber().validate()
        ])
        .then(function (params) {
            companyId = params[0];
            categoryId = params[1];

            return  BrandService.fetchCompanyPageInfo(companyId)
                .then(function (result) {
                    if (!result.company) {
                        throw new NotFoundError();
                    }

                    var categoryTreeDTO = result.categorytree;
                    var isBigCate = false;

                    categoryTreeDTO.forEach(function (bigCate, i) {
                        if (~~bigCate.id === ~~categoryId) {
                            isBigCate = true;
                            var childrenList = bigCate.childrenList || [];
                            childrenList.forEach(function (smallCate) {
                                if (smallCate.id) {
                                    cateList.push(smallCate.id);
                                }
                            });
                        }
                    });

                    if (!isBigCate && categoryId) {
                        cateList.push(categoryId);
                    }

                    return Promise.all([
                            BrandService.fetchProducts(companyId, cateList, +page, pageSize),
                            BrandService.findAll()
                        ])
                        .then(function (results) {
                            results.push(result);
                            return results;
                        });
                });
        })
        .then(sendResponse)
        .catch(handleError);
});

module.exports = router;