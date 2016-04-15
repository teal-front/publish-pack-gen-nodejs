define(['insure'], function(Insure) {
	/*
	 * @constructor insure
	 * @author 
	 * @version 0.0.1
	 * @description 投保页面
	 */
	var insure = {
		init: function() {
			this.insure();
		},
		insure: function() {
			/*			 
			 * @author 
			 * @version 0.0.1
			 * @description 实例化投保
			 */
			var getDataUrl = '/insurance-slips/20160414000034/page-info';
			var myInsure = new Insure({
				el: $('#insureBox'),
				getDataUrl: getDataUrl, //获取数据URL
				debug: true //调试模式-显示打印信息
			});
			window.myInsure = myInsure; //开发调试用
			try {
				console.log(myInsure);
			} catch (ev) {

			}
		}
	};
	return insure;
});