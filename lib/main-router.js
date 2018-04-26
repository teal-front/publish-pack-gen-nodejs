'use strict';

/**
 * controller - main.js
 */

const path = require('path');
const fs = require('fs')
const childProcess = require('child_process');

const CONFIG = require('../config/config');


/**
 * origin policy
 */
exports.origin = async function (cxt, next) {

    await next()

    const WHITE_LIST = new Set(['chrome-extension://ecgacdaclhkkmfjijkpaphjjfidpnloh', // chrome store repo
        'chrome-extension://fdcfjknlblahebehbnplajilmilfcfhf',                       // local
    ]);
    let reqOrigin = cxt.get('Origin');

    // 暂时不作origin的判断
    if (true || WHITE_LIST.has(reqOrigin)) {
        cxt.set('Access-Control-Allow-Origin', reqOrigin)
    }
};

/**
 * 获取版本列表
 */
exports.getRevisionList = async function (ctx, next) {
    //res.setTimeout(10000);

    let repoName = ctx.query.repoName,
        repoDir = CONFIG.repoMap[repoName].repoDir;

    const [err, summary] = await getSvnList({cwd: repoDir});
    if (err) {
        return ctx.body = JSON.stringify({
            code: 500,
            result: err
        })
    }
    ctx.body = {
        code: 200,
        result: summary
    }

    function getSvnList({cwd}) {
        return new Promise((resolve, reject) => {

            let cmd = 'git'
            let params = ['log', '--pretty=format:{"subject": "%s","author": "%an","date": "%ad", "commitId": "%H", "paths": []},']

            childProcess.execFile(cmd, params, {
                maxBuffer: 1000 * 1024,
                cwd,
            }, (err, stdout, stderr) => {
                if (err) reject(err);
                if (stderr) reject(stderr)

                let summary = JSON.parse('[' + stdout.slice(0, -1) + ']')
                summary = summary.slice(0, 10)
                summary.forEach((item) => {
                    item.paths = getRevFiles({commitId: item.commitId, cwd})
                })
                resolve([null, summary])
            })
        }).catch(err => [err]);
    }

    function getRevFiles({commitId, cwd}) {
        // TODO: --name-status 把文件提交属性输出
        let res = childProcess.execFileSync('git', ['show', commitId, '--name-only', '--pretty=format:""'], {cwd})
        res = res.toString('utf-8').slice(2).split('\n').filter(path => path!== '')
        return res
    }
}

/**
 * chrome extension的应用配置文件
 */
exports.getRepoConfig = async function (ctx, next) {
    let repoNames = Object.keys(CONFIG.repoMap);

    ctx.body = repoNames;
}

/**
 *download zip
 */
exports.downloadZip = async function (ctx, next) {

    const filename = `${global.dirname}/package-export/${ctx.params.id}.zip`;
    console.log('the file tobe download: ', filename);

    if (!fs.existsSync(filename)) {
        ctx.status = 404;
        ctx.body = 'file not exist';
        return;
    }

    ctx.attachment();
    ctx.body = fs.createReadStream(filename);
}

/**
 * commit webhook
 * since `pm2 reload`, this request response nothing!!!
 */
exports.gitPush = async function (ctx, next) {

    let [err, body] = await function () {
        return new Promise((resolve, reject) => {
            childProcess.exec('git pull && pm2 reload git-package', (err, stdout, stderr) => {
                if (err) {
                    console.log(`git-push hook failed, due to ${err}`)
                    ctx.status(500);
                    ctx.body = 'fail';
                    reject(['fail']);
                }

                console.log('git-push ok')
                resolve([null, 'ok'])
            })
        }).catch(err => reject([err]));
    }();

    if (err) {
        ctx.status = 500
        return ctx.body = err
    }
    ctx.body = body
}

/**
 * get version
 */
exports.getVersion = async function (ctx, next) {
    ctx.body = process.version;
}
