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
let childProcess = require('child_process');

const CONFIG = require('./config/config');

app.listen(5200, () => {
    process.on('uncaughtException', (err) => {
        console.log('Caught exception: ', err);
    });
});

app.use('/', (req, res, next) => {
    const WHITE_LIST = new Set(['chrome-extension://ecgacdaclhkkmfjijkpaphjjfidpnloh', // chrome store repo
        'chrome-extension://mmgmllafceeanpjdleekmcipmjdfjeea'                       // local repo
    ]);
    let reqOrigin = req.header('Origin');

    if (WHITE_LIST.has(reqOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', reqOrigin)
    }

    next()
})

// 下载zip文件
app.use('/down-zip', (req, res, next) => {
    let revision = req.query.revision,   // 版本号
        appName = req.query.repo || 'node',
        comments = '', // req.body.comments,  todo
        repo = CONFIG.repoMap[appName];

    // get file paths form revision
    let dirName = `${appName}--${moment(new Date()).format('YYYYMMDD_HHmmSS')}`;
    // 把小的版本放前面，使后面的可以覆盖掉： 26677 26699 => 26699 26677
    revision = revision.split(/\s+/).map(v => +v).sort().join(' ')

    let sqliteParams = [];
    sqliteParams.push(moment(new Date()).format('YYYY-MM-DD HH:mm:SS'));
    sqliteParams.push(req.ip);
    sqliteParams.push(appName);
    sqliteParams.push(comments);

    // spawn
    let createZip = childProcess.spawn(`./bin/createZip.sh`, [dirName, repo.url, repo.dirPrefix, revision].concat(sqliteParams), {
        // todo 日志并没有写进pm2,换成spawnSync也不行，gulpfile.js里面的spawnSync就可以
        //stdio: [process.stdin, process.stdout, process.stderr]
        //stdio: 'pipe'
    })
    createZip.stdout.on('data', (data) => {
        console.log(data.toString('utf8'));
    })
    createZip.stderr.on('data', (data) => {
        console.log(`createZip.sh error: ${data.toString('utf8')}`)
    })
    createZip.on('close', (code) => {
        if (code !== 0) {
            return console.log(`createZip.sh exit with error code ${code}`)
        }
        // todo 下载路径可以由shell脚本输出
        res.download(`/home/teal/svnPackage/package-export/${dirName}.zip`, (err) => {
            console.log(err ? `file download fail ${err}` : `${dirName} download success.`)
        })

    })
})

// 获取版本列表
app.use('/get-revision-list', (req, res, next) => {
    let repoName = req.query.repoName || 'node',
        keyword = CONFIG.repoMap[repoName].keyword, // 用来过滤提交版本中的其他项目文件
        repoUrl = CONFIG.repoMap[repoName].url;
    let author = req.query.author || '';         // 搜索版本的关键词

    console.log('--------search word:  ', author);
    // 拉取数量过多，下面的execFile可能会出现Error: stdout maxBuffer exceeded
    let cmdParams = ['log', '-l', '10']
        .concat(author == '' ? [] : ['--search', author])
        .concat(['-v', '--xml', repoUrl]);

    childProcess.execFile('svn', cmdParams, {maxBuffer: 102400}, (err, stdout, stderr) => {
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


app.use('/git-push', (req, res, next) => {
    childProcess.exec('git pull && pm2 reload svn-package')

    console.log('git-push ok.')

    res.end('ok')
})