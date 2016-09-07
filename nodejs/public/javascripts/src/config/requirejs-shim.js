requirejs.config({
    baseUrl: '',
    urlArgs: '1.1.20',
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
        'jquery-plugins': {
            deps: ['jquery']
        },
        'jquery-menu-aim': {
            deps: ['jquery']
        },
        'jquery-prompt': {
            deps: ['jquery', 'css!jquery-prompt-css']
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
        'webuploader': {
            deps: ['jquery', 'css!webuploader-css']
        },
        'jquery-bxslider': {
            deps: ['jquery', 'css!jquery-bxslider-css']
        },
        'fixed-tool-float': {
            deps: ['css!sidetool-css']
        },
        'jq-slide': {
            deps: ['jquery', 'css!jq-slide-css']
        },
        'SuperSlide': {
            deps: ['jquery']

        },
		'kslide': {
            deps: ['jquery']
        }
    },
    map: {
        '*': {
            'css': 'require-css',
            'layer-css': '//static.huizecdn.com/js/plugins/layer/1.9.3/skin/layer',
            'kkpager-css': '//static.huizecdn.com/js/plugins/kkpager/kkpager_blue',
            'jquery-bxslider-css': '//static.huizecdn.com/js/plugins/jquery-bxslider',
            'my-calendar-css': '//static.huizecdn.com/js/plugins/my-calendar/stylesheets/calendar',
            'message-css': '//static.huizecdn.com/js/plugins/message/stylesheets/message',
            'webuploader-css': '//static.huizecdn.com/js/plugins/webuploader/webuploader',
            'jquery-prompt-css': '//static.huizecdn.com/js/plugins/jquery-prompt/stylesheets/jquery-prompt',
            'sidetool-css': '//static.huizecdn.com/css/hz/www/build/sidetool',
            'jq-slide-css': '//static.huizecdn.com/js/plugins/jqslide/stylesheets/jq-slide'
        }
    }
});