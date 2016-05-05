module.exports = function(grunt) {

	//开发模式
	var isDevelopment = true;
	var url = '';

	if (isDevelopment) {
		url = 'src';
	} else {
		url = 'build';
	}

	//静态资源路径
	var staticUrl = 'mg/static.huizecdn.com/hz/www/';
	/*
	 * @author 
	 * @version 0.0.1
	 * @description Nodejs Grunt配置
	 */

	//导入第三方文件别名
	var otherScripts = grunt.file.read('public/javascripts/src/config/others-scripts-aliases.json');
	otherScripts = JSON.parse(otherScripts);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		/*=====代码检测=====*/
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				eqnull: true,
				browser: true,
				globals: {
					jQuery: true
				},
			},
			defaults: [
				'public/javascripts/src/**/*.js',
				//过滤配置文件
				'!public/javascripts/src/config/**/*.js',
				'!public/javascripts/src/requirejs-config.js'
			],
			// with_overrides: {
			// 	options: {
			// 		curly: false,
			// 		undef: true,
			// 	},
			// 	files: {
			// 		src: ['src/**/*.js', 'src/**/*.js']
			// 	},
			// }
		},
		/*=====清空=====*/
		clean: {
			build: {
				src: ['build/']
			}
		},
		/*=====ZIP压缩=====*/
		zip: {
			//打包前端静态资源
			mg: {
				router: function(filepath) {
					var result = staticUrl;
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					result = result.replace('/public/javascripts/', '/');
					console.log('正在打包文件', result);
					return result;
				},
				src: ['public/javascripts/build/**', '!public/javascripts/build/config/**'],
				dest: 'mg.zip'
			}
		},
		/*=====MD5加版本号=====*/
		cachebuster: {
			build: {
				options: {
					banner: '/* 自动添加版本号 */\n',
					format: 'js',
					basedir: '',
					formatter: function(hashes) {

						var banner = '/*\n  Requirejs配置文件\n  最后更新时间：' + grunt.template.today("yyyy-mm-dd hh:mm:ss ") + ' \n*/\n',
							basePath = '//static.huizecdn.com/js/hz/www/' + url + '/', //基础路径
							output = banner,
							tabSize = '    ',
							fixed = otherScripts.files.map(function(item) {
								return tabSize + item;
							});

						output += 'var fileVersion = {\n';
						output += fixed.join(',\n') + ',\n'; //添加固定的别名
						for (var filepath in hashes) {
							var start = filepath.lastIndexOf('\\') + 1,
								end = filepath.lastIndexOf('.'),
								fileName = filepath.substring(start, end), //获取文件名
								path = basePath + filepath; //拼接路径
							path = path.replace(/\\/g, '/');
							path = path.replace('public/javascripts/', '');
							output += tabSize + '"' + fileName + '": "' + path + '?v=' + hashes[filepath] + '",\n'; //添加Hashes值
						}
						output += '};';

						return output;
					}
				},
				src: [
					'public/javascripts/src/**/*.js',
					//过滤配置文件
					'!public/javascripts/src/config/**',
					'!public/javascripts/src/requirejs-config.js',
					'!public/javascripts/build/**'

				],
				dest: 'public/javascripts/src/config/requirejs-aliases.js'
			}
		},
		/*=====压缩=====*/
		uglify: {
			options: {
				//sourceMap: true,
				sourceMapName: 'build/sourcemap.map',
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %> */',
				//beautify: true, //是否有格式
				beautify: {
					width: 80,
					//beautify: true
				},
				report: 'gzip',
				compress: {
					global_defs: {
						"DEBUG": false
					},
					dead_code: true,
					drop_console: true //去掉console
				}
			},
			build: {
				// files: {
				// 	'build/output.min.js': ['src/*.js']
				// }
				files: [{
					expand: true,
					cwd: 'public/javascripts/src',
					src: ['**/*.js', '!build/**'],
					dest: 'public/javascripts/build'
				}]
			}
		},
		/*=====合并脚本=====*/
		concat: {
			config: { //合并配置文件
				src: [
					'public/javascripts/src/config/requirejs-aliases.js',
					'public/javascripts/src/config/requirejs-shim.js'
				],
				dest: 'public/javascripts/src/requirejs-config.js'
			}
		}
	});

	/*
	 * @author 
	 * @version 0.0.1
	 * @description 载插件模块
	 */

	//zip

	/*=====合并脚本=====*/
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-cachebuster');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-zip');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('default', ['jshint:defaults', 'cachebuster', 'concat:config', 'uglify:build', 'zip:mg']);
	//grunt.registerTask('build', ['jshint:defaults', 'cachebuster', 'concat:config']);
};