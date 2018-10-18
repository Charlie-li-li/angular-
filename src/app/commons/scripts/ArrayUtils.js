// Created 2016/06/30
// ReSharper disable NativeTypePrototypeExtending
(function () {
    
    Array.prototype.indexOfItem = function (exp) {
        if (!(typeof exp === "function")) return undefined;
        
        var targetIndex = undefined;
        
        this.forEach(function (item, index) {
            if (exp(item) && !targetIndex) targetIndex = index;
        });
        
        return targetIndex;
    };
    
    Array.prototype.lastIndexOfItem = function (exp) {
        if (!(typeof exp === "function")) return undefined;
        
        var targetIndex = undefined;
        
        this.forEach(function (item, index) {
            if (exp(item)) targetIndex = index;
        });
        
        return targetIndex;
    };
    
    Array.prototype.findItem = function (exp) {
        if (!(typeof exp === "function")) return undefined;
        
        var target = undefined;
        
        this.forEach(function (item, index) {
            if (exp(item) && !target) target = item;
        });
        
        return target;
    };

    Array.prototype.findWhere = function(exp) {
        if (!(typeof exp === "function")) return [];

        var result = [];

        this.forEach(function (item, index) {
            if (exp(item)) result.push(item);
        });

        return result;
    };


})();