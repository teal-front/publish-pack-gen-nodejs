'use strict';

/**
 * controller - main.js
 */

const parseString = require('xml2js').parseString;
const moment = require('moment');

const path = require('path');
const fs = require('fs')
const childProcess = require('child_process');

// demo中为./config/config
const CONFIG = require('/etc/svn-package/config/config');


/**
 * origin policy
 */
exports.origin = async function (cxt, next) {

    await next()

    const WHITE_LIST = new Set(['chrome-extension://ecgacdaclhkkmfjijkpaphjjfidpnloh', // chrome store repo
        'chrome-extension://bbhfhjdpidicepidikpejfdkepeblaom',                       // local
    ]);
    let reqOrigin = cxt.get('Origin');

    if (WHITE_LIST.has(reqOrigin)) {
        cxt.set('Access-Control-Allow-Origin', reqOrigin)
    }
};

/**
 * 获取版本列表
 */
exports.getRevisionList = async function (ctx, next) {
    //res.setTimeout(20000);

    let repoName = ctx.query.repoName || 'node',
        keyword = CONFIG.repoMap[repoName].keyword, // 用来过滤提交版本中的其他项目文件
        repoUrl = CONFIG.repoMap[repoName].url;
    let author = ctx.query.author || '';         // 搜索版本的关键词

    console.log('--------search word:  ', author);
    // 拉取数量过多，下面的execFile可能会出现Error: stdout maxBuffer exceeded
    let cmdParams = ['log', '-l', '20']
        .concat(author == '' ? [] : ['--search', author])
        .concat(['-v', '--xml', repoUrl]);

    var summary = await getSvnList();
    ctx.body = JSON.stringify(summary);

    function getSvnList () {
        return new Promise((resolve, reject) => {
            childProcess.execFile('svn', cmdParams, {maxBuffer: 1000 * 1024}, (err, stdout, stderr) => {

                if (err) reject(err);

                // stdout 为xml格式，转为json format
                parseString(stdout, (err, summary) => {
                    console.log(JSON.stringify(summary));

                    // empty: {"log":"\n"}
                    if (!summary.log.logentry) {
                        summary.log = {logentry: []};
                    }

                    // 过滤掉同一版本提交中的其它项目文件
                    summary.log.logentry.forEach(log => {
                        log.paths[0].path = log.paths[0].path.filter(filepath => {
                            let _filepath = filepath._;

                            return (_filepath.indexOf(keyword) > -1) &&
                                (path.extname(_filepath) !== '');   // filter direction
                        })
                        log.date[0] = log.date[0].replace(/^(\d{4}-\d{2}-\d{2})T(\d{2})(:\d{2}:\d{2}).*$/, (m, m1, m2, m3) => {
                            // 把US时区时间转成China时区时间
                            return `${m1}_${+m2 + 8}${m3}`;
                        });
                    })

                    resolve(summary);
                });
            })
        });
    }

}

/**
 * chrome extension的应用配置文件
 */
exports.getRepoConfig = async function (ctx, next) {
    let repoNames = Object.keys(CONFIG.repoMap);

    ctx.body = JSON.stringify(repoNames);
}

/**
 *download zip
 */
exports.downloadZip = async function (ctx, next) {

    const filename = `${global.dirname}/package-export/${ctx.params.id}.zip`;
    console.log('the file tobe downloda: ', filename);

    if (!fs.existsSync(filename)) {
        ctx.status = 404;
        ctx.body = 'file not exist';
        return;
    }

    ctx.attachment();
    ctx.body = fs.createReadStream(filename);
}

/**
 * // http://techdoc.oa.com/teal/svnPackage/hooks上设置的commit webhook
 */
exports.gitPush = async function (ctx, next) {
    // since `pm2 reload`, this request response nothing!!!
    childProcess.exec('git pull && pm2 reload svn-package', (err, stdout, stderr) => {
        if (err) {
            console.log(`git-push hook failed, due to ${err}`)
            return res.status(500).end('fail')
        }

        console.log('git-push ok')
        res.end('ok')
    })
}

/**
 * get version
 */
exports.getVersion = async function (ctx, next) {
    ctx.body = process.version;
}