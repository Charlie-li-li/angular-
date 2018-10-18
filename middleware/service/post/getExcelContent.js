var colors = require("colors"),
    fs = require("fs");


// ReSharper disable UndeclaredGlobalVariableUsing
module.exports = function () {
    'use strict';
    
    function decodeBase64(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]*);base64,(.+)$/),
            response = {};
        
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        
        return response;
    }
    
    var middleware = function (req, res, next) {
        
        var data = '';
        req.addListener('data', function (chunk) {
            data += chunk;
        }).addListener('end', function () {
            data = JSON.parse(data);
            
            var base64 = data.data;
            
            //var binaryData = new Buffer(base64.replace("data:;base64,", ""), 'base64');
            
            // fs.writeFileSync("c:\\temp\\out.xlsx", binaryData, "base64");

            try {
                fs.writeFileSync("c:\\temp\\out.xlsx", decodeBase64(base64).data, 'base64');
            } catch (e) {

            } 

            

            res.sendStatus(200);
        });
        
        
    }
    
    return middleware;
}();

