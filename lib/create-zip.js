'use strict';

const childProcess = require('child_process');
const moment = require('moment')
const CONFIG = require('../config/config');
const path = require('path')

/**
 *
 * @param data
 * @param data.commitIds 版本号列表, 后提交的版本号放前面
 * @param data.repo 仓库地址
 */
module.exports = (data, cb) => {
    let commitIds = data.revision,
        appName = data.repo || 'node',
        repo = CONFIG.repoMap[appName];

// get file paths form commitIds
    let dirName = `${appName}--${moment(new Date()).format('YYYYMMDD_HHmmSS')}`;
console.log(__dirname)
// spawn
// `/bin/bash ./bin/createZip.sh`  than `./bin/createZip.sh`, avoid to set `createZip.sh` executable due to `git pull` will overwrite filemode default
    let createZip = childProcess.spawn('/bin/bash', [path.resolve(__dirname, '../bin/create-zip.sh'), dirName, repo.dirPrefix, repo.repoDir, commitIds], {
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
            console.log(`createZip.sh exit with error code ${code}`)
            return cb(`${code}`)
        }
        cb(null, {
            type: 'download',
            data: {
                packageName: `${dirName}.zip`
            }
        })

    })
}
