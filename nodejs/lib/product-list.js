/**
 ** @constructor RenderProducts
 ** @author CC-Cai
 ** @version 0.0.1
 ** @description 渲染产品列表页
 **/
var _ = require('lodash');
var Base = function() {};
Base.prototype = {

};
var RenderProducts = function(options) {
	var ops = options || {};
	this.renderData = {};
	for (var key in ops) {
		this[key] = ops[key];
	}
	this.setData();
};

RenderProducts.prototype = {
	setData: function() {
		var _this = this;
		_this.productList = _this.productList || [];
	},
	renderProductsList: function() {
		var _this = this,
			productList = _this.productList || [],
			result = [];

		productList.forEach(function(item) {
			result.push(_this.renderProductItem(item));
		});
		if (productList.length < 1) {
			result.push('<p class="f16 pt30 pb30 producct-empty">暂时没有相关产品</p>');
		}

		return result.join('');
	},
	renderProductItem: function(product) { //渲染单个产品

		var _this = this,
			result = [];
		result.push('<div class="hz-product-item">');
		result.push(_this.renderProductInfo(product));
		result.push(_this.renderProductDataInfo(product));
		result.push('</div>');
		return result.join('');
	},
	renderProductInfo: function(product) { //渲染产品信息
		var _this = this,
			result = [],
			productUrl = '//www.huize.com/product/detail-' + product.proProductId + '.html?DProtectPlanId=' + (product.proProductPlanId || product.planId),
			features = product.features || [], //特征
			protectTrialItemList = product.protectTrialItemList || [], //保障项目
			promises = product.promises || []; //卖点
		var planList;
		try {
			planList = JSON.parse(product.planDetail);
		} catch (error) {}

		if (!planList) {
			try {
				planList = JSON.parse('{' + product.planDetail || '' + '}');
			} catch (error) {
				planList = {};
			}
		}
		result.push('<div class="hz-product-info">');
		result.push('<div class="hz-product-head">');
		result.push('<a class="company-logo fr" target="_blank" href="//www.huize.com/brand/detail/' + product.companyId + '">');
		result.push('<img src="' + product.companyLogoUrl + '" alt="' + product.simpleName + '" title="' + product.simpleName +  '"');
		result.push('</a>');
		result.push('<h2 class="hz-product-title">');
		result.push('<a class="f24" href="' + productUrl + '" target="_blank">' + product.productName + product.planName + '</a>');
		result.push('</h2>');
		result.push('</div>');

		result.push('<div class="hz-product-body">');
		if (features.length) { //特征
			result.push('<div class="post-tag-wrap">');
			features.forEach(function(item, i) {
				item.content = item.content.replace(/<[^>]+(>?)/g,"");
				if (i < 4) {
					result.push('<div class="post-tag">' + item.content + '</div>');
				}
			});
			result.push('</div>');
		}
		result.push('<div class="product-item-content">');
		if (protectTrialItemList.length) { //保障项目
			result.push('<ul class="hz-list lh24">');
			protectTrialItemList.forEach(function(item, i) {
				if (i < 4) {
					var protectValue = '';
					if (item.fullPremium) {
						protectValue = item.fullPremium + (item.showUnit ? item.showUnit : "");
					} else {
						if (item.relateCoverageId) {
							try {
								var relateCoverageValue = (_.keyBy(planList.restrictGenes, 'protectItemId')[item.relateCoverageId].defaultValue);
								protectValue = relateCoverageValue ? (relateCoverageValue + (item.showUnit ? item.showUnit : "")) : '不投保';
							} catch (error) {
								protectValue = '不投保';
							}
						} else {
							protectValue = '不投保';
						}
					}
					result.push('<li class="hz-list-item">');
					result.push('<span class="hz-list-title">' + item.name + '</span>');
					result.push('<span class="hz-list-content">' + protectValue + '</span>');
					result.push('</li>');
				}
			});
			result.push('</ul>');
		}
		if (promises.length) {
			result.push('<div class="mt10 impression-box">');
			promises.forEach(function(item, i) {
				if (i < 4) {
					result.push(' <div class="impression-item"><i class="iconfont primary-color f18 mr10">&#xe725;</i>' + item.promiseName + '</div>');
				}
			});
			result.push('</div>');
		}
		result.push('</div>');

		result.push('</div>');

		result.push('</div>');

		return result.join('');
	},
	renderProductDataInfo: function(product) { //渲染产品数据信息
		var _this = this,
			result = [],
			productUrl = '//www.huize.com/product/detail-' + product.proProductId + '.html?DProtectPlanId=' + (product.proProductPlanId || product.planId),
			saleCount = product.saleCount || 0,
			commentCount = product.commentCount || 0,
			preferentialPrice = product.preferentialPrice || product.price,
			price = product.price;
		result.push('<div class="hz-product-meta tac">');
		result.push('<p class="pt40 f18 primary-color">¥<span class="f30">' + (this.module === 'search' ? parseFloat(preferentialPrice || 0) : parseFloat(preferentialPrice || 0) / 100).toFixed(2) + '</span></p>');
		if (preferentialPrice !== price) {
			result.push('<del class="fc9">原价：' + (this.module === 'search'? parseFloat(price): parseFloat(price) / 100).toFixed(2) + '</del>');
		}
		result.push('<div class="pt5 pb15">');
		result.push('<a class="hz-button hz-button-primary button-view" rel="nofollow" target="_blank" href="' + productUrl + '">查看详情</a>');
		result.push('</div>');
		result.push('<p class="f14">销量：' + saleCount + '</p>');
		result.push('<p class="f14">评论：' + commentCount + '</p>');
		result.push('<div class="hz-check-item mt25 inline-block add-compare" productId="' + product.proProductId + '"  planId="' + (product.proProductPlanId || product.planId) + '"><i class="hz-check-icon"></i><span class="hz-check-text">加入对比</span></div>');
		result.push('</div>');

		return result.join('');
	},
};
//继承公共方法
for (var key in Base.prototype) {
	RenderProducts.prototype[key] = Base.prototype[key];
}



module.exports = RenderProducts;