(function (angular) {
    'use strict';
    
    angular.module('services').controller('bootboxController', [
        
        '$scope', '$sce', '$uibModalInstance', 'type', 'bodyText', 'bodyHtml', 
        function ($scope, $sce, $uibModalInstance, type, bodyText, bodyHtml) {

            var vm = this;
            
            vm.save = function () {
                $uibModalInstance.close(true);
            };
            
            //取消
            vm.cancel = function () {
                $uibModalInstance.dismiss();
            };
            
            var initView = function () {
                vm.type = type;
                
                if(bodyText) vm.bodyText = bodyText;
                if(bodyHtml) vm.bodyHtml = $sce.trustAsHtml(bodyHtml);;
                
                if (vm.type == 'message') {
                    document.onkeyup = function (event) {
                        var keycode = event.keyCode;
                        if (keycode === 13 || keycode === 27 || keycode === 32) {
                            $uibModalInstance.dismiss();
                        }
                    };
                } else {
                    document.onkeyup = null;
                }
            }();

        }]);

})(window.angular);