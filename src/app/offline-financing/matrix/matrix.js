(function () {
    'use strict';
    angular.module('moneyMarketApp')
.controller('offlineMatrixController', matrixController)
.service('offlineMatrixService', matrixService);
    
    matrixController.$inject = ['$scope', 'tableService', 'offlineMatrixService', 'enumConfig', '$interval'];
    
    function matrixController($scope, tableService, service, enumConfig, $interval) {
        var vm = this;
        
        //获取数据
        vm.rowsData = [];
        
        var initRowsData = function () {
            
            if (angular.isDefined(tableService.stopInnerInterval)) {
                $interval.cancel(tableService.stopInnerInterval)
            }
            
            if (angular.isDefined(tableService.stopOfflineInterval)) {
                $interval.cancel(tableService.stopOfflineInterval)
            }
            startOfflineInterval();
            
            tableService.stopOfflineInterval = $interval(startOfflineInterval, 1000 * 60);
            
            function startOfflineInterval() {
                vm.isLoading = true;
                console.log(new Date() + 'offline')
                
                service.getMatrixData({
                    direction: tableService.filter.direction,
                    trust_type : tableService.filter.trust_type,
                    province : tableService.filter.province
                }).success(function (res) {
                    vm.tableHeaders = res.result[0][0].map(function (item) { return item.period.replace('T', '') });
                    vm.rowsNames = res.result[0].map(function (item) { return enumConfig.matrixRowName[item[0].type] });
                    vm.rowsData = res.result[0];
                    tableService.originMatrix = vm.rowsData;
                    vm.isLoading = false;

                });
            }
        };
        
        vm.onSelected = function (type) {
            tableService.setMatrix(vm.rowsData);
            $scope.$emit('matrixChanged', { matrixCellType: type, target: 'offline' });
        };
        
        //响应筛选刷新矩阵
        $scope.$on('refreshMatrix', function (event, data) {
            initRowsData();
            tableService.setMatrix([]);
            $scope.$emit('matrixChanged', 'offline');
        });

    }
    
    
    matrixService.$inject = ['$http', 'appConfig'];
    function matrixService($http, appConfig) {
        
        var getMatrixData = function (data) {
            return $http.post('offline/matrix_price', data);
        }
        
        this.getMatrixData = getMatrixData;
    }

})();