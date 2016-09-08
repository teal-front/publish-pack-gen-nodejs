module.exports = function(grunt) {
	/*
	 ** ==================== Grunt配置 ====================
	 */
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'), //导入JSON
		watch: { //监听
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
			},
			scripts: {
				files: ['src/*.js'],
				//tasks: ['jshint'],
				//tasks: ['jsdoc'],
				options: {
					spawn: false,
				},
			},
		},
		jshint: { //代码检测
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
		concat: {
			dist: {
				options: {
					// Replace all 'use strict' statements in the code with a single one at the top
					//banner: "'use strict';\n",
					// process: function(src, filepath) {
					// 	//return '// Source: ' + filepath + '\n' + src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
					// },
				},
				files: {
					'dest/dest.js': ['src/*.js'],
				},
			},
		},
		uglify: { //压缩
			options: {
				sourceMap: true,
				sourceMapName: 'build/sourcemap.map',
				banner: '/*! \n**  <%= pkg.name %> - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %> \n*/',
				//beautify: true, //是否有格式
				beautify: {
					width: 80,
					//beautify: true
				},
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
		jsdoc: {
			dist: {
				src: ['src/*.js', 'test/*.js'],
				options: {
					destination: 'doc'
				}
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

	grunt.loadNpmTasks('grunt-jsdoc');

	// 默认被执行的任务列表。
	grunt.registerTask('default', ['jshint', 'uglify']);
};