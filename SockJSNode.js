// #!/usr/bin/env node
var sockjs = require('sockjs');
var http = require('http'),
    colors = require('colors');

function sockJSNode(httpServer) {
    
    var sockjsServer = sockjs.createServer();
    
    
    sockjsServer.on('connection', function (conn) {
        console.log(conn);
        
        conn.on('data', function (message) {
            // conn.write("received " + message);
            
            switch (message) {
                case "best_quote":
                    setInterval(function () {
                        conn.write("best_quote " + new Date().toString());
                    }, 1000);
                    break;
                default:
                    conn.write("message: " + message);
                    break;
            }
        });
        
        conn.on('close', function () { });
    });
    
    
    
    sockjsServer.installHandlers(httpServer, { prefix: '/dataPush', websocket : true });
    
    
    return sockjsServer;
};

module.exports = sockJSNode;


