(function (angular) {
    'use strict';
    angular.module('moneyMarketApp')
        .controller('tableController', tableController);
    
    tableController.$inject = ['$scope', 'commonService', 'tableService', 'offerService', 'financingType', 'enumConfig', '$timeout', 'userinfoService'];
    
    function tableController($scope, commonService, service, offerService, financingType, enumConfig, $timeout, userinfo) {
        var vm = this;
        
        //初始化服务里各项参数
        service.initOptions();
        
        //判断同业理财还是线下资金，修改service里的请求URL
        vm.financingType = financingType;
        if (financingType == 'inner') {
            service.setFinancingType('inner');
        } else if (financingType == 'offline') {
            service.setFinancingType('offline');
        }
        
        vm.state = 'qb';
        //QB报价页数初始化和市场报价页数初始化
        var initPage = function () {
            vm.qbPage = 1, vm.marketPage = 1;
        };
        initPage();
        
        
        //初始化数据
        vm.initData = function (type) {
            if (!type) type = vm.state;
            initPage();
            clearGridData(vm.state);
            vm.isLoading = true;
            
            
            var initQbList = function () {
                vm.state = 'qb';
                service.getQbOfferList(1, true).success(function (res) {
                    vm.qbOfferList = res.result;
                    vm.qbTotalPageCount = res.total_page_count;
                    vm.isLoading = false;
                });
            };
            
            var initMarketList = function () {
                vm.state = 'market';
                service.getMarketOfferList(1, true).success(function (res) {
                    vm.marketOfferList = res.result;
                    vm.marketTotalPageCount = res.total_page_count;
                    vm.isLoading = false;
                });
            };
            
            switch (type) {
                case 'qb':
                    initQbList();
                    break;
                case 'market':
                    initMarketList();
                    break;
            }
        };
        
        //切换QB精品和市场报价
        vm.switchOfferType = function (type) {
            if (type == vm.state) return;
            vm.initData(type);
        };
        
        
        //searchtype中文和枚举映射
        var searchTypeEnum = {
            "机构": "INSTITUTE",
            "QB用户": "CONTACT",
            "QQ用户": "QQ",
            "备注": "MEMO"
        };
        
        vm.clickSearchInput = function () {
            vm.openDropdown = !vm.openDropdown;
        };
        
        vm.clickSearchClose = function () {
            vm.searchKeyword = '';
            searchBoxEnter();
        }
        
        //执行输入搜索
        vm.memoType = "备注";
        var searchKeyword = _.debounce(function () {
            if (!vm.searchKeyword) return;
            
            service.searchKeyword(vm.searchKeyword).success(function (response) {
                var res = response.result;
                vm.orgList = res[0].list;
                vm.orgType = res[0].type;
                vm.qbUserList = res[1].list;
                vm.qbUserType = res[1].type;
                vm.qqUserList = res[2].list;
                vm.qqUserType = res[2].type;
                vm.memoWord = vm.searchKeyword;
                vm.openDropdown = true;
            });
            $scope.$apply();

        }, 300);
        
        //备注搜索
        vm.searchMemo = function () {
            vm.openDropdown = false;
            
            service.searchType = searchTypeEnum[vm.memoType];
            service.keyword = vm.searchKeyword;
            
            vm.initData(vm.state);
        };
        
        //回车
        var searchData = function (type, key) {
            vm.openDropdown = false;
            
            service.searchType = searchTypeEnum[type];
            service.keyword = key;
            
            
            vm.initData(vm.state);
        };
        
        //检索框回车
        var searchBoxEnter = function () {
            service.searchKeyword(vm.searchKeyword).success(function (response) {
                var res = response.result;
                var type;
                var key;
                var binggo = false;
                for (var i = 0; i <= 2; i++) {
                    if (res[i].list.length > 0) {
                        type = res[i].type;
                        key = res[i].list[0].id;
                        binggo = true;
                        vm.searchKeyword = res[i].list[0].name;
                        break;
                    }
                }
                
                if (!binggo) {
                    key = vm.searchKeyword;
                    type = vm.memoType;
                }
                
                searchData(type, key);
            });
        }
        
        //输入搜索间隔时间控制
        vm.searchKeyup = function (event) {
            
            if (event.ctrlKey === true && event.altKey && event.keyCode === 120) {
                userinfo.logout();
                return;
            }
            
            if (event.keyCode == 13) {
                searchBoxEnter();
            } else {
                if (vm.searchKeyword && vm.searchKeyword.length > 1) {
                    searchKeyword();
                } else {
                    
                    vm.openDropdown = false;
                    
                    if (vm.searchKeyword != undefined && vm.searchKeyword.length <= 0) {
                        vm.searchMemo();
                    }
                }
            }
        };
        
        
        //搜索框选定某项
        vm.selectSearch = function (event, item, type) {
            $(event.target).parents('.dropdown-menu').prev().focus();
            vm.searchKeyword = item.name;
            service.keyword = item.id;
            service.searchType = searchTypeEnum[type];
            vm.initData(vm.state);
        };
        
        //获取QB数据方法
        vm.loadQbData = function (callback) {
            var totalPage = vm.qbTotalPageCount;
            if (vm.qbPage >= totalPage) return;
            vm.qbPage++;
            service.getQbOfferList(vm.qbPage).success(function (res) {
                vm.qbOfferList = vm.qbOfferList.concat(res.result);
                if (typeof callback == 'function') callback(vm.qbPage, totalPage);
            });
        };
        
        //获取market数据
        vm.loadMarketData = function (callback) {
            var totalPage = vm.marketTotalPageCount;
            if (vm.marketPage >= totalPage) return;
            vm.marketPage++;
            service.getMarketOfferList(vm.marketPage).success(function (res) {
                vm.marketOfferList = vm.marketOfferList.concat(res.result);
                if (typeof callback == 'function') callback(vm.marketPage, totalPage);
            });
        };
        
        //点击报价管理
        vm.manageOffer = function () {
            
            var direction = { 'inner': 'OUT', 'offline': 'IN' }[financingType];
            
            offerService.openModal(function (res) {
            });

        };
        
        //有效报价和我的报价筛选
        vm.changeFilter = function () {
            service.isActive = vm.isActive;
            service.isSelf = vm.isSelf;
            vm.initData(vm.state);
        };
        
        //响应广播事件
        $scope.$on('refreshList', function (event, data) {
            
            // if (data === 'inner' || data === 'offline') vm.state = 'qb';
            
            vm.initData(vm.state);
            
            if (data.target && (!data.matrixCellType || data.matrixCellType !== 'showAll')) vm.switchOfferType('market');
        });
        
        //刷新前清空grid数据
        function clearGridData(state) {
            if (state == 'qb') {
                vm.qbOfferList = [];
            } else if (state == 'market') {
                vm.marketOfferList = [];
            }
        }
        
        
        //websocket操作
        var ws = service.connectWebSocket();
        ws.onopen = function () {
            console.log('open');
        };
        
        ws.onmessage = function (e) {
            if (e.data) {
                // 使用反向代理时，接受ping frame用以保持连接。
                if (e.data === "ping") {
                    console.log("Received ping for keeping wsandlocalmessage connection.");
                    return;
                }
                
                var item = JSON.parse(e.data);
                console.log(item);
                if (item.return_code === 0) {
                    var list = item.result;
                    
                    if (item.return_type === 1) {
                        handerQMStatus(list);
                    } else if (item.return_type === 2) {
                        list.forEach(function (item) {
                            item.isNew = true;
                            
                            handerPush(item);
                            
                            $timeout(function () {
                                item.isNew = false;
                            }, 500);

                        });
                    }
                }
            }
            
            // $scope.$apply();
            commonService.safeApply($scope);

        };
        
        ws.onclose = function (e) {
            console.log('close');
        }
        
        var filterSearchOption = function (quote) {
            if (service.keyword) {
                switch (service.searchType) {
                    case 'INSTITUTE':
                        if (quote.institution_name.indexOf(service.keyword) == -1) {
                            return false;
                        }
                        break;
                    case 'CONTACT':
                    case 'QQ':
                        if (quote.quote_username.indexOf(service.keyword) == -1) {
                            return false;
                        }
                        break;
                    case 'MEMO':
                        if (quote.memo.indexOf(service.keyword) == -1) {
                            return false;
                        }
                        break;
                    default:
                        break;
                }
            }
            
            return true;
        }
        
        
        var bankNatureArray = ["1", "3", "4", "6"]; //除其他的机构类型;
        //匹配机构类型
        var filterBankNature = function (bankNature) {
            var bankNatureEnum = enumConfig.bankNature;
            if (service.matrix[0].type == 'OTHERS') {
                return bankNatureArray.indexOf(bankNature) == -1;
            }
            else {
                return (bankNatureEnum[service.matrix[0].type] == bankNature);
            }

        }
        
        //期限匹配
        var filterPeriod = function (period) {
            var periodInfo = enumConfig.period[service.matrix[0].period[0]];
            
            var convertTerm = function (term) {
                var a = parseInt(term);
                if (!isNaN(a)) {
                    if (term.indexOf("D") > -1) {

                    }
                    else if (term.indexOf("M") > -1) {
                        a = a * 30;
                    }
                    else if (term.indexOf("Y") > -1) {
                        a = a * 365;
                    }
                }
                
                return a;
            }
            
            var nPeriod = convertTerm(period);
            return (nPeriod >= periodInfo.min && nPeriod <= periodInfo.max);
        }
        
        
        //判断推送数据是否显示
        function handerPush(quote) {
            //地区不对不添加
            if (service.filter.province.length && service.filter.province.indexOf(quote.province) == -1) return;
            //同业理财类型不对不添加
            if (financingType == 'inner' && service.filter.quote_type != quote.quote_type) return;
            //线下资金托管不对不添加
            var trustTypeEnum = enumConfig.trustType;
            if (financingType == 'offline') {
                if ('IBD' != quote.quote_type || (service.filter.trust_type == "1" && quote.trust_type && service.filter.trust_type != quote.trust_type))
                    return;
            }
            
            // 报价方向不匹配时不添加
            if (service.filter.direction !== quote.direction) {
                var list = vm[vm.state + 'OfferList'];
                if (list) {
                    if (quote.id) vm[vm.state + 'OfferList'] = list.findWhere(function (e) { return e.id !== quote.id; });
                }
                return;
            }
            
            //矩阵机构不匹配不添加
            if (service.matrix.length && !filterBankNature(quote.bank_nature)) return;
            
            //矩阵选择的期限不匹配不添加
            if (service.matrix.length && !filterPeriod(quote.quote_period)) return;
            //有效报价和我的报价过滤
            if (service.isActive && quote.active == 0) return;
            if (service.isSelf && userinfo.getUserId() != quote.quote_userid) return;
            //检索条件过滤
            if (!filterSearchOption(quote)) return;
            
            
            if (vm.state == "qb" && quote.source == 'PRIME_QB') {
                pushQuotOper(quote);
            } else if (vm.state == "market") {
                pushQuotOper(quote);
            }
        };
        
        
        var pushQuotOper = function (quote) {
            var list = vm[vm.state + 'OfferList'];
            if (!list) {
                return;
            }
            var originLength = list.length;
            
            if (quote.active === "0") {
                if (quote.id) list = list.findWhere(function (e) { return e.id !== quote.id; });
            } else {
                // removeDuplication(list, quote);
                // list = [quote].concat(list);
                if (!(list instanceof Array)) return;
                
                var index = list.indexOfItem(function (e) { return e.id === quote.id; });
                
                if (index >= 0) list[index] = quote;
                else {
                    var tempList = [quote];
                    tempList.push.apply(tempList, list);
                    
                    list = tempList;
                }
            }
            
            
            if (list.length > originLength && list.length > 200) {
                list.splice(list.length - 1, 1);
            }
            
            vm[vm.state + 'OfferList'] = list;
            //通知table有新数据
            $scope.$broadcast('hasNewData');
        }
        //删除重复无效报价
        var removeDuplication = function (list, quote) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].id == quote.id) {
                    var isActive = list[i].active;
                    list.splice(i, 1);
                    break;
                }
            }
        };
        
        //处理QM状态更新推送
        function handerQMStatus(result) {
            if (!result) {
                return;
            }
            //更新状态
            var updateStatus = function (offerItem, userItem) {
                if (offerItem.source == 'QQ') return;
                
                if (!offerItem.quote_user_list) return;
                
                offerItem.quote_user_list.forEach(function (quoteUserItem) {
                    if (quoteUserItem.qb_id == userItem.qb_id) {
                        quoteUserItem.status = userItem.new_state;
                    }
                    ;
                });

            };
            
            //遍历推送的结果和offer列表里每一项
            result.forEach(function (userItem) {
                
                if (vm.state == 'qb') {
                    if (vm.qbOfferList) {
                        vm.qbOfferList.forEach(function (offerItem) {
                            updateStatus(offerItem, userItem);
                        });
                    }
                }
                else if (vm.state == 'market') {
                    if (vm.marketOfferListmarketOfferList) {
                        vm.marketOfferList.forEach(function (offerItem) {
                            updateStatus(offerItem, userItem);
                        });
                    }
                }
            });

        };
        
        //$scope销毁时关闭websocket
        $scope.$on('$destroy', function () {
            ws.close();
        });
        
        //查看本机构报价
        $scope.$on('toTableInstitution', function (event, data) {
            vm.searchKeyword = data.name;
            service.keyword = data.id;
            service.searchType = searchTypeEnum["机构"];
            
            vm.isSelf = false;
            vm.isActive = false;
            service.isSelf = false;
            service.isActive = false;
            
            $scope.$emit('filterChanged');

        });

    }

})(window.angular);