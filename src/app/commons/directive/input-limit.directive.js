(function (angular) {
    'use strict';

    angular.module('directives').directive('inputLimit', function () {
        
        Controller.$inject = ['$scope'];
        
        function Controller($scope) {
            var vm = this;
            var limitType = vm.limitType;
            
            //数字
            var handleNumber = function (input) {
                var reg = /^\-?\d*(\.\d{0,2})?$/;
                var abs = Math.abs(input);
                if (!reg.test(input) || abs > 100 || (abs === 0 && input.length >= 3 && (input + "").indexOf('.') === -1)){
                    input = (input + "").substring(0, input.length - 1);
                    vm.value = input;
                }else if((input + "").charAt(0) === '0' && (input + "").charAt(1) === '0'){
                    input = (input + "").substring(1, input.length);
                    vm.value = input;
                }else if((input + "").charAt(0) === '-' && (input + "").charAt(1) === '0' &&(input + "").charAt(2) === '0'){
                    input = '-'+(input + "").substring(2, input.length);
                    vm.value = input;
                }else if((input + "").charAt(0) === '.'){
                    input = '0'+(input + "").substring(0, input.length);
                    vm.value = input;
                }else if((input + "").charAt(0) === '-' && (input + "").charAt(1) === '.'){
                    input = '-0.'+(input + "").substring(2, input.length);
                    vm.value = input;
                }
            };
            
            //整型数字
            var handleIntNumber = function (input) {
                var reg = /^\d+$/;
                var abs = Math.abs(input);
                if (!reg.test(input) || abs > 99999999 || abs === 0) {
                    input = (input + "").substring(0, input.length - 1);
                    vm.value = input;
                }
            };
            
            var handleLength = function (input) {
                if (input.length > 200) {
                    input = (input + "").substring(0, 200);
                    vm.value = input;
                }
            };
            
            $scope.$watch('vm.value', function (newValue, oldValue) {
                if (newValue) {
                    if (limitType == "number") {
                        handleNumber(newValue);
                    } else if (limitType == "int") {
                        handleIntNumber(newValue);
                    } else if (limitType == "length") {
                        handleLength(newValue);
                    }
                }
            });
        };
        
        return {
            restrict : 'EA',
            scope : {
                'limitType' : '@inputLimit',
                'value' : '=ngModel',
            },
            bindToController : true,
            controller : Controller,
            controllerAs : 'vm'
        }

    });
})(angular);