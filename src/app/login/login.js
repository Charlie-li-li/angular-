(function () {
    
    angular.module('moneyMarketApp')
		.controller('loginController', loginController);
    loginController.$inject = ['$http', 'appConfig', '$cookies', '$state', 'userinfoService', '$scope'];
    function loginController($http, appConfig, $cookies, $state, userinfoService, $scope) {
        var login = this;
        login.username = "";
        login.password = "";
        login.isLogin = true;
        
        
        login.clickLogin = function () {
            var data = {};
            data.username = login.username;
            data.plainPassword = login.password;
            
            
            $http.post("base/validateUser", data).success(function (res) {
                console.log(res);
                if (res.result[0] != null && res.result[0].success) {
                    userinfoService.saveUserInfo(res.result[0].username, res.result[0].password, res.result[0].userID);
                    $state.go('app.innerFinancing.index');
                }
                else {
                    login.isLogin = false;
                }
            });
        }
        
        document.onkeyup = function (event) {
            if (event.keyCode == 13) {
                login.clickLogin();
                $scope.$apply();

            }
        }
    }

})();