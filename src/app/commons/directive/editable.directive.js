(function (angular) {
    'use strict';
    angular.module('directives').directive('editable', function () {
        
        var injectedFun = ['$scope', '$timeout', 'tabNavigatorService', function ($scope, $timeout, tabNavigatorService) {
                var vm = this;
                var timer;
                
                //是否是备注/价格/数量
                vm.isRemark = vm.remark != undefined;
                vm.isPrice = vm.price != undefined;
                vm.isAmount = vm.amount != undefined;
                
                vm.toolTipText = function () {
                    if (vm.isRemark) return "";
                    else if (vm.isPrice) return "请输入您的价格，不确定价格时可不输入";
                    else if (vm.isAmount) return "请输入您的数量，不确定数量时可不输入";
                    return "";
                }();
                
                vm.beginEdit = function (event) {
                    vm.isEditing = true;
                    var target = event.target;
                    $timeout(function () {
                        $(target).parents('td').addClass('is-editing');
                        $(target).next().focus();
                    });
                    vm.textChanged();
                };
                
                vm.blur = function (event) {
                    vm.isEditing = false;
                    var target = event.target;
                    $timeout(function () {
                        $(target).parents('td').removeClass('is-editing');
                    });
                    cancelShow();
                };
                
                vm.textChanged = function () {
                    if (vm.isRemark) return;
                    
                    if (vm.value && timer) {
                        cancelShow();
                        timer = countDown();
                    } else {
                        timer = countDown();
                    }
                };
                
                var countDown = function () {
                    var count = 3000;
                    var t = $timeout(function () {
                        vm.showTooltip = true;
                    }, count);
                    return t;
                };
                
                var cancelShow = function () {
                    vm.showTooltip = false;
                    $timeout.cancel(timer);
                };
                
                var initView = function () {
                    if (!vm.isPrice || !vm.isbeginediting) return;
                    
                    vm.isEditing = true;
                    $timeout(function () {
                        $($element).addClass('is-editing');
                        $($element).find('input').focus();
                    });
                    vm.textChanged();
                }();
                
                // Add by Wei Lai on 2016/06/07
                // 迁移 tab or enter
                vm.keydown = function (e) {
                    if (e) {
                        
                        if (e.keyCode === 9 || e.keyCode === 13) {
                            e.cancelBubble = true;
                            tabNavigatorService.findNextTd(e, function (nextElem) {
                                var ctrl = angular.element(nextElem).controller('editable');
                                
                                if (!ctrl) {
                                    $scope.$emit("onTabNavigating", nextElem);
                                    return;
                                }
                                
                                ctrl.isEditing = true;
                                $timeout(function () {
                                    $(nextElem).addClass('is-editing');
                                    $(nextElem).find('input').focus();
                                });
                                ctrl.textChanged();
                            });

                        // $scope.$emit("onTabNavigating");
                        }
                    }
                };
                
                vm.initInput = function (e) {
                    var ex = e || window.event;
                    var obj = ex.target || ex.srcElement;
                    
                    if (!obj) return;
                    
                    if (obj.nodeName === "A") {
                        var td = $(obj).parentsUntil("tr");

                        
                    }
                    
                    console.log("initInput");
                };
            }];
        
        return {
            restrict : 'C',
            templateUrl : 'app/commons/directive/editable.directive.html',
            scope : {
                value : "=ngModel",
                remark : "@",
                price : "@",
                amount : "@",
                isbeginediting: "@"
            },
            controller : injectedFun,
            bindToController : true,
            controllerAs : 'vm'
        };
    });
})(angular);
