var colors = require("colors"),
    fs = require("fs"),
    path = require('path');

// ReSharper disable UndeclaredGlobalVariableUsing
module.exports = function () {
    'use strict';
    
    function middleware(req, res, next) {
        if (/^\/src\/service/.test(req.originalUrl)) {
            
            var childMiddlewarePath = path.join(__dirname , "/service", req.method.toLowerCase(), req.originalUrl.replace("/src/service", ""));
            
            var responseWithError = function (code, message) {
                if (code instanceof String) {
                    code = parseInt(code);
                }
                
                res.writeHead(code, {
                    status: code.toString()
                });
                
                res.write(message);
                
                console.log(message);
                res.end();
            };
            
            var noModuleFound = function (path) {
                responseWithError(404, "No service found or load module failed for path: " + path);
            };
            
            var index = childMiddlewarePath.indexOf("?");
            if (index > 0) {
                childMiddlewarePath = childMiddlewarePath.substr(0, index);
            }
            
            var module = undefined;
            var e;
            try {
                module = require(childMiddlewarePath);
            } catch (e) {
                console.log(e.toString().red);
            }
            
            if (module) {
                try {
                    // ReSharper disable once InvokedExpressionMaybeNonFunction
                    module(req, res, next);
                } catch (e) {
                    responseWithError(500, "Execute error module: " + childMiddlewarePath + " message: " + e + " stack " + e.stack);
                }
            } else {
                noModuleFound(childMiddlewarePath);
            }
        } else {
            next();
        }
    }
    
    return middleware;
}();

