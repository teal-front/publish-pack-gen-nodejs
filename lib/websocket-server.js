'use strict';
/**
 * 创建websocket服务，跟web共用TCP端口
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

    //resolve(connection);
});
/*wsServer.on('connect', function (conn) {
    console.log((new Date()) + ' Connection accepted.');
    conn.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + conn.remoteAddress + ' disconnected.');
    });


});*/


/*
module.exports = () => {
    return new Promise((resolve, reject) => {
        wsServer.on('connect', function (connection) {
            console.log((new Date()) + ' Connection accepted.');
            connection.on('close', function (reasonCode, description) {
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });

            resolve(connection);
        });


        /!*wsServer.on('request', function (request) {
            if (!originIsAllowed(request.origin)) {
                // Make sure we only accept requests from an allowed origin
                request.reject();
                console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
                return;
            }

            var connection = request.accept('echo-protocol', request.origin);

            console.log((new Date()) + ' Connection accepted.');
            connection.on('close', function (reasonCode, description) {
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });

            resolve(connection);
        });*!/

    })
}*/
