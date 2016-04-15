var isdebug=false;
module.exports = function(grunt) {
    var tranSport=["T.js","jweixin-1.0.0"]

    var all={
        copyFiles:['*', '*/*.js'],
        transportDir:["*.js",'*/*.js']
    };
    var releasedir="D:/staticCdn/static.huizecdn.com/"//CDN路径
    var dev={copyFiles:[],childDir:[],transportDir:[]}
    var config
    if(isdebug){
        config=dev;
    }else{
        config=all;
    }

    grunt.initConfig({
            pkg:grunt.file.readJSON('package.json'),
        /**
         *  cmd源文件，并复制到临时目录
         */
        copy: {
            copyAll:{
                options:{
                    process:function(content,filepath){
                           return "define(function(require,exports,module) {"+content+"})"
                    }
                },
                files:[{
                    'expand': true,
                    'cwd':'<%= pkg.module %>js/',
                    'src': config.copyFiles,
                    'dest': '<%= pkg.module %>.h5-temp/'
                }
                    ]
            },
            copyToRelase:{
                files: [{
                    'expand': true,
                    'cwd':'<%= pkg.module %>dist/js/',
                    'src':['*', '*/*.js',],
                    'dest': releasedir+'js/hz/www'},
                    {
                        'expand': true,
                        'cwd':'<%= pkg.module %>themplate/',
                        'src':['*/*.html'],
                        'dest': releasedir+'template/hz/www'
                    }]
            }
        },

        jshint: {
            files:["js/*.js"],
            options: {
                globals: {
                    curly: true,
                    eqeqeq: true,
                    newcap: true,
                    noarg: true,
                    sub: true,
                    undef: true,
                    boss: true,
                    node: true
                }
            }
        },
        cachebuster: {
            build: {
                options: {
                    format: 'json',
                    basedir: '<%= pkg.module %>.h5-temp/',
                    formatter: function(hashes) {
                        var output = 'var fileVersion={';
                        for (var filename in hashes) {
                            var tempFile=filename.replace(/\\/g,"/");
                            tempFileName=tempFile.substring(0,tempFile.lastIndexOf("."))
                            if(filename.indexOf(".html")>-1){
                                var htmlTempName=tempFileName.replace("../themplate/","")
                                output += '"' + htmlTempName + '":"//static.huizecdn.com/template/hz/www/' + htmlTempName + '.html?v=' + hashes[filename] + '",';
                            }else {
                                output += '"' + tempFileName + '":"//static.huizecdn.com/js/' + tempFileName + '.js?v=' + hashes[filename] + '",';
                            }
                        }
                        output+="}"
                        return output;
                    }
                },
                src: ['<%= pkg.module %>.h5-temp/*.js', '<%= pkg.module %>.h5-temp/*/*.js','<%= pkg.module %>themplate/*/*.html' ],
                dest: '<%= pkg.module %>.h5-temp/cachebusters.json'
            }
        },

        concat: {
                options: {
                    noncmd: true
                },
            dist: {
                src: ['<%= pkg.module %>.h5-temp/cachebusters.json', '<%= pkg.module %>js/requirejs/config.js'],
                dest: '<%= pkg.module %>.h5-temp/requirejs/requireJs-config.js'
            }


        },

        /**
         * 转化为CommonJS规范
         */
        transport: {
            options: {
                debug:false,
                format: './{{filename}}'

            },
            js: {
                files: [{
                    // 相对路径地址
                    'cwd':'<%= pkg.module %>.h5-temp/',
                    'src':config.transportDir,
                    'dest':'<%= pkg.module %>.build'
                }]
            }
        },
        /**
         * 打包依赖文件
         */

        /**
         * 压缩并输出到输出目录
         */
        uglify: {
            options:{
                debug:true,
                mangle: {
                    except: ['require','exports','module']
                }
            },
            build: {
                files: [{
                    'expand': true,
                    'cwd':'<%= pkg.module %>.h5-temp/',
                    'src':['*.js', '*/*.js'],
                    'dest': '<%= pkg.module %>dist/js'
                   }
                ]
            }
        },
        watch:{
            options:{
                cwd:'<%= pkg.module %>js/'
            },
            files:['*.js','*/*.js'],
            tasks:['debug']
        },
        /**
         * 删除临时文件
         */
        clean: {
            options:{
                force:true
            },
            build: ['<%= pkg.module %>.build','<%= pkg.module %>.h5-temp','<%= pkg.module %>.dist-temp']
        }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks("grunt-cachebuster");
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.registerTask("debug",["jshint","copy:copyAll",'cachebuster','concat'])
    grunt.registerTask("default",["jshint","copy:copyAll",'cachebuster','concat',"uglify:build"])
    grunt.registerTask("release",["jshint","copy:copyAll",'cachebuster','concat',"uglify:build","copy:copyToRelase"])
};