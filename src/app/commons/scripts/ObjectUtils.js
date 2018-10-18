// ReSharper disable NativeTypePrototypeExtending
(function () {
    Object.prototype.Clone = function() {
        var objClone;
        var constructor = this;
        if (constructor.constructor === Object) {
            objClone = new constructor.constructor();
        } else {
            objClone = new constructor.constructor(constructor.valueOf());
        }
        for (var key in constructor) {
            if (constructor.hasOwnProperty(key)) {
                if (objClone[key] !== constructor[key]) {
                    if (typeof (constructor[key]) == 'object') {
                        objClone[key] = constructor[key].Clone();
                    } else {
                        objClone[key] = constructor[key];
                    }
                }
            }
        }
        objClone.toString = constructor.toString;
        objClone.valueOf = constructor.valueOf;
        return objClone;
    };
})();