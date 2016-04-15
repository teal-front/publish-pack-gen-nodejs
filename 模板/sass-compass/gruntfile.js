module.exports = function(grunt) {

	/*
	 * @author 
	 * @version 0.0.1
	 * @description Grunt配置
	 */

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'), //导入JSON
		//清空
		clean: {
			build: {
				src: ['build/']
			}
		},
		//ZIP压缩
		zip: {
			//打包前端静态资源
			res: {
				//basedir: '/',
				router: function(filepath) {
					var result = 'mg/static.huizecdn.com/hz/www/';
					filepath.replace('build', '');
					//filepath.replace('node_modules', '');
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					return result;
				},
				src: ['stylesheets/**'],
				dest: 'build/mg.zip'
			}
		}
	});

	/*
	 * @author 
	 * @version 0.0.1
	 * @description 载插件模块
	 */

	//zip
	grunt.loadNpmTasks('grunt-zip');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('default', ['clean', 'zip']);
};