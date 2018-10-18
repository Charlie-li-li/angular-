(function (angular) {
    'use strict';
    
    angular.module('services').controller('queryAllianceQuoteController', [
        '$scope', '$uibModalInstance', 'offerService', 'qbService', 'boardQuery', 
        function ($scope, $uibModalInstance, offerService, qbService, boardQuery) {
            
            var dataDefine = {
                //业务类型初始化
                typeListDefine: [
                    { "displayName": "同存", "value": 'IBD', "direction": 'IN' },
                    { "displayName": "保本", "value": 'GTF', "direction": 'OUT' },
                    { "displayName": "非保本R2", "value": 'UR2', "direction": 'OUT' },
                    { "displayName": "非保本R3", "value": 'UR3', "direction": 'OUT' }
                ],
                filterDefine: [
                    { "displayName": "同业存款", "value": 'IBD', "direction": 'IN', 'contactType': 'CD' },
                    { "displayName": "同业理财", "value": '^IBD', "direction": 'OUT', 'contactType': 'FI' },
                ]
            };
            
            function periodSorter(p1, p2) {
                if (p1.type && p2.type) return p1.id - p2.id;
                
                if (p1.type && !p2.type) return -1;
                if (!p1.type && p2.type) return 1;
                
                return p1.daysHighValue - p2.daysHighValue;
            };
            
            $scope.onClickQuoteType = function (event) {
                if (!event || !event.target) return;
                
                if (event.target.nodeName === "A") {
                    var scope = angular.element(event.target).scope();
                    
                    if (scope) $scope.selectType = scope.item;
                }
            };
            
            $scope.boardListFilter = function (item, index, list) {
                switch ($scope.selectType.value) {
                    case "IBD":
                        return "IBD" === item.type.value;
                    default:
                        return "IBD" !== item.type.value;
                }
            };

            $scope.filterContactList = function (list) {
                if (!list || list.length < 0 || !(list instanceof Array)) return [];

                return list.findWhere(function(e) {
                    return e.quoteAttribute === $scope.selectType.contactType;
                });
            };

            $scope.onClickHeader = function (event) {
                if (!event || !event.target || (event.target.nodeName !== "TH" && event.target.nodeName !== "I")) return;
                var attr = event.target.attributes.getNamedItem("tag");
                
                if (!attr || !attr.nodeValue) return;
                
                if (!$scope.tableSorterParam) $scope.tableSorterParam = { prop: attr.nodeValue, asc: 1 };
                else {
                    if ($scope.tableSorterParam.prop === attr.nodeValue) {
                        $scope.tableSorterParam.asc = $scope.tableSorterParam.asc * -1;
                    } else {
                        $scope.tableSorterParam.prop = attr.nodeValue;
                        $scope.tableSorterParam.asc = 1;
                    }
                }
                
                $scope.boardList.sort(function (v1, v2) {
                    if (!$scope.tableSorterParam || !$scope.tableSorterParam.prop) return 0;
                    if (!$scope.tableSorterParam.asc) $scope.tableSorterParam.asc = 1;
                    
                    switch ($scope.tableSorterParam.prop) {
                        case "institution":
                            {
                                // return (v1.displayOrder - v2.displayOrder) * $scope.tableSorterParam.asc;
                                // $scope.boardList.map(function(e){ return e.institutionInfo.institutionNamePY;})
                                return function (s1, s2) {
                                    if (!s1 || s1.length === 0) return -1 * $scope.tableSorterParam.asc;
                                    if (!s2 || s2.length === 0) return 1 * $scope.tableSorterParam.asc;
                                    
                                    var index = 0;
                                    
                                    while (index < 40) {
                                        if (s1[index] === s2[index]) {
                                            index++;
                                            continue;
                                        }
                                        
                                        return (s1[index] > s2[index] ? -1 : 1) * $scope.tableSorterParam.asc;
                                    }

                                }(v1.institutionInfo.institutionNamePY, v2.institutionInfo.institutionNamePY);
                            }
                        default:
                            {
                                var obj = JSON.parse($scope.tableSorterParam.prop);
                                if (!obj) return 0;
                                
                                function searcher(e) {
                                    if (e.type === obj.type) {
                                        return true;
                                    } else {
                                        return e.daysLowValue === obj.daysLowValue && e.daysHighValue === obj.daysHighValue;
                                    }
                                };
                                
                                var val1 = v1.periodList.findItem(searcher);
                                var val2 = v2.periodList.findItem(searcher);
                                
                                if (!val1 || !val1.period) return -1 * $scope.tableSorterParam.asc;
                                if (!val2 || !val2.period) return 1 * $scope.tableSorterParam.asc;
                                
                                return $scope.tableSorterParam.asc * (val1.period - val2.period);
                            }
                    }
                });
            };
            
            $scope.isCurrentPeriodSorted = function (period) {
                if (!$scope.tableSorterParam || $scope.tableSorterParam.prop === "institution") return false;
                return JSON.parse($scope.tableSorterParam.prop).header === period.header;
            };
            
            //单击普通报价QM图标
            $scope.openQM = function (userId) {
                qbService.openQM(userId);
            };
            
            //取消
            $scope.onClickCancel = function () {
                $uibModalInstance.dismiss();
            };
            
            var initView = function () {
                $scope.boardQuery = boardQuery;
                
                $scope.periodList = angular.copy(offerService.dataDefine.periodDefine);
                
                $scope.typeList = angular.copy(dataDefine.filterDefine);
                $scope.selectType = $scope.typeList[0];
                
                $scope.boardList = [];
                
                if (boardQuery) {
                    
                    $scope.institutionName = boardQuery.institutionName;
                    $scope.lastUpdate = boardQuery.lastUpdate;
                    
                    if (boardQuery.MmQuoteWithContactDto && boardQuery.MmQuoteWithContactDto.length > 0 && boardQuery.MmQuoteWithContactDto instanceof Array) {
                        
                        boardQuery.MmQuoteWithContactDto.forEach(function (item, index) {
                            
                            if (!item.mmQuoteDto) return;
                            
                            var board = offerService.boardFactory(item.mmQuoteDto, $scope.periodList);
                            
                            board.telephone = item.telephone;
                            
                            board.methodType = dataDefine.typeListDefine.findItem(function (e) { return e.value === item.mmQuoteDto.methodType; });
                            
                            board.type = dataDefine.typeListDefine.findItem(function (e) { return e.value === item.mmQuoteDto.quoteType; });
                            
                            board.contacts = item.contacts;
                            
                            board.institutionInfo = {
                                institutionId: item.mmQuoteDto.institutionId,
                                institutionName: item.mmQuoteDto.institutionName,
                                displayName: item.mmQuoteDto.institutionName,
                                institutionNamePY: item.mmQuoteDto.institutionNamePY
                            };
                            
                            // 同步以上行中的报价列
                            $scope.boardList.forEach(function (item1, index1) {
                                if (item1.periodList && item1.periodList.length < board.periodList.length) {
                                    item1.periodList.push.apply(item1.periodList, angular.copy($scope.periodList).slice(item1.periodList.length - board.periodList.length));
                                }
                            });
                            
                            $scope.boardList.push(board);
                        });
                    }
                }
                
                // 对所有自定义期限排序显示
                $scope.periodList.sort(periodSorter);
                
                $scope.boardList.forEach(function (item, index) {
                    item.periodList.sort(periodSorter);
                });
            }();

        }]);
    


})(angular);