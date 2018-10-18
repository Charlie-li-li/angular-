(function () {
    'use strict';
    angular.module('directives')
        .directive('qbTable', function () {
        
        Controller.$inject = ["$scope", "$q", "$http", "appConfig", "enumConfig", "uiGridConstants", "contactService", "qbService", "offerService", "sortService","$window","$location"];
        
        function Controller($scope, $q, $http, appConfig, enumConfig, uiGridConstants, contactService, qbService, offerService, sortService,$window,$location) {
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
            
            var dateToday = new Date();
            dateToday.setHours(0);
            dateToday.setMinutes(0);
            dateToday.setSeconds(0);
            dateToday.setMilliseconds(0);
            vm.today = dateToday.getTime();
            vm.enumConfig = enumConfig;
            
            vm.showToTop = false; 	//滚定条非顶部
            vm.hasNewData = false;	//有新数据推送
            
            $scope.$watch('vm.list', function (newValue, oldValue) {
                if (newValue) {
                    vm.gridOptions.data = newValue;
                }
            }, true);
            
            
            //翻页获取数据
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
            
            //获取联系方式数组
            vm.getArray = function (str) {
                if (str)
                    return str.split(/,|;/);
            };
            
            //打开QM
            vm.openQM = function (user) {
                qbService.openQM(user.qb_id);
            };
            
            //点击机构
            vm.clickOrg = function (quote) {
                   qbService.openStore(quote.institution_id, null, function () {
                       contactService.openModal(quote, function (institution) {
                           $scope.$emit('institutionOffer', institution);
                       });
                   });
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
                        name: '机构',
                        width: "10%",
                        field: 'institution_name',
                        sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                        cellTemplate: '<div class="ui-grid-cell-contents pointer">\
                                            <div class="name" ng-dblclick="grid.appScope.vm.clickOrg(row.entity)" uib-tooltip="{{row.entity.institution_name}}" tooltip-append-to-body="true" tooltip-animation="false" tooltip-placement="top-left">{{row.entity.institution_name}}</div>\
                                        </div>',
                    },
                    {
                        name: '联系人',
                        width: "10%",
                        // minWidth: 120,
                        field: 'quote_user_list',
                        sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                        cellTemplate: '<div class="ui-grid-cell-contents cell-user-list" uib-dropdown ng-class="{show:status.isopen}" is-open="status.isopen" ng-if="row.entity.quote_user_list.length>0">\
                                            <span uib-tooltip="{{row.entity.quote_user_list[0].name}}" tooltip-append-to-body="true" tooltip-animation="false" tooltip-placement="top-left"><img src="app/commons/img/qmlogo.png" class="qm-logo pointer active" ng-class="{active : row.entity.quote_user_list[0].status}" ng-click="grid.appScope.vm.openQM(row.entity.quote_user_list[0],row.entity.source)"> {{row.entity.quote_user_list[0].name}}</span>\
                                            <span class="btn btn-primary mif-more-vert" uib-dropdown-toggle ng-if="row.entity.quote_user_list.length>1"></span>\
                                            <ul class="dropdown-menu dropdown-menu-left" uib-dropdown-menu role="menu" ng-if="row.entity.quote_user_list.length>1">\
                                                <li role="menuitem" ng-repeat="item in row.entity.quote_user_list"><a ng-click="grid.appScope.vm.openQM(item,row.entity.source)">\
                                                <img class="qm-logo active" ng-class="{active : item.status}" src="app/commons/img/qmlogo.png"> {{item.name}}</a></li>\
                                            </ul>\
                                    </div>'
                    },
                    {
                        name: '联系方式',
                        width: "14%",
                        field: 'contact',
                        enableSorting: false,
                        cellTemplate: '<div class="ui-grid-cell-contents cell-contact">\
                                            <span uib-tooltip="{{grid.appScope.vm.getArray(row.entity.contact)[0] | telFmt:\'3-4-4\'}}" tooltip-append-to-body="true" tooltip-animation="false" tooltip-placement="top-left"><i class="glyphicon glyphicon-earphone" ng-if="grid.appScope.vm.getArray(row.entity.contact)[0]"></i> {{grid.appScope.vm.getArray(row.entity.contact)[0] | telFmt:\'3-4-4\'}}</span>\
                                            <span uib-dropdown ng-if="grid.appScope.vm.getArray(row.entity.contact).length>1">\
                                                <span class="btn btn-primary mif-more-vert" uib-dropdown-toggle></span>\
                                                <ul class="dropdown-menu dropdown-menu-right" uib-dropdown-menu >\
                                                    <li ng-repeat="item in grid.appScope.vm.getArray(row.entity.contact) track by $index"><a>{{item | telFmt:\'3-4-4\'}}</a></li>\
                                                </ul>\
                                            </span>\
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
                vm.gridOptions.columnDefs.splice(4, 1);
            }

        }
        
        
        return {
            restrict: 'AE',
            template: '<div class="back-to-top" ng-click="vm.scrollToTop()" ng-if="vm.showToTop && vm.hasNewData">出现新报价 点击查看</div>\
                        <div id="qb" ui-grid="vm.gridOptions" class="grid" ui-grid-infinite-scroll></div>',
            scope: {
                list: '=',
                page: '=',
                loadData: '&',
                type: '='
            },
            controller: Controller,
            bindToController: true,
            controllerAs: 'vm',
            compile:function () {
                return {
                    pre:function (scope,ele,attrs) {
                        var qb = document.getElementById('qb');
                        changeHeight();
                        scope.window.onresize = changeHeight;
                        function changeHeight() {
                            var wh = scope.window.innerHeight;
                            var ww = scope.window.innerWidth;
                            if(scope.location.url().indexOf('/offline') !== -1){
                                if(ww >= 1200){
                                    qb.style.height = wh - 345 + 'px';
                                }else{
                                    qb.style.height = wh - 375 + 'px';
                                }
                            }else{
                                if(ww >= 1200){
                                    qb.style.height = wh - 315 + 'px';
                                }else{
                                    qb.style.height = wh - 345 + 'px';
                                }
                            }
                        }
                    }
                }
            }
        }


    });

})();