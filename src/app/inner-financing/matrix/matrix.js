(function (angular) {
    'use strict';
    angular.module('moneyMarketApp')
.controller('innerMatrixController', matrixController)
.service('innerMatrixService', matrixService);
    
    matrixController.$inject = ['innerMatrixService', '$scope', 'tableService', 'enumConfig', '$interval'];
    matrixService.$inject = ['$http', 'appConfig'];
    
    function matrixController(service, $scope, tableService, enumConfig, $interval) {
        var vm = this;
        
        //获取数据
        vm.rowsData = [];
        
        var initRowsData = function () {
            
            if (angular.isDefined(tableService.stopOfflineInterval)) {
                $interval.cancel(tableService.stopOfflineInterval)
            }
            if (angular.isDefined(tableService.stopInnerInterval)) {
                $interval.cancel(tableService.stopInnerInterval)
            }
            startInnerInterval();
            
            tableService.stopInnerInterval = $interval(startInnerInterval, 1000 * 60);
            
            function startInnerInterval() {
                vm.isLoading = true;
                console.log(new Date() + 'inner')
                
                service.getMatrixData({
                    direction: tableService.filter.direction,
                    quote_type: tableService.filter.quote_type,
                    province: tableService.filter.province
                }).success(function (res) {
                    vm.tableHeaders = res.result[0][0].map(function (item) {
                        return item.period.replace('T', '')
                    });
                    vm.rowsNames = res.result[0].map(function (item) {
                        return enumConfig.matrixRowName[item[0].type]
                    });
                    vm.rowsData = res.result[0];
                    tableService.originMatrix = vm.rowsData;
                    vm.isLoading = false;
                });
            }
        };
        
        vm.onSelected = function (type) {
            tableService.setMatrix(vm.rowsData);
            $scope.$emit('matrixChanged', { matrixCellType: type, target: 'inner' });
        };
        
        //响应筛选刷新矩阵
        $scope.$on('refreshMatrix', function (event, data) {
            initRowsData();
            tableService.setMatrix([]);
            $scope.$emit('matrixChanged', 'inner');
        });


    }
    
    function matrixService($http, appConfig) {
        
        var getMatrixData = function (data) {
            return $http.post('inner/matrix_price', data);
        }
        
        this.getMatrixData = getMatrixData;
    }

})(window.angular);