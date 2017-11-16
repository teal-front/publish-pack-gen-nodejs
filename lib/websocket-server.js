'use strict';
/**
 * 创建websocket服务，跟web共用TCP端口
 *
 * 2017-11-15: 尝试启用cluster，webSocket开启多个tcp port，结合nginx的ip_hash功能
 *     但是pm2对进程启用多个port，但每次也只是重启app，而不是强制产生一个:
 *     pm2: WebSocketPort=5202 pm2 start pm2.json -f
 *          WebSocketPort=5203 pm2 start pm2.json -f
 *          WebSocketPort=5204 pm2 start pm2.json -f
 *     尝试用环境变量自增也不行，环境变量应该是master的，worker改变不了:
 *         WebSocketPort=5202 pm2 start pm2.json
 *        ./lib/websocket-server.js :  port = process.env.WebSocketPort; port++;
 */

const http = require('http')
const WebSocketServer = require('websocket').server;


var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(5201, function () {
    console.log((new Date()) + ' Server is listening on port 5201');
});

var wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});


function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}
wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);

    console.log((new Date()) + ' Connection accepted.');
    const createZip = require('./create-zip.js');

    connection.on('message', (event) => {
        if (event.type !== 'utf8') {
            return;
        }

        console.log(event)
        let fullData = JSON.parse(event.utf8Data), data = fullData.data;

        if (fullData.type === 'download') {
            createZip(data, (err, urlData) => {
                if (err) {
                    return connection.sendUTF(err)
                }
                connection.sendUTF(JSON.stringify(urlData));
            })
        }
    })
    connection.on('close', function (reasonCode, description) {
        console.log(reasonCode, description);
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
