module.exports = function(grunt) {
    var resUrl = 'dist/static/res/2015cps',
        imagesUrl = 'dist/static/images/2015cps';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //JShint检测
        jshint: {
            files: ['src/*.js'],
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    curly: true, //大括号包裹
                    eqeqeq: true, //对于简单类型，使用===和!==，而不是==和!=
                    newcap: true, //对于首字母大写的函数（声明的类），强制使用new
                    noarg: true, //禁用arguments.caller和arguments.callee
                    sub: true, //对于属性使用aaa.bbb而不是aaa['bbb']
                    undef: true, //查找所有未定义变量
                    boss: true, //查找类似与if(a = 0)这样的代码
                    loopfunc: true, //允许循环中定义函数
                    node: true //指定运行环境为node.js
                }
            }
        },
        uglify: {
            options: {
                report: 'gzip'
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['src/*.js'],
                    dest: 'dest',
                    ext: '.min.js'
                }]
            }
        },
        imagemin: {
            prod: {
                options: {
                    optimizationLevel: 7,
                    pngquant: true
                },
                files: [{
                    expand: true,
                    cwd: 'images',
                    src: ['images/*.{png,jpg,jpeg,gif,webp,svg}'],
                    dest: 'images'
                }]
            }
        },
        cssmin: {
            // options: {
            //     report: 'gzip'
            // },
            // dist: {
            //     expand: true,
            //     cwd: 'public/stylesheets',
            //     src: ['**/*.css'],
            //     dest: resUrl + '/stylesheets'
            // }
        },
        copy: {
            main: {
                expand: true,
                src: ['routes/**'],
                dest: 'test/',
                options: {
                    process: function(content, path) {
                        return content.replace(/home page/, 'kingwell Leng');
                    }
                }
                // flatten: true,
                // filter: 'isFile'
                // filter: function(a) {
                //   return !/javascripts/.test(a);
                // }
            }
        },
        replace: {
            // dist: {
            //     options: {
            //         patterns: [{
            //             match: /resDomain = \'\';/g,
            //             replacement: 'resDomain = "<%=productionConfig.resDomain%>"'
            //         }, {
            //             match: /imagesDomain = \'\';/g,
            //             replacement: 'imagesDomain = "<%=productionConfig.imagesDomain%>"'
            //         }, {
            //             match: /\/javascripts/g,
            //             replacement: '<%=productionConfig.resDomain%>/javascripts/'
            //         }]
            //     },
            //     files: [{
            //         expand: true,
            //         flatten: true,
            //         src: ['dist/server/views/_domain.ejs'],
            //         dest: 'dist/server/views'
            //     }, {
            //         expand: true,
            //         flatten: true,
            //         src: ['dist/static/res/2015cps/javascripts/require.config.js'],
            //         dest: 'dist/static/res/2015cps/javascripts/'
            //     }]
            // }
        },
        //clean: ["dist"],
        sass: {
            dist: {
                // options: {
                //     sourcemap: 'none'
                // },
                files: [{
                    expand: true,
                    cwd: 'public/sass',
                    src: ['*.scss'],
                    dest: 'public/stylesheets',
                    ext: '.css'
                }]
            }
        },
        watch: {
            test: {
                files: ['src/*.js'],
                tasks: ['jshint']
            }
        }
    });

    //grunt.loadNpmTasks('grunt-contrib-concat');
    // grunt.loadNpmTasks('grunt-contrib-cssmin');
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-clean');
    // grunt.loadNpmTasks('grunt-contrib-watch');
    //grunt.loadNpmTasks('grunt-contrib-imagemin');
    //grunt.loadNpmTasks('grunt-contrib-sass');
    //grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-replace');
    // grunt.loadNpmTasks('grunt-filerev');
    // grunt.loadNpmTasks('grunt-usemin');

    grunt.registerTask('default', ['watch']);

};