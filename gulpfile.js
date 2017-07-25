'use strict';

var path = require('path'),
    fs = require('fs'),
    execSync = require('child_process').execSync,
    spawn = require('child_process').spawn,
    spawnSync = require('child_process').spawnSync;
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    uglifycss = require('gulp-uglifycss'),
    runSequence = require('run-sequence');
var argv = require('minimist')(process.argv);

const gulpConfig = require('./config/gulp-config');

gulp.task('default', function () {
    var filepaths = argv.filepaths.split(',').filter(v => v != '');

    console.log('tobe build file', filepaths);

    gulpConfig.forEach(function (fileTasks, pathReg) {
        filepaths.forEach(function (filepath) {
            if (pathReg.test(filepath)) {

                // gulp@3.9.1 还不支持？
                //gulp.series(...tasks)

                if (fileTasks.length) {
                    fileTasks.forEach(task => {
                        var gulpChild = spawnSync('gulp', [`${task}`, `--singlefilepath=${filepath}`], {
                            stdio: [process.stdin, process.stdout, process.stderr]
                        })

                        //queueList[task].push(filepath)
                    })
                }
            }
        })
    })

    /*var tasks = ["uglify:js", "copy"];
     //{"uglify:js": [], "": []}
     var queueList = {};
     tasks.forEach(task => {
     queueList[task] = []
     })
     console.log('queueList', queueList)
     runSequence(tasks)
     console.log('tasks run done...');*/
});

gulp.task('copy', function () {
    var filepath = argv.singlefilepath;

    return gulp.src(filepath)
        .pipe(copy())
        .pipe(gulp.dist(path.dirname(filepath)))
})

gulp.task('uglify:js', function () {
    //var filePaths = queueList["uglify:js"];
    var filepath = argv.singlefilepath;
    var opts = {
        mangle: {
            except: ['$', 'require'],
            screw_ie8: false
        },
        compress: {
            screw_ie8: false
        },
        output: {
            //ascii_only:true,
            screw_ie8: false
        },
    };

    console.log("uglify:js filePaths:", filepath);

    return gulp.src(filepath)
        .pipe(uglify(opts))
        .pipe(gulp.dest(path.dirname(filepath)));
});

// https://github.com/fmarcia/UglifyCSS
gulp.task('uglify:css', function () {
    var filepath = argv.singlefilepath;

    console.log("uglify:css filePaths:", filepath);

    return gulp.src(filepath)
        .pipe(uglifycss({
            "maxLineLen": 0,
            "uglyComments": true
        }))
        .pipe(gulp.dest(path.dirname(filepath)));
});
