//  The server providing mock service

var colors = require("colors"),
    express = require("express"),
    // wsServer = require("./wsandlocalmessage.js");
    wsServer = require("./sockJSNode.js"),
    path = require("path");

// Web server
var app = express();
var port = process.env.port || 1337;
var router = express.Router();
var regExp = '/\**/';

// Http server
router.get(regExp, function (req, res, next) {
    if (/^\/service/.test(req.originalUrl)) {
        next();
    } else {
        var url = req.originalUrl === '/' ? 'index.html' : req.originalUrl;
        
        // ReSharper disable UseOfImplicitGlobalInFunctionScope
        url = path.join(__dirname, '.', url);
        
        var index = url.indexOf("?");
        if (index > 0) {
            url = url.substr(0, index);
        }
        
        res.sendFile(url, function (err) {
            if (err) {
                console.log("Get ".red + err.statusCode + " " + err.message + " " + url);
            } else {
                console.log("Get ".green + res.statusCode + " " + res.statusMessage + " " + url);
            }
            
            try {
                if (err) res.sendStatus(404);
            } catch (e) {

            }
        });
    }
});

// Services
router.all(regExp, require('./middleware/serviceRouter'));

// Mock services
// router.all(regExp, require('./mock/mock_service'));

app.use(regExp, router);

console.log(app.routes);

// 一般来说非强制性的错误处理一般被定义在最后
// 错误处理的中间件和普通的中间件定义是一样的， 只是它必须有4个形参， 这是它的形式： (err, req, res, next):
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Something broke!');
});

wsServer(app.listen(port, function () {
    console.log("Listening on " + port);
    
    // require('child_process').exec('start "" "http://localhost:' + port + '"');
}));

// supervisor server.js
