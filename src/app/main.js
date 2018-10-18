(function (angular) {
    'use strict';
    
    angular.module('directives', []);
    angular.module('services', []);
    
    angular.module('moneyMarketApp', [
        'ui.router',
        'oc.lazyLoad',
        'ui.bootstrap',
        'directives',
        'services',
        'ui.grid',
        'ui.grid.infiniteScroll',
        'ngCookies',
        'ngFileUpload'
    ]);
    
    var mainModule = angular.module('moneyMarketApp')
        .run([
        'userinfoService', function (userinfoService) {
            
            userinfoService.validate();
        }
    ])
        .constant('enumConfig', {
        quoteType: {
            "GTF": "保本",
            "UR2": "非保本R2",
            "UR3": "非保本R3",
            "IBD": "同存"
        },
        period: {
            "T7D": { 'min': 1, 'max': 7 },
            "T14D": { 'min': 8, 'max': 14 },
            "T1M": { 'min': 15, 'max': 30 },
            "T2M": { 'min': 31, 'max': 60 },
            "T3M": { 'min': 61, 'max': 90 },
            "T6M": { 'min': 91, 'max': 180 },
            "T1Y": { 'min': 181, 'max': 360 }
        },
        periodValue: {},
        quoteMethod: {},
        matrixRowName: {
            'SHIBOR': 'Shibor',
            'BIG_BANK': '大行',
            'JOINT_STOCK': '股份制',
            'CITY_COMMERCIAL_BANK': '城商行',
            'RURAL_CREDIT': '农信机构',
            'OTHERS': '其他'
        },
        bankNature: {
            'SHIBOR': 0,
            'BIG_BANK': 1,
            'JOINT_STOCK': 3,
            'CITY_COMMERCIAL_BANK': 4,
            'RURAL_CREDIT': 6,
            'OTHERS': 99,
        },
        trustType: {
            'UNLIMIT': 0,
            'LIMIT': 1
        }
    });
    
    angular.module('moneyMarketApp').service('refreshService', ['$interval', '$window', function ($interval, $window) {
            this.getCurrentTime = function () {
                if (clock) $interval.cancel(clock);
                var clock = $interval(function () {
                    var currentTime = new Date().getHours();
                    if (currentTime === 3) {
                        $window.location.reload(true);
                    }
                }, 30 * 60 * 1000)
            }
        }])
    
    // Http Config
    mainModule.factory('userInterceptor', [
        '$q', '$injector', 'appConfig', 'qbService', function ($q, $injector, appConfig, qbService) {
            
            var isSeverRequest = function (url) {
                return !/(\.html|\.js|\.json|ui\-grid|validateUser|service)/.test(url);
            };
            
            return {
                request: function (config) {
                    if (isSeverRequest(config.url)) {
                        if (appConfig.service_root) config.url = appConfig.service_root + config.url;
                        
                        var userinfoservice = $injector.get('userinfoService');
                        var state = $injector.get('$state');
                        userinfoservice.getUserData(function (res) {
                            config.headers['username'] = res['UserAccount'];
                            config.headers['password'] = res['Password'];
                        }, function () {
                            state.go('login');
                            return $q.reject(config);
                        });
                    }
                    
                    if (config.url === appConfig.validate_user) {
                        if (appConfig.service_root) config.url = appConfig.service_root + config.url;
                    }
                    
                    return config;
                },
                requestError: function (config) {
                    return config;
                },
                response: function (response) {
                    if (isSeverRequest(response.config.url)) {
                        var resData = response.data;
                        
                        if (response.config.url.endWith(appConfig.get_brother_alliance)) {
                            return response;
                        } else {
                            if (resData.return_code === 0) {
                                return response;
                            } else {
                                //返回错代码之后操作
                                if (resData.return_message) {
                                    var bootbox = $injector.get('bootbox');
                                    bootbox.message(resData.return_message.exceptionName);
                                }
                                return $q.reject(response);
                            }
                        }
                    } else {
                        return response;
                    }
                },
                responseError: function (response) {
                    return $q.reject(response);
                }
            }
        }
    ]).config([
        '$httpProvider', '$injector', function ($httpProvider, $injector) {
            
            $httpProvider.interceptors.push('userInterceptor');
        }
    ]);
    
    // Page Route Config
    mainModule.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
            
            //$urlRouterProvider.otherwise('/login');
            
            $stateProvider.state('app', {
                abstract: true,
                views: {
                    'menu': {
                        templateUrl: 'app/commons/menu/index.html',
                        controller: ['$scope', '$http', 'offerService', 'getContacts', 'qbService', 'refreshService', function ($scope, $http, offerService, getContacts, qbService, refreshService) {
                                // $scope.quote = function () {
                                //     return $http.post('quote/get');
                                // }();
                                refreshService.getCurrentTime();
                                
                                var institutionId = undefined;
                                var qbId = undefined;
                                
                                $scope.allianceClick = function () {
                                    offerService.openReadOnlyModal(function () {
                                    }, { institution_id: institutionId, last_update: new Date() });
                                };
                                
                                $scope.allianceOpenQM = function () {
                                    qbService.openQM(qbId);
                                }
                                
                                var initView = function () {
                                    if (!getContacts) return;
                                    
                                    $scope.contact = getContacts.contact;
                                    
                                    institutionId = getContacts.institutionId;
                                    qbId = getContacts.qbId;
                                }();
                            }],
                        resolve: {
                            getContacts: ['$http', 'appConfig', function ($http, appConfig) {
                                    var institutionId = '402880f034219aed0134219d8b210331';
                                    var qbId = '402880f034219aed0134219d8b210331';
                                    return $http.post(appConfig.get_brother_alliance, { institutionId: institutionId }).then(function (data) {
                                        
                                        if (!data || !data.data || !data.data.contactsList || data.data.contactsList <= 0 || !(data.data.contactsList instanceof Array)) return undefined;
                                        
                                        var contact = data.data.contactsList.findItem(function (item) {
                                            return item.name === '王嘉鹏';
                                        });
                                        
                                        function getContact(item) {
                                            if (!item) return undefined;
                                            var a = [], b = [];
                                            if (item.mobile) {
                                                a = item.mobile.replace(';', ',').split(',');
                                            }
                                            
                                            if (item.telephone) {
                                                b = item.telephone.replace(';', ',').split(',');
                                            }
                                            item.contact = a.concat(b);
                                            return item;
                                        };
                                        
                                        var con = getContact(contact);
                                        if (!con) return undefined;
                                        con.institutionId = institutionId;
                                        con.qbId = qbId;
                                        return con;
                                    }, function (data) {
                                        return data.data;
                                    });
                                }]
                        }
                    },
                    'body': {
                        templateUrl: 'app/main.html',
                        controller: ['$scope', 'tableService', function ($scope, tableService) {
                                //事件广播
                                
                                //更改过滤项
                                $scope.$on('filterChanged', function (event, data) {
                                    $scope.$broadcast('refreshMatrix', data);
                                });
                                //更改矩阵选择
                                $scope.$on('matrixChanged', function (event, data) {
                                    $scope.$broadcast('refreshList', data);
                                });
                                //查看本机构报价
                                $scope.$on('institutionOffer', function (event, data) {
                                    $scope.$broadcast('toTableInstitution', data);
                                });

                            }]
                    },

                }
            })
            .state('login', {
                url: '/login',
                views: {
                    'login': {
                        templateUrl: 'app/login/login.html',
                        controller: 'loginController',
                        controllerAs: 'vm',
                        resolve: {
                            load: ['$ocLazyLoad', function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'app/login/login.js'
                                    ]);
                                }]
                        }
                    }
                }
            })
            .state('app.innerFinancing', {
                abstract: true,
                url: '/inner',
                views: {
                    'part1': {
                        templateUrl: 'app/inner-financing/main.html'
                    }
                }
            })
            .state('app.innerFinancing.index', {
                url: '',
                views: {
                    filter: {
                        templateUrl: 'app/inner-financing/filter/index.html',
                        controller: 'innerFilterController',
                        controllerAs: 'vm',
                        resolve: {
                            load: ['$ocLazyLoad', function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'app/inner-financing/filter/filter.js'
                                    ]);
                                }]
                        },
                    },
                    matrix: {
                        templateUrl: 'app/inner-financing/matrix/index.html',
                        controller: 'innerMatrixController',
                        controllerAs: 'vm',
                        resolve: {
                            load: ['$ocLazyLoad', function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'app/inner-financing/matrix/matrix.js'
                                    ]);
                                }]
                        }
                    },
                    table: {
                        templateUrl: 'app/commons/table/index.html',
                        controller: 'tableController',
                        controllerAs: 'vm',
                        resolve: {
                            load: ['$ocLazyLoad', function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'app/commons/table/table.js',
                                        'app/commons/table/table.service.js'
                                    ]);
                                }],
                            financingType: function () {
                                return "inner";
                            }
                        }
                    }
                }
            })
            .state('app.offlineFinancing', {
                url: '/offline',
                abstract: true,
                views: {
                    'part1': {
                        templateUrl: 'app/inner-financing/main.html'
                    }
                }
            }).state('app.offlineFinancing.index', {
                url: '',
                views: {
                    filter: {
                        templateUrl: 'app/offline-financing/filter/index.html',
                        controller: 'offlineFilterController',
                        controllerAs: 'vm',
                        resolve: {
                            load: ['$ocLazyLoad', function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'app/offline-financing/filter/filter.js'
                                    ]);
                                }]
                        },
                    },
                    matrix: {
                        templateUrl: 'app/offline-financing/matrix/index.html',
                        controller: 'offlineMatrixController',
                        controllerAs: 'vm',
                        resolve: {
                            load: ['$ocLazyLoad', function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'app/offline-financing/matrix/matrix.js'
                                    ]);
                                }]
                        }
                    },
                    table: {
                        templateUrl: 'app/commons/table/index.html',
                        controller: 'tableController',
                        controllerAs: 'vm',
                        resolve: {
                            load: ['$ocLazyLoad', function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'app/commons/table/table.js',
                                        'app/commons/table/table.service.js'
                                    ]);
                                }],
                            financingType: function () {
                                return "offline";
                            }
                        }
                    }
                }
            });

        }]);
})(angular);