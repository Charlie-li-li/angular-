(function () {
    'use strict';
    angular.module('services').service('tabNavigatorService', [function () {
            
            this.findNextTd = function (e, onFind) {
                
                if (!e || !e.srcElement) return;
                
                var currentTabIndex = e.srcElement.parentElement.tabIndex;
                
                var table = $(e.srcElement).parentsUntil("table");
                
                var targetElem = undefined;
                for (var i = currentTabIndex + 1; i < currentTabIndex + 10; i++) {
                    targetElem = table.find('td[tabIndex=' + i + ']');
                    if(targetElem && targetElem.length > 0) break;
                }

                if (onFind && targetElem && targetElem.length > 0) onFind(targetElem);
            };

            this.safeApply = function (scope, fn) {
                var phase = scope.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof (fn) === 'function')) {
                        fn();
                    }
                } else {
                    try {
                        scope.$apply(fn);
                    } catch (e) {

                    }
                }
            };

        }]);
})();