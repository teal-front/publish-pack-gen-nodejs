module.exports = function(grunt) {
	/*
	 * @author 
	 * @version 0.0.1
	 * @description Nodejs Grunt配置
	 */

	//开发模式
	var isDevelopment = true;
	var url = '';

	if (isDevelopment) {
		url = 'src';
	} else {
		url = 'build';
	}

	//静态资源路径
	var staticJSUrl = 'mg/static.huizecdn.com/js/hz/www/';
	var staticCSSUrl = 'mg/static.huizecdn.com/css/hz/www/';
	var staticImageUrl = 'mg/img.huizecdn.com/hz/www/';
	var staticUrl = '//static.huizecdn.com/js/hz/www/build/';
	var nodejsUrl = 'hz/huize-node/';
	//导入第三方文件别名
	var otherScripts = grunt.file.read('public/javascripts/src/config/others-scripts-aliases.json');
	otherScripts = JSON.parse(otherScripts);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			config: {
				files: [
					'public/javascripts/src/**/*.js',
					'!public/javascripts/src/requirejs-aliases.js',
					'!public/javascripts/src/requirejs-config.js'
				],
				tasks: [
					'cachebuster',
					"concat:config"
				]
			}
		},
		// imagemin: { // Task
		// 	static: { // Target
		// 		options: { // Target options
		// 			optimizationLevel: 3,
		// 			svgoPlugins: [{
		// 				removeViewBox: false
		// 			}],
		// 			use: [mozjpeg()]
		// 		},
		// 		files: { // Dictionary of files
		// 			'dist/img.png': 'src/img.png', // 'destination': 'source'
		// 			'dist/img.jpg': 'src/img.jpg',
		// 			'dist/img.gif': 'src/img.gif'
		// 		}
		// 	},
		// 	dynamic: { // Another target
		// 		files: [{
		// 			expand: true, // Enable dynamic expansion
		// 			cwd: 'public/images/src', // Src matches are relative to this path
		// 			src: ['**/*.{png,jpg,gif}'], // Actual patterns to match
		// 			dest: 'public/images/build/' // Destination path prefix
		// 		}]
		// 	}
		// },
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
		/*=====ZIP打包=====*/
		zip: {
			//打包前端静态资源
			image: {
				router: function(filepath) {
					var result = staticImageUrl;
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					result = result.replace('/public/images/', '/');
					console.log('正在打包JS文件', result);
					return result;
				},
				src: [
					'public/images/build/**',
				],
				dest: 'build/zip-image/mg.zip'
			},
			js: {
				router: function(filepath) {
					var result = staticJSUrl;
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					result = result.replace('/public/javascripts/', '/');
					console.log('正在打包JS文件', result);
					return result;
				},
				src: [
					'public/javascripts/build/**',
					//'!public/javascripts/build/config/others-scripts-aliases.json',
					//'!public/javascripts/build/config/requirejs-aliases.js',
					//'!public/javascripts/build/config/requirejs-shim.js',
					//'!public/javascripts/build/config/requirejs-config.js'
					'!public/javascripts/build/config/**'
				],
				dest: 'build/zip-js/mg.zip'
			},
			jsConfig: {
				router: function(filepath) {
					var result = staticJSUrl;
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					result = result.replace('/public/javascripts/', '/');
					console.log('正在打包JS文件', result);
					return result;
				},
				src: [
					'public/javascripts/build/config/**',
					'!public/javascripts/build/config/others-scripts-aliases.json',
					'!public/javascripts/build/config/requirejs-aliases.js',
					'!public/javascripts/build/config/requirejs-shim.js'
				],
				dest: 'build/zip-js-config/mg.zip'
			},
			css: {
				router: function(filepath) {
					var result = staticCSSUrl;
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					result = result.replace('/public/stylesheets/', '/');
					console.log('正在打包CSS文件', result);
					return result;
				},
				src: ['public/stylesheets/build/**'],
				dest: 'build/zip-css/mg.zip'
			},
			nodejstest: {
				router: function(filepath) {
					var result = ''; // staticCSSUrl;
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					result = result.replace('/public/stylesheets/', '/');
					console.log('正在打包Nodejs文件', result);
					return result;
				},
				src: [
					'**.*',
					'bin/**',
					'lib/**',
					'public/**',
					'!public/sass/**',
					'!public/dev/**',
					'routes/**',
					'views/**',
					'lib/**',
					'!node_modules',
					'!**.rb',
					'!pm2-prod.json',
					'!pm2-dev.json',
					'!**.bat',
					'!**.md',
					'!bin/server.sh'
				],
				dest: 'build/zip-nodejs/nodejs-test.zip'
			},
			nodejsprev: {
				router: function(filepath) {
					var result = '';
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					result = result.replace('/public/stylesheets/', '/');
					console.log('正在打包Nodejs文件', result);
					return result;
				},
				src: [
					'**.*',
					'bin/**',
					'lib/**',
					'public/**',
					'!public/javascripts/**',
					'!public/stylesheets/**',
					'!public/images/**',
					'!public/sass/**',
					'routes/**',
					'views/**',
					'lib/**',
					'!node_modules',
					'!**.rb',
					'!pm2-dev.json',
					'!pm2-test.json',
					'!bin/server.sh',
					'!**.bat',
					'!**.md'
				],
				dest: 'build/zip-nodejs/nodejs-prev.zip'
			},
			nodejsprod: {
				router: function(filepath) {
					// var result = ''; // staticCSSUrl;
					var result = nodejsUrl;
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					result = result.replace('/public/stylesheets/', '/');
					console.log('正在打包Nodejs文件', result);
					return result;
				},
				src: [
					'**.*',
					'bin/**',
					'lib/**',
					'public/**',
					'!public/javascripts/**',
					'!public/stylesheets/**',
					'!public/images/**',
					'!public/sass/**',
					'routes/**',
					'views/**',
					'lib/**',
					'!node_modules',
					'!**.rb',
					'!pm2-dev.json',
					'!pm2-test.json',
					'!**.bat',
					'!**.md'
				],
				dest: 'build/zip-nodejs/hz.zip'
			},
			nodejs: {
				router: function(filepath) {
					var result = ''; // staticCSSUrl;
					if (filepath === 'undefined') {
						result = result + '';
					} else {
						result = result + filepath;
					}
					result = result.replace('/public/stylesheets/', '/');
					console.log('正在打包Nodejs文件', result);
					return result;
				},
				src: [
					'**.*',
					'bin/**',
					'lib/**',
					'public/**',
					'!public/javascripts/**',
					'!public/stylesheets/**',
					'!public/images/**',
					'!public/sass/**',
					'routes/**',
					'views/**',
					'lib/**',
					'!node_modules',
					'!**.rb',
					'!**.bat',
					'!**.md',
					'!bin/server.sh'
				],
				dest: 'build/zip-nodejs/nodejs.zip'
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
						var reg = /(,\n)\}/ig, //去除最后一个"逗号"
							banner = '/*\n  Requirejs配置文件\n  Last Updated:' + grunt.template.today("yyyy-mm-dd hh:mm:ss ") + ' \n*/\n',
							//basePath = '//static.huizecdn.com/js/hz/www/' + url + '/', //基础路径
							basePath = '/javascripts/' + url + '/', //基础路径
							output = banner,
							tabSize = '    ',
							fixed = otherScripts.files.map(function(item) {
								return tabSize + item;
							});

						output += 'var fileVersion = {\n';
						output += fixed.join(',\n') + ',\n'; //添加固定的别名
						console.log('\n');
						for (var filepath in hashes) {
							var start = filepath.lastIndexOf('/') + 1,
								end = filepath.lastIndexOf('.'),
								fileName = filepath.substring(start, end), //获取文件名
								path = basePath + filepath; //拼接路径
							path = path.replace(/\\/g, '/');
							path = path.replace('public/javascripts/src/', '');
							console.log(fileName, path, '\n');
							output += tabSize + '"' + fileName + '": "' + path + '?v=' + hashes[filepath] + '",\n'; //添加Hashes值
						}
						output += '};';
						output = output.replace(reg, '\n}');
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
		/*=====replace=====*/

		replace: {
			dist: {
				options: {
					patterns: [{
						match: /\/javascripts\/src\//g,
						//match: 'huizecdn',
						replacement: function() {
							return staticUrl // replaces "foo" to "bar"
						}
					}]
				},
				files: [{
					expand: true,
					flatten: true,
					src: [
						'public/javascripts/build/config/requirejs-config.js'
					],
					dest: 'public/javascripts/build/config'
				}]
			}
		},
		/*=====压缩=====*/
		uglify: {
			options: {
				sourceMap: false,
				sourceMapName: 'build/sourcemap.map',
				banner: '/**\n ** \n ** <%= pkg.name %>; \n ** Version:<%= pkg.version %>;' +
					'\n ** Last Updated:<%= grunt.template.today("yyyy-mm-dd") %>; \n **\n **/\n',
				//beautify: true, //是否有格式
				beautify: {
					width: 80,
					//beautify: true
				},
				mangle: {
					//配置不压缩的关键字
					except: ['$']
				},
				screwIE8: false,
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
		/*=====压缩CSS=====*/
		// cssmin: {
		// 	options: {
		// 		shorthandCompacting: false,
		// 		roundingPrecision: -1
		// 	},
		// 	target: {
		// 		files: {
		// 			'output.css': ['foo.css', 'bar.css']
		// 		}
		// 	}
		// },
		cssmin: {
			options: {
				compatibility: 'ie8', //设置兼容模式 
				noAdvanced: true //取消高级特性 
			},
			target: {
				files: [{
					expand: true,
					cwd: 'public/stylesheets/src',
					src: ['**/*.css' /*, '!build/**'*/ ],
					dest: 'public/stylesheets/build',
					ext: '.css'
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
				dest: 'public/javascripts/src/config/requirejs-config.js'
			}
		}
	});

	//监听
	grunt.loadNpmTasks('grunt-contrib-watch'); /*=====合并脚本=====*/
	grunt.loadNpmTasks('grunt-contrib-concat'); /*=====MD5加版本号=====*/
	grunt.loadNpmTasks('grunt-cachebuster'); /*=====代码检测=====*/
	grunt.loadNpmTasks('grunt-contrib-jshint'); /*=====压缩=====*/
	grunt.loadNpmTasks('grunt-contrib-uglify'); /*=====cssmin=====*/
	grunt.loadNpmTasks('grunt-contrib-cssmin'); /*=====ZIP打包=====*/
	grunt.loadNpmTasks('grunt-zip');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-replace'); //打包所有
	//grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.registerTask(
		'default', [
			/*'jshint:defaults,'*/
			'cssmin',

			'cachebuster',
			'concat:config',
			'uglify:build',
			'replace',

			'zip'
		]);

	//打包JS
	grunt.registerTask('js', [
		//'jshint:defaults',
		'cachebuster',
		'concat:config',
		'uglify:build',
		'replace',
		'zip:js',
		'zip:jsConfig'
	]);
	//打包CSS
	grunt.registerTask('css', ['cssmin', 'zip:css']);
	//打包Nodejs
	grunt.registerTask('nodejs', ['zip:nodejs', 'zip:zip:nodejsprod', 'zip:zip:nodejstest', 'zip:zip:nodejsprev']);
	grunt.registerTask('updateconfig', [
		'cachebuster',
		"concat:config",
		'zip:jsConfig'
	]);
	grunt.registerTask('watchconfig', ['watch:config']);
};