'use strict';

const childProcess = require('child_process');
const moment = require('moment')
const CONFIG = require('/etc/svn-package/config/config'); // demo中为../config/config

/**
 *
 * @param revision 版本号
 * @param repo node | node-cps
 */
module.exports = (data, cb) => {
    let revision = data.revision,
        appName = data.repo || 'node',
        comments = '', // req.body.comments,  todo
        repo = CONFIG.repoMap[appName];

// get file paths form revision
    let dirName = `${appName}--${moment(new Date()).format('YYYYMMDD_HHmmSS')}`;
// 把小的版本放前面，使后面的可以覆盖掉： 26677 26699 => 26699 26677
//revision = revision.split(/\s+/).map(v => +v).sort().join(' ')

    let sqliteParams = [];
    sqliteParams.push(moment(new Date()).format('YYYY-MM-DD HH:mm:SS'));
    sqliteParams.push(data.ip || '127.0.0.1'); // todo
    sqliteParams.push(appName);
    sqliteParams.push(comments);

// spawn
// `/bin/bash ./bin/createZip.sh`  than `./bin/createZip.sh`, avoid to set `createZip.sh` executable due to `git pull` will overwrite filemode default
    let createZip = childProcess.spawn('/bin/bash', ['/home/teal/svnPackage/bin/createZip.sh', dirName, repo.url, repo.dirPrefix, revision].concat(sqliteParams), {
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