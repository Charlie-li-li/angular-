(function (angular) {
    'use strict';

    //var templateUrl = 'app/commons/service/offer-management/offer-management.html';
    //var templateUrl = 'app/commons/service/offer-management/alliance-offer-management.html';

    //var controllerSrc = 'app/commons/service/offer-management/offer-management.controller.js';
    //var controllerSrc = 'app/commons/service/offer-management/alliance-offer-management.controller.js';

    //var controllerName = 'offerManageController';
    //var controllerName = 'allianceOfferManageController';

    angular.module('services').service('offerService', [
        '$http', '$uibModal', 'appConfig', 'enumConfig',
        function ($http, $uibModal, appConfig, enumConfig) {

            var dataDefine = {
                quoteMethods: [
                    {"name": "普通报价", "enum": 'SEF'},
                    {"name": "联盟报价", "enum": 'ALC'},
                    {"name": "代报价", "enum": 'BRK'}
                ],

                quoteMethodMap: {
                    SEF: {
                        templateUrl: 'app/commons/service/offer-management/offer-management.html',
                        controllerSrc: 'app/commons/service/offer-management/offer-management.controller.js',
                        controllerName: 'offerManageController'
                    },
                    //SEF: {
                    //    templateUrl: 'app/commons/service/offer-management/alliance-offer-management.html',
                    //    controllerSrc: 'app/commons/service/offer-management/alliance-offer-management.controller.js',
                    //    controllerName: 'allianceOfferManageController'
                    //},
                    ALC: {
                        templateUrl: 'app/commons/service/offer-management/alliance-offer-management.html',
                        controllerSrc: 'app/commons/service/offer-management/alliance-offer-management.controller.js',
                        controllerName: 'allianceOfferManageController'
                    },
                    BRK: {
                        templateUrl: 'app/commons/service/offer-management/alliance-offer-management.html',
                        controllerSrc: 'app/commons/service/offer-management/alliance-offer-management.controller.js',
                        controllerName: 'allianceOfferManageController'
                    }
                },

                // 报价方向
                boardDirection: [
                    {"displayName": "出", "value": 'OUT'},
                    {"displayName": "收", "value": 'IN'},
                ],

                //期限枚举
                periodDefine: [
                    {"id": 1, "type": "T7D", "header": "7天", "daysLowValue": 0, "daysHighValue": 7},
                    {"id": 2, "type": "T14D", "header": "14天", "daysLowValue": 8, "daysHighValue": 14},
                    {"id": 3, "type": "T1M", "header": "1个月", "daysLowValue": 15, "daysHighValue": 30},
                    {"id": 4, "type": "T2M", "header": "2个月", "daysLowValue": 31, "daysHighValue": 60},
                    {"id": 5, "type": "T3M", "header": "3个月", "daysLowValue": 61, "daysHighValue": 90},
                    {"id": 6, "type": "T6M", "header": "6个月", "daysLowValue": 91, "daysHighValue": 180},
                    {"id": 7, "type": "T9M", "header": "9个月", "daysLowValue": 181, "daysHighValue": 270},
                    {"id": 8, "type": "T1Y", "header": "1年", "daysLowValue": 271, "daysHighValue": 360}
                ],

                activeDefine: {
                    true: 1,
                    false: 0
                },
            };

            var viewBusy = false;

            var allianceQueryInjector = [
                function () {
                    return $http.post(appConfig.get_alliance).then(function (data) {
                        if (data && data.data && data.data.result && data.data.result[0] && data.data.result[0].alliance) {
                            data.data.result[0].alliance.forEach(function (item, index) {
                                item.displayOrder = index;
                            });
                        }

                        return data.data;
                    }, function (data) {
                        return data;
                    });
                }
            ];

            this.dataDefine = dataDefine;

            function getInsInfoById(allianceQuery, id) {

                var defaultIns = {institutionId: id, displayName: "id: " + id, displayOrder: -1};

                if (allianceQuery && allianceQuery.result && allianceQuery.result.length > 0) {
                    var result = allianceQuery.result[0].alliance.findItem(function (e) {
                        return e.institutionId === id;
                    });

                    return result ? result : defaultIns;
                } else
                    return defaultIns;
            };

            function isSameSpPeriod(p1, p2) {
                if (!p1 && !p2) return true;

                if ((!p1 && p2) || (p1 && !p2)) return false;

                if (p1.id) {
                    return +p1.daysHighValue === +p2.daysLowValue;
                } else {
                    return +p1.daysLowValue === +p2.daysLowValue && p1.active === p2.active;
                }
            };

            this.isSameSpPeriod = isSameSpPeriod;

            function setSpPeriodHeader(period) {
                // if (period.isRange) {
                //     period.header = "{0} - {1} 天".format(period.daysLowValue, period.daysHighValue);
                // } else {
                //     period.header = "{0} 天".format(period.daysLowValue);
                // }
                if(period.daysLowValue%360 === 0){
                    period.header = period.daysLowValue/360 + '年';
                }else if(period.daysLowValue%30 === 0){
                    period.header = period.daysLowValue/30 + '个月';
                }else{
                    period.header = period.daysLowValue + '天';
                }
            };

            this.setSpPeriodHeader = setSpPeriodHeader;

            this.boardFactory = function (dto, headerPeriodList, allianceQuery) {

                var board = {
                    // custodianQualification=(null)
                    boardDir: dataDefine.boardDirection.findItem(function (e) {
                        return e.value === dto.direction;
                    }),
                    institutionInfo: getInsInfoById(allianceQuery, dto.institutionId),
                    remark: dto.memo,

                    periodList: headerPeriodList.map(function (e) {
                        if (!dto.quoteDetailsDtos) return angular.copy(e);

                        var period = dto.quoteDetailsDtos.findItem(function (e2) {
                            return e2.limitType === e.type;
                        });
                        if (period) {
                            return {type: period.limitType, period: period.price, id:e.id}
                        } else {
                            return angular.copy(e);
                        }
                    }),
                    // quoteUserId=004687495e234a7682f3bd8c4ff84426
                    seqNo: dto.sequence,
                    // source=QB

                    // valideDays=0

                    id: dto.id,

                    active: dto.quoteDetailsDtos[0].active
                };

                if (board.institutionInfo) {
                    if (board.institutionInfo.displayOrder === -1) board.displayOrder = -1;

                    // 高4位为institutionInfo.displayOrder，低4位为sequence
                    board.displayOrder = (1000 + board.institutionInfo.displayOrder) * 1000 + dto.sequence;
                } else {
                    board.displayOrder = dto.sequence;
                }

                dto.quoteDetailsDtos.findWhere(function (e) {
                    return !e.limitType;
                }).forEach(function (item, index) {

                    var period = {
                        isRange: item.dayHigh !== item.dayLow,
                        daysLowValue: item.dayLow,
                        daysHighValue: item.dayHigh,
                        period: item.price
                    };

                    var headerIndex = headerPeriodList.indexOfItem(function (e1) {
                        return isSameSpPeriod(e1, period);
                    });

                    if (headerIndex) {
                        if (board.periodList.length < headerPeriodList.length) {
                            board.periodList.splice(headerIndex, undefined, period);
                        } else {
                            board.periodList[headerIndex] = period;
                        }
                    } else {
                        var header = angular.copy(period);
                        setSpPeriodHeader(header);
                        delete header.period;
                        headerPeriodList.push(header);

                        board.periodList.push(period);
                    }
                });

                return board;
            };

            this.openModal = function (resolve) {
                if (viewBusy) return;

                var quoteModalMap = dataDefine.quoteMethodMap.SEF;

                if (enumConfig && enumConfig.quoteMethod && enumConfig.quoteMethod[0]) {
                    if (dataDefine.quoteMethodMap.hasOwnProperty(enumConfig.quoteMethod[0])) {
                        quoteModalMap = dataDefine.quoteMethodMap[enumConfig.quoteMethod[0]];
                    }
                }

                var modalInstance = $uibModal.open({
                    animation: false,
                    templateUrl: quoteModalMap.templateUrl,
                    size: 'lg',
                    backdrop: 'static',
                    controller: quoteModalMap.controllerName,
                    bindToController: true,
                    controllerAs: 'vm',
                    resolve: {
                        load: [
                            '$ocLazyLoad', function ($ocLazyLoad) {
                                return $ocLazyLoad.load([quoteModalMap.controllerSrc]);
                            }
                        ],

                        quoteQuery: [
                            function () {
                                viewBusy = true;
                                return $http.post('quote/get').then(function (data) {
                                    viewBusy = false;
                                    return data.data;
                                }, function (data) {
                                    viewBusy = false;
                                });
                            }
                        ],

                        // 获取联盟机构任务
                        allianceQuery: allianceQueryInjector
                    }
                });

                modalInstance.result.then(function (res) {
                    if (typeof resolve == 'function') {
                        resolve(res);
                    }
                }, function (cancel) {

                });
            };

            this.openReadOnlyModal = function (resolve, quote ,data ) {
                if (viewBusy) return;

                var dateFormat = "yyyy-mm-dd HH:MM:ss";

                var modalInstance = $uibModal.open({
                    animation: false,
                    templateUrl: "app/commons/service/offer-management/queryAllianceQuote.html",
                    size: 'lg',
                    backdrop: 'static',
                    controller: 'queryAllianceQuoteController',
                    bindToController: true,
                    resolve: {
                        load: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                "app/commons/service/offer-management/queryAllianceQuoteController.js"
                            ]);
                        }],

                        // 获取联盟机构任务
                        // allianceQuery: allianceQueryInjector,

                        boardQuery: ['$http', 'appConfig', function ($http, appConfig) {
                            viewBusy = true;
                            function setValue(data) {
                                if (data && data.data && data.data.MmQuoteWithContactDto.length) {
                                    data.data.institutionName = data.data.MmQuoteWithContactDto[0].primeInstitutionName;
                                    data.data.lastUpdate = new Date();
                                    data.data.lastUpdate.setTime(quote.last_update);
                                    data.data.lastUpdate = data.data.lastUpdate.format(dateFormat);

                                    data.data.contactsList.forEach(function(item){
                                        var a = [],b = [];
                                        if(item.mobile) a = item.mobile.replace(';',',').split(',');
                                        if(item.telephone) b = item.telephone.replace(';',',').split(',');
                                        item.contact = a.concat(b);
                                    })
                                }
                            };

                            return $http.post(appConfig.get_brother_alliance, {institutionId: quote.institution_id}).then(function (data) {
                                // console.log(data)
                                setValue(data);
                                viewBusy = false;
                                return data.data;
                            }, function (data) {

                                setValue(data);
                                viewBusy = false;
                                return data.data;
                            });
                        }
                        ]
                    }
                });

                modalInstance.result.then(function (res) {
                    if (typeof resolve == 'function') {
                        resolve(res);
                    }
                }, function (cancel) {

                });
            };

        }]);

})(angular);