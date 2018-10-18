(function (angular) {
    'use strict';
    angular.module('directives').directive('matrixTable', function () {
        function matrixTableController() {
            var vm = this;
            vm.showAll = true;
            
            vm.hoverline = function (rowIndex, columnIndex) {
                
                vm.hoverRow = rowIndex;
                vm.hoverColumn = columnIndex;

            };
            
            vm.leaveline = function () {
                vm.hoverRow = null;
                vm.hoverColumn = null;
            }
            
            
            var resetAll = function () {
                vm.rowsData.forEach(function (row) {
                    row.forEach(function (data) {
                        data.selected = false;
                    });
                });
            }
            
            vm.clickShowAll = function (type) {
                vm.showAll = true;
                if (vm.showAll) {
                    resetAll();
                }

                vm.onSelected({ type: type });
            }
            
            vm.clickData = function (data) {
                if ((data.max == null && data.min == null) || (data.max == 0 && data.min == 0) || data.type == "SHIBOR") {
                    return;
                }
                resetAll();
                data.selected = !data.selected;
                vm.showAll = false;
                vm.onSelected();
            };
        };
        
        
        return {
            restrict : 'A',
            templateUrl : 'app/commons/directive/matrix-table.html',
            scope : {
                tableHeaders : '=',
                rowsNames : '=',
                rowsData : '=',
                onSelected : '&'
            },
            bindToController : true,
            controller : matrixTableController,
            controllerAs : 'vm'
        }
    });
})(window.angular);