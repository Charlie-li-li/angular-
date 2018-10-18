// ReSharper disable NativeTypePrototypeExtending
(function () {
    Number.prototype.toFixed = function (len) {
        var add = 0;
        
        // if number < 0
        var mFlag = this < 0;
        
        // if (mFlag) debugger;
        
        var s1 = mFlag? -this + "" : this + "";
        
        var start = s1.indexOf(".");
        if (s1.substr(start + len + 1, 1) >= 5) add = 1;
        var temp = Math.pow(10, len);
        var s = Math.floor((mFlag? -this : this) * temp) + add;
        
        return mFlag? -(s / temp) : s / temp;
    };
})();