/**
 * gulp相关文件配置
 */

'use strict';

module.exports = new Map([
    // 要处理的路径，以正则表示
    [/xx-node-[a-zA-Z-]+\/public\/(cps\/)?js/, [
        // 对应的gulp动作
        "uglify:js"
    ]],
    [/static\.huizecdn\.com.+\.js$/, [
        "uglify:js"
    ]],
    [/xx-node\/(web_m|web_www)\/public\/js/, [
        "uglify:js"
    ]],
    [/\.css$/, [
        "uglify:css"
    ]],
])