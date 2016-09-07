/*
  Requirejs配置文件
  Last Updated:2016-08-09 04:08:55  
*/
var fileVersion = {
    'jquery': '//static.huizecdn.com/js/libs/jquery/1.8.0/jquery.min',
    'underscore': '//static.huizecdn.com/js/libs/underscore/1.8.3/underscore.min',
    'require-text': '//static.huizecdn.com/js/plugins/require-text/text.min',
    'require-css': '//static.huizecdn.com/js/plugins/require-css/css.min',
    'jquery-tab': '//static.huizecdn.com/js/plugins/jquery-tab/build/jquery-tab',
    'jquery-placeholder': '//static.huizecdn.com/js/plugins/placeholder/build/jquery-placeholder',
    'base': '//static.huizecdn.com/js/base/src/base',
    'layer':'//static.huizecdn.com/js/plugins/layer/2.3.0/layer',
    'jquery-prompt':'//static.huizecdn.com/js/plugins/jquery-prompt/build/jquery-prompt',
    'kkpager':'//static.huizecdn.com/js/plugins/kkpager/kkpager.min',
    'es5-shim':'//static.huizecdn.com/js/plugins/es5-shim/es5-shim.min',
    'my-calendar':'//static.huizecdn.com/js/plugins/my-calendar/build/my-calendar.min',
    'message':'//static.huizecdn.com/js/plugins/message/build/message',
    'webuploader':'//static.huizecdn.com/js/plugins/webuploader/webuploader',
    'SuperSlide':'//static.huizecdn.com/js/plugins/SuperSlide2.1.1/jquery.SuperSlide.2.1.1',
    'jq-slide':'//static.huizecdn.com/js/plugins/jqslide/build/jq-slide',
    'count-up':'//static.huizecdn.com/js/plugins/count-up/countUp',
    'kslide':'//static.huizecdn.com/js/plugins/slide/build/kslide',
    'jquery-menu-aim':'//static.huizecdn.com/js/plugins/jquery-menu-aim/jquery-menu-aim',
    "brand-list": "/javascripts/src/brand/brand-list.js?v=1a336f137bfee0cbcb601179c34faa8a",
    "brand-product-list": "/javascripts/src/brand/brand-product-list.js?v=992b8748a346a560082ecdd9c780de0e",
    "car-home": "/javascripts/src/car-insure/car-home.js?v=c31caa672ce516232067c0c100661321",
    "car-insure-index": "/javascripts/src/car-insure/car-insure-index.js?v=9c643030eda15c2f883ce00352f5c0de",
    "car-insure-policy-list": "/javascripts/src/car-insure/car-insure-policy-list.js?v=c5c8cc1bafac74d9ed973ad38b6f2b26",
    "animate-fly": "/javascripts/src/com/animate-fly.js?v=a9f857cc1898fa0ddc81e4e42bd28664",
    "helper": "/javascripts/src/com/helper.js?v=35b58a773002e047cebecdbd57f589df",
    "jquery-plugins": "/javascripts/src/com/jquery-plugins.js?v=1b3779645e8c361e5210257440baa15d",
    "main": "/javascripts/src/com/main.js?v=10e17c606b412342299b4dfd0324567b",
    "all-comments": "/javascripts/src/comment/all-comments.js?v=138ed2c3742ed37e869493de8afc4840",
    "post-comment": "/javascripts/src/comment/post-comment.js?v=2a9c80bdac2fe75f2667a2d18c688692",
    "health-inform": "/javascripts/src/health/health-inform.js?v=353475a859da53ffd3b0ce00ff1fecf0",
    "index": "/javascripts/src/home/index.js?v=8782546afc7c8a56c87b2e80002b18d7",
    "insure-area": "/javascripts/src/insure/insure-area.js?v=6e145b1b525e4c6d7fea87354e2202b3",
    "insure-beneficiary": "/javascripts/src/insure/insure-beneficiary.js?v=53fa752ee8cb80c23e03ce49e0744d2b",
    "insure-contacts": "/javascripts/src/insure/insure-contacts.js?v=0df8080fcdd1a66949b07a0b88515193",
    "insure-date": "/javascripts/src/insure/insure-date.js?v=5c2943919e5a5fa3570812237731ae82",
    "insure-destination": "/javascripts/src/insure/insure-destination.js?v=3dfb9a2e23a3689db4d61bdb0f8775ee",
    "insure-event": "/javascripts/src/insure/insure-event.js?v=64ce6a0a3f805b92605eeb86d78f8ea8",
    "insure-fight": "/javascripts/src/insure/insure-fight.js?v=ba6d8738818778beb22bdc48e825429a",
    "insure-fill": "/javascripts/src/insure/insure-fill.js?v=66cef3d0bd11d2cd36e027ecbf5c2f94",
    "insure-hz": "/javascripts/src/insure/insure-hz.js?v=2d6dae493e08e06e1d6106c3d41fd7dc",
    "insure-id": "/javascripts/src/insure/insure-id.js?v=89293ffcf961d87c1359c3961b20f6d2",
    "insure-photo": "/javascripts/src/insure/insure-photo.js?v=3883e7d2c85ae853ebb2fa7363580db2",
    "insure-post": "/javascripts/src/insure/insure-post.js?v=711d77ade21cc637c1a3c0255ac5486a",
    "insure-render": "/javascripts/src/insure/insure-render.js?v=0efa15641b518bb7a7ef7be29cca86b3",
    "insure-restrict": "/javascripts/src/insure/insure-restrict.js?v=b1ac8d5a7a73fb153d436981b4def3c9",
    "insure-team": "/javascripts/src/insure/insure-team.js?v=bb14606afe8b7635b0a97df25f9f9ba8",
    "insure-text": "/javascripts/src/insure/insure-text.js?v=3521737b6536a6384e92600639d1a5ef",
    "insure-trial": "/javascripts/src/insure/insure-trial.js?v=5af4877b98830dd79b85d0671c84a71e",
    "insure-url": "/javascripts/src/insure/insure-url.js?v=facb1fee975b52fe5e122737884e0bd3",
    "insure-validate": "/javascripts/src/insure/insure-validate.js?v=5c82ed131cfc275461b84829088042f8",
    "insure": "/javascripts/src/insure/insure.js?v=5e60b8bdca00ed5dfb6d870685b2d2a1",
    "test-data": "/javascripts/src/insure/test-data.js?v=790c5cf5829bc1d8f3ea8fa80bc3717b",
    "baoxianpaiming": "/javascripts/src/list/baoxianpaiming.js?v=7c77a60c670ce0fc87b3492ba25707f1",
    "payment": "/javascripts/src/pay/payment.js?v=225ec37237dd69c314f338a6ea85a903",
    "process": "/javascripts/src/pay/process.js?v=f5de6b914046d528fc0f0927a4a6bbc0",
    "settlement": "/javascripts/src/pay/settlement.js?v=3e188b49712543480e483198919d3c75",
    "success": "/javascripts/src/pay/success.js?v=5a6507c8b23f9a3b99cec6c88f24eff1",
    "fix-float": "/javascripts/src/plugins/fix-float.js?v=7c63e582c01fb87463ac17040776a2c7",
    "fixed-tool-float": "/javascripts/src/plugins/fixed-tool-float.js?v=08d89a0d80612241cb87fe416778ef2a",
    "share-panel": "/javascripts/src/plugins/share-panel.js?v=d40b1ef720d59192bfd25461dce66057",
    "sign-float": "/javascripts/src/plugins/sign-float.js?v=0d8f92bc9397017e2cda959c54ef338a",
    "sub-menu": "/javascripts/src/plugins/sub-menu.js?v=f0c65db610133b9b4c6f3a14f4771c19",
    "top-menu": "/javascripts/src/plugins/top-menu.js?v=1a1bd631ba0b2a33659d7fe69212782e",
    "baoxianpaiming": "/javascripts/src/product-list/baoxianpaiming.js?v=11b2594eec75f8d226b4740a42ccd416",
    "product-list": "/javascripts/src/product-list/product-list.js?v=0444274d33d2d06f8d6c66a1245c2f5f",
    "compare": "/javascripts/src/product/compare.js?v=2d4d89c9ee974fc4e611c569809fcb6c",
    "data": "/javascripts/src/product/data.js?v=47b5caa7e06c4c47f5102d952cc3ecec",
    "detail": "/javascripts/src/product/detail.js?v=8a1449ae41ba0ebe79043b707adcf2fd",
    "job": "/javascripts/src/product/job.js?v=2e0d90ea65dc7ef16eaba2525ce74905",
    "product": "/javascripts/src/product/product.js?v=0e6d0a0ac5e6259d2e85b03f141069fd",
    "trial-render": "/javascripts/src/product/trial-render.js?v=a8e938522aa0a99d9ef93f5ea52492ec",
    "trial": "/javascripts/src/product/trial.js?v=138a3602ed5886f67c12f8b5dc1adafe",
    "program-step": "/javascripts/src/programs/program-step.js?v=12523c89439633b7bb857f4f9d2d4771",
    "programs-comments": "/javascripts/src/programs/programs-comments.js?v=62123b00a0a0b893082d77ccab70444e",
    "programs-json": "/javascripts/src/programs/programs-json.js?v=97a25fb0d7efc09d6bb179b2cdf526a9",
    "programs": "/javascripts/src/programs/programs.js?v=4196a33240b6a25a1993115064682e9d",
    "reserve": "/javascripts/src/reserve/reserve.js?v=f51bfb2d0b3bfcbf6482e2611f23ab35",
    "search": "/javascripts/src/search/search.js?v=67a1eff165b3c78033331537b9ace0a2",
    "shopping-car": "/javascripts/src/shopping-car/shopping-car.js?v=b392180d1353365fc13c8cb8f7d6aa1f",
    "subject-detail": "/javascripts/src/special-subject/subject-detail.js?v=36cd7a4d272ccd140ff1c990d681e31d",
    "subject-list": "/javascripts/src/special-subject/subject-list.js?v=cdb75447e22313a2bbea1bb8bd4460f1"
};
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