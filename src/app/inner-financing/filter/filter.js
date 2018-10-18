(function (angular) {
    'use strict';
    
    var mainModule = angular.module('moneyMarketApp');
    
    mainModule.controller('innerFilterController', [
        
        '$uibModal', '$scope', 'areaService', 'innerFilterService', 'tableService', 'offerService', 'enumConfig', 
        function ($uibModal, $scope, areaService, service, tableService, offerService, enumConfig) {
            
            var vm = this;
            vm.quoteType = [];
            vm.areas = [];
            vm.oldAreaList = [];
            //获取用户配置信息
            service.getUserArea().success(function (response) {
                var res = response.result;
                
                vm.boardDirection = offerService.dataDefine.boardDirection.map(function (e) { return { name: e.displayName + "理财", value: e.value }; });
                vm.selectBoardDirection = vm.boardDirection[0];
                vm.selectBoardDirection.selected = true;

                //同业理财类型筛选项去掉同存
                vm.quoteTypeList = res[0].quote_type.slice(0, res[0].quote_type.length - 1);
                //同业理财类型默认选择非保本R2
                vm.quoteTypeList[1].selected = true;
                vm.quoteType = [vm.quoteTypeList[1]];
                //常用地区
                vm.areaList = [{ isAll : true, name : '全部', selected: true }].concat(res[0].region.map(function (item) {
                    return { name : item.province };
                }));
                
                //期限字典
                enumConfig.periodValue = res[0].period;
                
                // 获取用户报价权限
                enumConfig.quoteMethod = res[0].quote_method;
            });
            
            var operAfterSetArea = function () {
                var needReset = false;
                for (var i = 0; i < vm.oldAreaList.length; ++i) {
                    var itemOld = vm.oldAreaList[i];
                    if (itemOld.selected) {
                        var bFind = false;
                        for (var j = 0; j < vm.areaList.length; ++j) {
                            var itemNew = vm.areaList[j];
                            if (itemNew.name == itemOld.name) {
                                itemNew.selected = true;
                                bFind = true;
                                break;
                            }
                        }
                        
                        if (!bFind) {
                            needReset = true;
                            break;
                        }
                    }
                }
                
                if (needReset) {
                    vm.areaList.forEach(function (item) {
                        if (!item['isAll']) {
                            item.selected = false;
                        } else {
                            item.selected = true;
                        }
                    });
                    vm.areas = [];
                    vm.filterChanged();
                }
            };
            
            //设置常用地区
            vm.setArea = function () {
                areaService.openModal(vm.areaList, function (res) {
                    service.setUserArea(res.map(function (item) {
                        return item.name;
                    })).success(function () {
                        vm.oldAreaList = vm.areaList;
                        vm.areaList = [{
                                isAll : true,
                                name : '全部'
                            }].concat(res);
                        operAfterSetArea();
                    });
                });
            };
            
            //过滤修改事件
            vm.filterChanged = function () {
                var quote_type = undefined;
                if (vm.quoteType[0])
                    quote_type = vm.quoteType[0].id;
                var provinces = vm.areas.map(function (item) {
                    return item.name;
                });
                
                if (provinces[0] == "全部") provinces = [];

                var direction = undefined;
                if (vm.selectBoardDirection[0]) {
                    direction = vm.selectBoardDirection[0].value;
                } else {
                    direction = offerService.dataDefine.boardDirection[0].value;
                }

                tableService.setFilter(quote_type, provinces, direction);
                $scope.$emit('filterChanged', 'inner');
            };

        }]);
    
    
    mainModule.service('innerFilterService', ['$http', 'appConfig', function ($http, appConfig) {
            
            var getUserArea = function () {
                return $http.post('base/init_data');
            }
            
            var setUserArea = function (data) {
                return $http.post('base/setarea', {
                    province : data
                });
            }
            
            this.getUserArea = getUserArea;
            this.setUserArea = setUserArea;
        }]);
    
    
    
    

})(angular);