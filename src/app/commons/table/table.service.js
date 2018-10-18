(function () {
    'use strict';
    //tableService定义
    angular.module('moneyMarketApp')
		.service('tableService', tableService);
    
    tableService.$inject = ['$http', 'appConfig'];
    
    
    function tableService($http, appConfig) {
        var service = this;
        
        var pageSize = 200;
        
        //同业理财和线下资金
        var financingType;
        
        //初始化参数信息
        var initOptions = function () {
            
            //过滤选项
            service.filter = { quote_type: 'UR2', trust_type: 0, province: [] };
            service.matrix = [];
            
            
            //初始化有效报价和我的报价
            service.isActive = 0;
            service.isSelf = 0;
            
            //搜索数据类型和搜索数据
            service.keyword = "";
            service.searchType = "";

        };
        
        initOptions();
        
        //整合matrixData
        var formatMatrixData = function (matrixData) {
            var mappedMatrix = matrixData.map(function (org) {
                return {
                    type : org[0].type,
                    period : org.filter(function (item) {
                        return item.selected;
                    }).map(function (item) {
                        return item.period;
                    })
                }
            });
            
            return mappedMatrix.filter(function (org) {
                return org.period.length > 0;
            });

        };
        
        
        //设置过滤数据
        var setFilter = function (type, province, direction) {

            if (financingType == 'inner') {
                service.filter.quote_type = type;
            } else if (financingType == 'offline') {
                service.filter.trust_type = type;
            }
            service.filter.province = province;

            service.filter.direction = direction;
        };
        
        //设置矩阵数据
        var setMatrix = function (matrixData) {
            service.matrix = formatMatrixData(matrixData);
        };
        
        var setOptions = function (displayType, page, needCount) {

            var options = {
                province : service.filter.province,
                display_type : displayType,
                matrix : service.matrix,
                search_type : service.searchType,
                search_keyword : service.keyword,
                page_number : page,
                page_size : pageSize,
                isActive : service.isActive,
                isSelf : service.isSelf,
                need_count : needCount,
                
                // 报价方向 出理财 收理财
                direction: service.filter.direction
            };
            
            if (financingType == 'inner') {
                options.quote_type = service.filter.quote_type;
            } else if (financingType == 'offline') {
                options.quote_type = 'IBD';
                options.trust_type = service.filter.trust_type;
            }
            
            return options;

        };
        
        
        //搜索关键字
        function searchKeyword(keyword) {
            return $http.post(financingType + '/search_preview', {
                keyword : keyword
            });
        }
        
        function setFinancingType(type) {
            financingType = type;
        }
        
        function getQbOfferList(page, needCount) {
            
            var options = setOptions(1, page, needCount);
            
            return $http.post(financingType + '/quote_list', options);
        }
        
        function getMarketOfferList(page, needCount) {
            
            var options = setOptions(0, page, needCount);
            
            return $http.post(financingType + '/quote_list', options);
        }
        
        //webSocket连接
        function connectWebSocket() {
            
            var url = appConfig.ws_root + '/money_market/websck/mm';

            // var url = "http://" + host + socketPrefix +  '/sockjs/websck/mm';
            return new WebSocket(url);
        }
        
        service.setFilter = setFilter;
        service.setMatrix = setMatrix;
        service.initOptions = initOptions;
        
        service.setFinancingType = setFinancingType;
        service.searchKeyword = searchKeyword;
        service.getQbOfferList = getQbOfferList;
        service.getMarketOfferList = getMarketOfferList;
        service.connectWebSocket = connectWebSocket;
    };

})();