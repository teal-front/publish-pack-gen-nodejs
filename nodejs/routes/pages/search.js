/**
 * Created by hz16032113 on 2016/6/29.
 */
var express = require("express");
var router = express.Router();
var pub = require('../../lib/public');
var ProductService = require('../../lib/services/product-service');
var RenderProducts = require('../../lib/product-list');
var logger = require('../../lib/log').logger;

router.get(/^\/p-(\d+)-([^-]+)-(\d+)-(\d+)-([01])(?:-(\d+))?$/,function(req,res,next){
    var
        routerParams = req.params;
    var searchParams = {
        productQuery : routerParams[1],
        platform : 11,
        sort : routerParams[3],
        sortflag : routerParams[4],
        pageSize : 10,
        pageNo : routerParams[0] - 1
    };
    if(routerParams[2]){
        searchParams.categoryId = routerParams[2];
    }
    if(routerParams[5]){
        searchParams.companyId = routerParams[5];
    }

    var sendRespone = function(data){
        var
            searchData = data[0] || {};
        var rederProducts= new RenderProducts({   //产品列表
            productList: searchData.simpleProducts || [],
            module : 'search'
        });
        searchData.productListHtml = rederProducts.renderProductsList();
        searchData.searchParams = searchParams;

        var obj = {
            layout: 'layout/page/layout-product-list',
            jsName: 'search',
            title: (searchParams.productQuery + "") + "_保险【买什么好,如何买,条款/费用/评价】-慧择保险网",
            keyword: searchParams.productQuery+"_保险",
            description: "慧择保险网提供" + (searchParams.productQuery) + "相关的保险产品,并同时提供此类保险产品的详细产品信息和保险条款,用户评价,保险价格等。您可以从销量,价格,评价,上架时间等不同方面对多个" + (searchParams.productQuery) + "保险产品进行详细分析,对比。并同时可在线购买最适合您的保险产品。为用户提供7*24小时的全天候贴心服务。",
            data : {
                searchData : searchData,
                rankListData : data[1] || [],
                shellListData : data[2] || [],
                commentListData : data[3] || [],
                recommendListData : data[4] || []
            }
        };

        // res.render('search', pub.renderData(obj));
        res.renderNormal('search', obj);
    };

    var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
        next(error);
    };

    Promise.all([
            ProductService.fetchPcProductResult([searchParams]),
            ProductService.fetchGetProductBrowseRunkingList([routerParams[2] || 21,5]),
            ProductService.fetchGetProductShellRunkingList([routerParams[2] || 21,5]),
            ProductService.fetchGetProductCommentList([routerParams[2] || 21,5]),
            ProductService.fetchGetArticles([searchParams.productQuery,10])
        ])
        .then(sendRespone)
        .catch(handleError);
});

module.exports = router;