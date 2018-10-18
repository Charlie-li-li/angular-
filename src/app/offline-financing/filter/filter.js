(function (angular) {
    'use strict';
    
    var mainModule = angular.module('moneyMarketApp');
    
    
    mainModule.controller('offlineFilterController', ['$uibModal', '$scope', 'areaService', 'offlineFilterService', 'tableService', 'offerService', 'enumConfig', function ($uibModal, $scope, areaService, service, tableService, offerService, enumConfig) {
            
            var vm = this;
            vm.areas = [];
            vm.oldAreaList = [];
            
            //获取用户配置信息
            service.getUserArea().success(function (response) {
                var res = response.result;
                
                vm.boardDirection = offerService.dataDefine.boardDirection.map(function (e) { return { name: e.displayName + "资金", value: e.value }; });
                vm.selectBoardDirection = vm.boardDirection[1];
                vm.selectBoardDirection.selected = true;
                
                //托管资格
                vm.trustTypeList = res[0].trust_type;
                vm.trustTypeList[0].selected = true;
                vm.trustType = [vm.trustTypeList[0]];
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
                for (var i = 0; i < vm.oldAreaList.length ; ++i) {
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
                        }
                        else {
                            item.selected = true;
                        }
                    });
                    vm.areas = [];
                    vm.filterChanged();
                }
            }
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
                var trust_type;
                if (vm.trustType[0])
                    trust_type = vm.trustType[0].id;
                var provinces = vm.areas.map(function (item) {
                    return item.name;
                });
                
                if (provinces[0] == "全部") provinces = [];
                
                var direction = undefined;
                if (vm.selectBoardDirection[0]) {
                    direction = vm.selectBoardDirection[0].value;
                } else {
                    direction = offerService.dataDefine.boardDirection[1].value;
                }

                tableService.setFilter(trust_type, provinces, direction);
                $scope.$emit('filterChanged', 'offline');
            };
        }]);
    
    
    mainModule.service('offlineFilterService', ['$http', 'appConfig', function ($http, appConfig) {
            
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
        }
    ]);
    
    
    
    
    


})(angular);