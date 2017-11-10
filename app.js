/* 
 * web server: download package.zip for odmspay.oa.com
 *
 */
'use strict';

let express = require('express');
let app = express();
let parseString = require('xml2js').parseString;
let moment = require('moment')

let path = require('path');
let fs = require('fs')
let childProcess = require('child_process');

// demo中为./config/config
const CONFIG = require('/etc/svn-package/config/config');

app.listen(5200, () => {
    console.log('Express app listen on port 5200')
    process.on('uncaughtException', (err) => {
        console.log('Caught exception: ', err);
    });
});

// add websocket server
require('./lib/websocket-server.js');

app.use('/', (req, res, next) => {
    const WHITE_LIST = new Set(['chrome-extension://ecgacdaclhkkmfjijkpaphjjfidpnloh', // chrome store repo
        'chrome-extension://bbhfhjdpidicepidikpejfdkepeblaom',                       // local
    ]);
    let reqOrigin = req.header('Origin');

    if (WHITE_LIST.has(reqOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', reqOrigin)
    }

    next()
})

// 获取版本列表
app.use('/get-revision-list', (req, res, next) => {
    res.setTimeout(20000);

    let repoName = req.query.repoName || 'node',
        keyword = CONFIG.repoMap[repoName].keyword, // 用来过滤提交版本中的其他项目文件
        repoUrl = CONFIG.repoMap[repoName].url;
    let author = req.query.author || '';         // 搜索版本的关键词

    console.log('--------search word:  ', author);
    // 拉取数量过多，下面的execFile可能会出现Error: stdout maxBuffer exceeded
    let cmdParams = ['log', '-l', '20']
        .concat(author == '' ? [] : ['--search', author])
        .concat(['-v', '--xml', repoUrl]);

    childProcess.execFile('svn', cmdParams, {maxBuffer: 1000 * 1024}, (err, stdout, stderr) => {
        if (!err) {
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

                res.json(summary)

            });
        } else {
            console.log('svn log failed!');
            console.log(err);
        }
    })
})

// chrome extension的应用配置文件
app.use('/get-repo-config', (req, res, next) => {
    let repoNames = Object.keys(CONFIG.repoMap);

    res.json(repoNames);
})

// download zip
app.use('/package-export/:id.zip', (req, res, next) => {
    let filename = `./package-export/${req.params.id}.zip`
    console.log('the file tobe downloda: ', filename);

    if (!fs.existsSync(filename)) {
        res.end('file not exist');
    }

    res.download(filename);
})


// http://techdoc.oa.com/teal/svnPackage/hooks上设置的commit webhook
app.use('/git-push', (req, res, next) => {
    // since `pm2 reload`, this request response nothing!!!
    childProcess.exec('git pull && pm2 reload svn-package', (err, stdout, stderr) => {
        if (err) {
            console.log(`git-push hook failed, due to ${err}`)
            return res.status(500).end('fail')
        }
        
        console.log('git-push ok')
        res.end('ok')
    })
})

app.use('/getversion', (req, res) => {
   res.end(process.version)
})