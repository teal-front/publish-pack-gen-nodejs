//公用文件
var isDev = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test');
//全局属性
var config = {
	title: '慧择保险网-中国最大保险电子商务平台,网上买保险最佳选择!',
	// keyword: '买保险,保险,保险网,网上买保险,网上投保,在线投保,网络保险,保险电子商务,慧择保险网',
	keyword: '',
	// description: '慧择保险网是一个综合网络保险平台，提供数十家全国知名保险公司产品网上投保，专业、诚信，是您可以信赖的保险网，买保险就上慧择网！',
	description: '',
	tel: '4006 366 366',
	mainHost: 'http://www.huize.com/',
	mainHostMobile: 'http://m.huize.com/',
	oldMainHost: 'http://www.hzins.com/',
	imageHost: '//img.huizecdn.com/',
	imagePath: '//img.huizecdn.com/',
	// imagePath: isDev ? '/images/' : '//img.huizecdn.com/hz/www/',
	cssHost: '//static.huizecdn.com/',
	cssPath: isDev ? '/stylesheets/src/' : '//static.huizecdn.com/css/hz/www/build/',
	jsHost: '//static.huizecdn.com/',
	jsName: '',
	cdnHost: '//static.huizecdn.com',
	cssVersion: '1.1.3',
	jsVersion: '1.1.3',
	importCss: function(arr) {
		var _this = this,
			cssArr = arr || [],
			result = [];
		arr.forEach(function(item) {
			result.push('<link rel="stylesheet" href="' + item + '?' + _this.cssVersion + '" />');
		});
		return result.join('');
	},
	substr: function(str, num, symbol) { //截取字符串
		var _str = str || '',
			_num = num || 0,
			_symbol = symbol || '...',
			result = '';
		if (num && _str.length > num) {
			result = _str.slice(0, num) + _symbol;
		} else {
			result = str;
		}
		return result;
	}
};
var public = {
	renderData: function(obj) {
		var _obj = obj || {};
		// for (key in _obj) {
		// 	config[key] = _obj[key];
		// }
		var result =  Object.assign({}, config, _obj);
		return result;
	}
};

module.exports = public;