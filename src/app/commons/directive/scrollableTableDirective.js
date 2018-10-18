(function (angular) {
    'use strict';
    
    angular.module('directives').directive('scrollableTableDirective', function () {
        
        //var injectedCtrl = ["$scope", function ($scope) {
        
        //    }
        //];
        return {
            restrict: 'A',
            replace: true, 
            template: function (element, attributes) {
                element.removeAttr("scrollable-table-directive");

                var body = element[0].outerHTML;
                element.find("tbody").remove();
                var head = element[0].outerHTML;
                
                return '<div><div class="scrollable_table_header">' + head +
                    '</div><div class="scrollable_table_body">' + body +'</div></div>';
            },
            compile: function (attr) {
                return {
                    pre: function preLink(scope, element, attributes) {
                    },
                    post: function postLink(scope, element, attributes) {
                    }
                };
            }
        };


    });

})(angular);