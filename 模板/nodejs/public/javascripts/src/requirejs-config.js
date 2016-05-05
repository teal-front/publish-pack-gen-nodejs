/*
  Requirejs配置文件
  最后更新时间：2016-05-05 12:05:53  
*/
var fileVersion = {
    'jquery': '//static.huizecdn.com/js/libs/jquery/1.8.0/jquery.min',
    'underscore': '//static.huizecdn.com/js/libs/underscore/1.8.3/underscore.min',
    'my-calendar': '//static.huizecdn.com/js/plugins/my-calendar/build/my-calendar.min',
    'require-text': '//static.huizecdn.com/js/plugins/require-text/text.min',
    'require-css': '//static.huizecdn.com/js/plugins/require-css/css.min',
    'jquery-tab': '//static.huizecdn.com/js/plugins/jquery-tab/build/jquery-tab',
    'jquery-placeholder': '//static.huizecdn.com/js/plugins/placeholder/build/jquery-placeholder',
    'base': '//static.huizecdn.com/js/base/src/base',
    'layer':'//static.huizecdn.com/js/plugins/layer/1.9.3/layer',
    'jquery-prompt':'//static.huizecdn.com/js/plugins/jquery-prompt/build/jquery-prompt',
    'kkpager':'//static.huizecdn.com/js/plugins/kkpager/kkpager.min',
    'es5-shim':'//static.huizecdn.com/js/plugins/es5-shim/es5-shim.min',
    'my-calendar':'//static.huizecdn.com/js/plugins/my-calendar/build/my-calendar.min',
    'message':'//static.huizecdn.com/js/plugins/message/src/message',
    "public/javascripts/src/demo/demo1": "//static.huizecdn.com/js/hz/www/src/src/demo/demo1.js?v=404316ea17e1efb09041fa11be54abc2",
    "public/javascripts/src/demo/demo2": "//static.huizecdn.com/js/hz/www/src/src/demo/demo2.js?v=528cee88d3fa3c8ea91e92975aa78164",
};
requirejs.config({
    baseUrl: '',
    paths: fileVersion,
    waitSeconds: 0, //超时时间
    shim: { //deps依赖关系
        jquery: {
            exports: '$'
        },
        message: {
            exports: 'Message',
            deps: ['css!message-css']
        },
        'jquery-placeholder': {
            deps: ['jquery']
        },
        'jquery-prompt': {
            deps: ['jquery']
        },
        'layer': {
            exports: 'layer',
            deps: ['jquery', 'css!layer-css']
        },
        'my-calendar': {
            exports: 'MyCalendar',
            deps: ['css!my-calendar-css']
        },
        'kkpager': {
            deps: ['css!kkpager-css']
        },
        'jquery-bxslider': {
            deps: ['jquery', 'css!jquery-bxslider-css']
        }
    },
    map: {
        '*': {
            'css': 'require-css',
            'layer-css': '//static.huizecdn.com/js/plugins/layer/1.9.3/skin/layer',
            'kkpager-css': '//static.huizecdn.com/js/plugins/kkpager/kkpager_blue',
            'jquery-bxslider-css': '//static.huizecdn.com/js/plugins/jquery-bxslider',
            'my-calendar-css': '//static.huizecdn.com/js/plugins/my-calendar/stylesheets/calendar',
            'message-css': '//static.huizecdn.com/js/plugins/message/stylesheets/message'
        }
    }
});