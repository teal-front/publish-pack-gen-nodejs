module.exports = function(grunt) {

	/*
	 * @author 
	 * @version 0.0.1
	 * @description Grunt配置
	 */

	var isDevelopment = true; //开发模式
	var url = '';
	if (isDevelopment) {
		url = 'src';
	} else {
		url = 'build';
	}

	/*
	 * @author 
	 * @version 0.0.1
	 * @description 非项目中的文件或第三文件文件
	 */
	var requireMap = ['"jquery": "//static.huizecdn.com/js/libs/jquery/1.8.0/jquery.min"',
		'"underscore": "//static.huizecdn.com/js/libs/underscore/1.8.3/underscore.min"',
		'"my-calendar": "//static.huizecdn.com/js/plugins/my-calendar/build/my-calendar.min"',
		'"require-text": "//static.huizecdn.com/js/plugins/require-text/text.min"',
		'"require-css": "//static.huizecdn.com/js/plugins/require-css/css.min"',
		'"jquery-tab": "//static.huizecdn.com/js/plugins/jquery-tab/build/jquery-tab"',
		'"jquery-placeholder": "//static.huizecdn.com/js/plugins/placeholder/build/jquery-placeholder"',
		'"base": "//static.huizecdn.com/js/base/src/base"',
		'"layer":"//static.huizecdn.com/js/plugins/layer/1.9.3/layer"',
		'"jquery-prompt":"//static.huizecdn.com/js/plugins/jquery-prompt/build/jquery-prompt"',
		'"kkpager":"//static.huizecdn.com/js/plugins/kkpager.min"',
		'"es5-shim":"http://static.huizecdn.com/js/plugins/es5-shim/es5-shim.min"',
		'"my-calendar":"//static.huizecdn.com/js/plugins/my-calendar/build/my-calendar.min"'
	];
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'), //导入JSON
		//监听
		watch: {
			configFiles: { //如果配置文件有变，reload
				files: ['Gruntfile.js', 'config/*.js'],
				options: {
					reload: true
				}
			},
			options: {
				dateFormat: function(time) {
					grunt.log.writeln('==================== Waiting... ====================');
					grunt.log.writeln('The watch finished in ' + time + 'ms at' + (new Date()).toString());
					grunt.log.writeln('Waiting for more changes...');
				},
				spawn: false
			},
			doc: {
				files: ['src/**/*.js'],
				tasks: ['jsdoc']
			},
			scripts: {
				files: ['src/**/*.js'],
				tasks: ['jsdoc']
			},
		},
		//代码检测
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
			uses_defaults: ['src/**/*.js', 'src/**/*.js'],
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
		//合并
		concat: {
			config: { //配置文件
				src: ['src/requirejs-aliases.js', 'src/requirejs-shim.js'],
				dest: 'src/requireJs-config.js'
			}
		},
		//MD5加版本号
		cachebuster: {
			build: {
				options: {
					banner: '/* 自动添加版本号 */\n',
					format: 'js',
					basedir: url,
					formatter: function(hashes) {

						var banner = '/*\n  Requirejs配置文件\n  最后更新时间：' + grunt.template.today("yyyy-mm-dd hh:mm:ss ") + ' \n*/\n',
							basePath = '//static.huizecdn.com/js/hz/www/' + url + '/', //基础路径
							output = banner,
							tabSize = '    ',
							fixed = requireMap.map(function(item) {
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
							output += tabSize + '"' + fileName + '": "' + path + '?v=' + hashes[filepath] + '",\n'; //添加Hashes值
						}
						output += '};';

						return output;
					}
				},
				src: [url + '/**/*.js', '!' + url + '/requirejs-shim.js', '!' + url + '/aliases.js'],
				dest: 'src/requirejs-aliases.js'
			}
		},
		//压缩
		uglify: {
			options: {
				sourceMap: true,
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
			my_target: {
				// files: {
				// 	'build/output.min.js': ['src/*.js']
				// }
				files: [{
					expand: true,
					cwd: 'src/',
					src: '**/*.js',
					dest: 'build'
				}]
			}
		},
		//清空
		clean: {
			jsdoc: {
				src: ['doc/']
			}
		},
		//生成文档
		jsdoc: {
			dist: {
				src: ['src/**/*.js', 'README.md'],
				options: {
					destination: 'doc',
					template: "node_modules/ink-docstrap/template",
					configure: "node_modules/ink-docstrap/template/jsdoc.conf.json"
				}
			}
		},
		//ZIP压缩
		zip: {
			//打包前端静态资源
			mg: {
				router: function(filepath) {
					var result = 'mg/static.huizecdn.com/hz/www/';
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					return result;
				},
				src: ['src/**', '!node_modules'],
				dest: 'mg.zip'
			}
		}
	});


	/*
	 ** ==================== 载插件模块 ====================
	 */
	//监听
	grunt.loadNpmTasks('grunt-contrib-watch');

	//代码检测
	grunt.loadNpmTasks('grunt-contrib-jshint');

	//合并
	grunt.loadNpmTasks('grunt-contrib-concat');

	//压缩
	grunt.loadNpmTasks('grunt-contrib-uglify');

	//生成MD5版本
	grunt.loadNpmTasks('grunt-cachebuster');

	//JS DOC
	grunt.loadNpmTasks('grunt-jsdoc');

	//zip
	grunt.loadNpmTasks('grunt-zip');

	//Clean
	grunt.loadNpmTasks('grunt-contrib-clean');

	//默认被执行的任务列表。
	grunt.registerTask('default', ['cachebuster', 'concat', 'jshint', 'uglify']);

	//生成Doc
	grunt.registerTask('doc', ['clean:jsdoc', "jsdoc"]);

	//更新版本号
	grunt.registerTask('config', ['cachebuster', "concat:config"]);


};