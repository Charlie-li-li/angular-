(function (angular) {
    'use strict';
    
    angular.module('moneyMarketApp').constant('appConfig', {
        // service_root: '../../',
        
        // jenkins
        service_root: 'http://172.16.87.6:8130/money_market/',
        
        // Service pc
        // service_root: 'http://172.16.17.66:8888/money_market/',
        // service_root: 'http://172.16.17.114:8888/money_market/',
        // service_root: 'http://mb16.sumscope.com:8888/money_market/',
        
        // ws_root: "ws://" + location.host,
        
        // Login
        validate_user: 'base/validateUser',
        
        // 获取联盟机构
        get_alliance: 'quote/getAlliance',
        
        // 保存报价
        post_board: 'quote/save',
        
        // 保存联盟报价
        post_alliance_board: 'quote/allianceSave',
        
        // 获取所属联盟旗下所有联盟机构
        get_brother_alliance: 'inner/queryAllianceQuote',
        
        // 从Excel导入联盟报价
        post_uploadExcel: "quote/getExcelContent",
        post_saveExcel: "quote/excelSave",
        // post_uploadExcel: "../service/getExcelContent",
        
        ws_root: "ws://172.16.87.6:8130",
        
        get_quote: '',
    });


})(angular);