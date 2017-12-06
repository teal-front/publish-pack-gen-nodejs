'use strict';
/**
 * web server: download package.zip for Release System
 */

const Koa = require('koa');
const app = module.exports = new Koa();
const Router = require('koa-router');
const router = new Router();
const mainCtl = require('./lib/main-router');

global.dirname = __dirname;

app.listen(5200);
app.on('error', (err, cxt) => {
    console.log('Caught exception: ', err, cxt);
});

// add websocket server
require('./lib/websocket-server.js');

app.use(mainCtl.origin);

router.get('/get-revision-list', mainCtl.getRevisionList);
router.get('/get-repo-config', mainCtl.getRepoConfig);
router.get('/package-export/:id.zip', mainCtl.downloadZip);
router.get('/git-push', mainCtl.gitPush);
router.get('/getversion', mainCtl.getVersion);

app.use(router.routes()).use(router.allowedMethods());
