var colors = require("colors"),
    fs = require("fs");


// ReSharper disable UndeclaredGlobalVariableUsing
module.exports = function () {
    'use strict';

    var middleware = function(req, res, next) {

        var data = '';
        req.addListener('data', function(chunk) {
            data += chunk;
        }).addListener('end', function() {
            data = JSON.parse(data);

            res.status(200).send(JSON.stringify({}));
        });

    };
    
    return middleware;
}();

