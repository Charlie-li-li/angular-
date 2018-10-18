(function (angular) {
    'use strict';
    
    angular.module('directives').filter('telFmt', ['$filter', function ($filter) {
            
            return function (number, format) {
                
                if (!angular.isString(format) || format.length <= 0) return number;

                if ((number + "").indexOf("-") > -1) return number;

                if ((number + "").substr(0,1) !== "1") return number;
                
                var target = "";
                var numIndex = 0;

                for (var i = 0; i <= format.length; i++) {
                    var char = format.charAt(i);

                    switch (char) {
                        case '-':
                            target += '-';
                            break;
                        default:
                            {
                                if (numIndex + (+char) >= number.length) {
                                    target += number.substr(numIndex, number.length - numIndex);
                                } else {
                                    target += number.substr(numIndex, (+char));
                                    numIndex += (+char);
                                }
                            }
                            break;
                    };
                }

                return target;
            };
        }]);
})(angular);