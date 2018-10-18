(function (angular) {
    'use strict';
    angular.module('directives').directive('marketTable', function () {
        
        var marketTableControllerInjector = [

            '$http', '$scope', '$q', '$uibModal', 'enumConfig', 
            'uiGridConstants', 'appConfig', 'offerService', 'qbService', 'contactService', 
            'sortService','$timeout',"$window","$location",

            function ($http, $scope, $q, $uibModal, enumConfig, 
                        uiGridConstants, appConfig, offerService, qbService, contactService, 
                        sortService, $timeout,$window,$location) {

                $scope.window = $window;
                $scope.location = $location;

                var dataDefine = {
                    quoteMethodDefine: {
                        SEF: { "displayName": "普通报价", "value": 'SEF' },
                        ALC: { "displayName": "联盟报价", "value": 'ALC' },
                        BRK: { "displayName": "代报价", "value": 'BRK' }
                    }
                };
                
                var vm = this;
                
                vm.showToTop = false; 	//滚定条非顶部
                vm.hasNewData = false;	//有新数据推送
                
                var dateToday = new Date();
                dateToday.setHours(0);
                dateToday.setMinutes(0);
                dateToday.setSeconds(0);
                dateToday.setMilliseconds(0);
                vm.today = dateToday.getTime();
                vm.enumConfig = enumConfig;
                
                //data赋值和grid刷新
                $scope.$watch('vm.list', function (newValue, oldValue) {
                    if (newValue)
                        vm.gridOptions.data = newValue;
                }, true);
                
                vm.getDataDown = function () {
                    var promise = $q.defer();
                    vm.loadData({
                        callback: function (page, totalPage) {
                            vm.gridApi.infiniteScroll.saveScrollPercentage();
                            vm.gridApi.infiniteScroll.dataLoaded(true, page <= totalPage).then(function () {
                                promise.resolve();
                            });
                        }
                    });
                    
                    return promise.promise;
                };
                
                //滑到顶部事件
                vm.scrollingTop = function () {
                    vm.hasNewData = false;
                    vm.showToTop = false;
                    var promise = $q.defer();
                    vm.gridApi.infiniteScroll.saveScrollPercentage();
                    vm.gridApi.infiniteScroll.dataLoaded(true, true).then(function () {
                        promise.resolve();
                    });
                    return promise.promise;
                };
                
                
                //滚动
                $scope.$watch('vm.gridApi.grid.isScrollingVertically', function (newValue) {
                    if (newValue) {
                        vm.showToTop = true;
                    }
                });
                
                //接收到新值推送
                $scope.$on('hasNewData', function () {
                    if (vm.showToTop)
                        vm.hasNewData = true;
                });
                
                
                //返回顶部
                vm.scrollToTop = function () {
                    vm.gridApi.core.scrollTo(vm.gridOptions.data[0]);
                    vm.showToTop = false;
                    vm.hasNewData = false;
                };
                
                //获取联系方式数组
                vm.getArray = function (str) {
                    if (str)
                        return str.split(/,|;/);
                };
                
                //复制QQ到剪切板
                var copyQQ = function (element, text) {
                    element.oncopy = function (e) {
                        e.clipboardData.setData('text/plain', text);
                        e.preventDefault();
                    };
                    document.execCommand("copy");
                };
                
                vm.clickQQ = function (event, quote) {
                    // copyQQ(event.target, quote.quote_userid);
                    
                    document.oncopy = function (e) {
                        e.clipboardData.setData('text/plain', quote.quote_userid);
                        e.preventDefault();
                    };
                    document.execCommand("copy");
                    vm.copyqqsuccess = true;

                    var qqcopy = document.getElementById('qqcopy');
                    qqcopy.style.left = +event.clientX + 190 + 'px';
                    qqcopy.style.top = +event.clientY - 70 + 'px';


                    vm.qqnumber = quote.quote_userid;

                    var qqtimer;
                    if(qqtimer) $timeout.cancel(qqtimer);
                    qqtimer = $timeout(function () {
                        vm.copyqqsuccess = false;
                    },1000);
                };
                
                //双击击报价方处理
                vm.clickOrg = function (quote) {
                    if (quote.source === "PRIME_QB") {
                        qbService.openStore(quote.institution_id, null, function () {
                            vm.openContactModal(quote);
                        });
                    } else if (quote.source === "QB") {
                        qbService.openQM(quote.quote_userid);
                    }
                };
                
                //单击精品报价QM图标
                vm.openContactModal = function (quote) {
                    contactService.openModal(quote, function (institution) {
                        $scope.$emit('institutionOffer', institution);
                    });
                };
                
                //单击普通报价QM图标
                vm.openQM = function (userId) {
                    qbService.openQM(userId);
                };
                
                //获取报价人QM状态
                vm.getContactStatus = function (quote) {
                    //var list = quote.quote_user_list;
                    //if (list) {
                    //    for (var i in list) {
                    //        if (list[i].qb_id == quote.quote_userid) {
                    //            return list[i].status == 1;
                    //        }
                    //    }
                    //}
                    //return false;
                    
                    // updated by Wei Lai 图表状态始终为高亮
                    return true;
                };
                
                vm.isToday = function (time) {
                    return parseInt(time) > vm.today;
                }
                
                vm.gridOptions = {
                    enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
                    rowHeight: 30,
                    infiniteScrollRowsFromEnd: 20,
                    infiniteScrollDown: true,
                    infiniteScrollUp: true,
                    onRegisterApi: function (gridApi) {
                        gridApi.infiniteScroll.on.needLoadMoreData($scope, vm.getDataDown);
                        gridApi.infiniteScroll.on.needLoadMoreDataTop($scope, vm.scrollingTop);
                        vm.gridApi = gridApi;
                    },
                    rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" ng-class="{warning:row.entity.isNew, inactive:row.entity.active==0}" class="ui-grid-cell" ui-grid-cell></div>',
                    columnDefs: [
                        {
                            name: '报价方',
                            width: "16%",
                            field: 'institution_name',
                            sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                            cellTemplate: '<div class="ui-grid-cell-contents pointer">\
                                            <div class="name" ng-if="row.entity.source==\'PRIME_QB\'" >\
                                                <img class="qm-logo active" src="app/commons/img/qmlogo.png" ng-click="grid.appScope.vm.openContactModal(row.entity)"> \
                                                <span ng-dblclick="grid.appScope.vm.clickOrg(row.entity)" uib-tooltip="{{row.entity.institution_name}}" tooltip-append-to-body="true" tooltip-animation="false" tooltip-placement="top-left">{{row.entity.institution_name}}</span> \
                                                <img src="app/commons/img/primelogo.png"/>\
                                            </div>\
                                            <div class="name" ng-if="row.entity.source==\'QB\'">\
                                                <img ng-click="grid.appScope.vm.openQM(row.entity.quote_userid)" class="qm-logo" ng-class="{active:grid.appScope.vm.getContactStatus(row.entity)}" src="app/commons/img/qmlogo.png"> \
                                                <span ng-dblclick="grid.appScope.vm.clickOrg(row.entity)" uib-tooltip="{{row.entity.institution_name}}-{{row.entity.quote_username}}" tooltip-append-to-body="true" tooltip-animation="false" tooltip-placement="top-left">\
                                                    {{row.entity.institution_name}}\
                                                    <span ng-if="row.entity.institution_name">-</span>\
                                                {{row.entity.quote_username}}</span>\
                                            </div>\
                                            <div class="name QQname" ng-if="row.entity.source==\'QQ\'" ng-click="grid.appScope.vm.clickQQ($event, row.entity)"  uib-tooltip="点击复制QQ号" tooltip-append-to-body="true" tooltip-animation="false" tooltip-placement="top-left"><img class="qq-logo"  src="app/commons/img/qqlogo.png"/> \
                                                {{row.entity.institution_name}}\
                                            </div>\
                                        </div>'
                        },
                        {
                            name: '联系方式',
                            width: "14%",
                            field: 'contact',
                            enableSorting: false,
                            cellTemplate: '<div uib-dropdown is-open="status.isopen" ng-class="{show:status.isopen}" class="ui-grid-cell-contents cell-contact">\
                                                <span uib-tooltip="{{grid.appScope.vm.getArray(row.entity.contact)[0] | telFmt:\'3-4-4\'}}" tooltip-append-to-body="true" tooltip-animation="false" tooltip-placement="top-left"><i class="glyphicon glyphicon-earphone" ng-if="grid.appScope.vm.getArray(row.entity.contact)[0]"></i> {{grid.appScope.vm.getArray(row.entity.contact)[0] | telFmt:\'3-4-4\'}}</span>\
                                                <span ng-if="grid.appScope.vm.getArray(row.entity.contact).length>1" class="btn btn-primary mif-more-vert" uib-dropdown-toggle></span>\
                                                <ul class="dropdown-menu dropdown-menu-left" uib-dropdown-menu >\
                                                    <li role="menuitem" ng-repeat="item in grid.appScope.vm.getArray(row.entity.contact) track by $index"><a><i class="glyphicon glyphicon-earphone"></i> {{item | telFmt:\'3-4-4\'}}</a></li>\
                                                </ul>\
                                        </div>'
                        },
                        {
                            name: '方向',
                            width: "5%",
                            maxWidth: 80,
                            minWidth: 50,
                            field: 'direction',
                            enableSorting: false,
                            cellTemplate: '<div class="ui-grid-cell-contents">\
                                            <div class="badge" ng-class="{\'IN\':\'warning\',\'OUT\':\'info\'}[row.entity.direction]">\
                                            {{row.entity.direction=="IN" ? "收" : "出"}}</div>\
                                        </div>'
                        },
                        {
                            name: '类型',
                            width: "8%",
                            field: 'quote_type',
                            enableSorting: false,
                            cellTemplate: '<div class="ui-grid-cell-contents">\
                                            {{grid.appScope.vm.enumConfig["quoteType"][row.entity.quote_type]}}\
                                        </div>'
                        },
                        {
                            name: '期限',
                            width: "8%",
                            sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                            sortingAlgorithm: sortService.sortTerm,
                            field: 'quote_period'
                        },
                        {
                            name: '数量',
                            width: "8%",
                            sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                            sortingAlgorithm: sortService.sortCount,
                            field: 'quote_quantity'
                        },
                        {
                            name: '价格',
                            width: "8%",
                            sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                            sortingAlgorithm: sortService.sortPrice,
                            field: 'quote_price',
                        },
                        {
                            name: '备注',
                            width: "*",
                            maxWidth: 700,
                            field: 'memo',
                            enableSorting: false,
                            cellTemplate: '<div class="ui-grid-cell-contents">\
                        <div class="text pointer" uib-tooltip="{{row.entity.memo}}" tooltip-append-to-body="true" tooltip-animation="false" tooltip-placement="top-left">\
                            {{row.entity.memo}}\
                        </div></div>'
                        },
                        // {
                        // 	name : '原文',
                        // 	field : 'remark'
                        // },
                        {
                            name: '最后更新',
                            width: "*",
                            minWidth: 160,
                            field: 'last_update',
                            sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                            sort: {
                                direction: uiGridConstants.DESC,
                                priority: 1
                            },
                            cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if="grid.appScope.vm.isToday(row.entity.last_update)">{{row.entity.last_update | date: "HH:mm:ss"}}</span><span ng-if="!grid.appScope.vm.isToday(row.entity.last_update)">{{row.entity.last_update | date: " yyyy-MM-dd HH:mm:ss"}}</span></div>'
                        }]
                };
                
                //若为线下资金去掉类型列
                if (vm.type == 'offline') {
                    vm.gridOptions.columnDefs.splice(3, 1);
                }

            }];
        
        return {
            restrict: 'AE',
            template: '<div class="back-to-top" ng-click="vm.scrollToTop()" ng-if="vm.showToTop && vm.hasNewData">出现新报价 点击查看</div>\
                        <div id="market" ui-grid="vm.gridOptions" class="grid" ui-grid-infinite-scroll></div>\
                        <div id="qqcopy" ng-show="vm.copyqqsuccess" class="copyqqsuccess"><img width="16px" height="16px" src="app/commons/img/true.png" alt=""> 您已成功复制QQ号{{vm.qqnumber}}</div>',
            controller: marketTableControllerInjector,
            scope: {
                list: '=',
                page: '=',
                loadData: '&',
                type: '='
            },
            bindToController: true,
            controllerAs: 'vm',
            compile:function () {
                return {
                    pre:function (scope,ele,attrs) {
                        var market = document.getElementById('market');
                        changeHeight();
                        scope.window.onresize = changeHeight;
                        function changeHeight() {
                            var wh = scope.window.innerHeight;
                            var ww = scope.window.innerWidth;
                            if(scope.location.url().indexOf('/offline') !== -1){
                                if(ww >= 1200){
                                    market.style.height = wh - 345 + 'px';
                                }else{
                                    market.style.height = wh - 375 + 'px';
                                }
                            }else{
                                if(ww >= 1200){
                                    market.style.height = wh - 315 + 'px';
                                }else{
                                    market.style.height = wh - 345 + 'px';
                                }
                            }
                        }
                    }
                }
            }
        }


    });

})(angular);