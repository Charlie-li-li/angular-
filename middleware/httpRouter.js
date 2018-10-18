var colors = require("colors"),
    fs = require("fs"),
    path = require('path');

// ReSharper disable UndeclaredGlobalVariableUsing
module.exports = function () {
    'use strict';
    
    var config = require("../modules/configs");
    
    function middleware(req, res, next) {
        var url = req.originalUrl === '/' ? 'index.html' : req.originalUrl;
        
        // ReSharper disable UseOfImplicitGlobalInFunctionScope
        url = /^\/bower_components/.test(url) ? path.join(__dirname, "../", url) : path.join(config.httpBasePath, url);

        var index = url.indexOf("?");
        if (index > 0) {
            url = url.substr(0, index);
        }

        res.sendFile(url, function (err) {
            if (err) {
                // console.log("Get ".red + err.statusCode + " " + err.message + " " + url);
            } else {
                console.log("Get ".green + res.statusCode + " " + res.statusMessage + " " + url);
                next();
            }
            
            try {
                if (err) res.sendStatus(404);
            } catch (e) {

            }
        });
    }
    
    return middleware;
}();

