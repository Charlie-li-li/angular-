(function () {
    'use strict';
    angular.module('services')
		.service('bootbox', bootboxService);
    
    bootboxService.$inject = ['$uibModal'];
    
    function bootboxService($uibModal) {
        var service = this;
        
        //弹出提示框
        var message = function (message) {
            var instance = $uibModal.open({
                animation : false,
                templateUrl : 'app/commons/service/bootbox/bootbox.html',
                size : 'md',
                backdrop : 'static',
                controller : 'bootboxController',
                bindToController : true,
                controllerAs : 'vm',
                resolve : {
                    load : ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'app/commons/service/bootbox/bootbox.controller.js'
                            ]);
                        }],
                    type : function () {
                        return 'message';
                    },
                    bodyText : function () {
                        return message;
                    },
                    bodyHtml : function () {
                        return undefined;
                    }
                }
            });
        };

        var confirm = function(message, callback) {
            var instance = $uibModal.open({
                animation: false,
                templateUrl: 'app/commons/service/bootbox/bootbox.html',
                size: 'md',
                backdrop: 'static',
                controller: 'bootboxController',
                bindToController: true,
                controllerAs: 'vm',
                resolve: {
                    load: [
                        '$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'app/commons/service/bootbox/bootbox.controller.js'
                            ]);
                        }
                    ],
                    type: function() {
                        return 'confirm';
                    },
                    bodyText: function() {
                        return message;
                    },
                    bodyHtml : function () {
                        return undefined;
                    }
                }
            });

            instance.result.then(function() {
                if (typeof callback == 'function') {
                    callback();
                }
            });
        };

        this.messageHtml = function(message, messageHtml) {
            $uibModal.open({
                animation : false,
                templateUrl : 'app/commons/service/bootbox/bootbox.html',
                size : 'md',
                backdrop : 'static',
                controller : 'bootboxController',
                bindToController : true,
                controllerAs : 'vm',
                resolve : {
                    load : ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'app/commons/service/bootbox/bootbox.controller.js'
                            ]);
                        }],
                    type : function () {
                        return 'message';
                    },
                    bodyText : function () {
                        return message;
                    },
                    bodyHtml : function () {
                        return messageHtml;
                    }
                }
            });
        };


        //弹出确认框
        service.message = message;
        service.confirm = confirm;

    }

})();