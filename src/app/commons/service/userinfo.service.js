(function () {
    'use strict';
    angular.module('services')
        .service('userinfoService', userinfoService);
    userinfoService.$inject = ['$state', '$cookies', 'qbService'];
    
    function userinfoService($state, $cookies, qbService) {
        var user = this;
        user.username = "";
        user.password = "";
        
        function getCookiesinfo() {
            user.username = $cookies.get('username');
            user.password = $cookies.get('password');
            user.userid = $cookies.get('userid');
            if (!(user.username && user.password && user.userid)) {
                return false;
            }
            
            return true;
        }
        
        user.logout = function () {
            $cookies.remove('username');
            $cookies.remove('password');
            $cookies.remove('userid');
            
            $state.go('login');
        };
        
        user.saveUserInfo = function (username, password, userid) {
            
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 1);
            
            $cookies.put('username', username, { 'expires': expireDate });
            $cookies.put('password', password, { 'expires': expireDate });
            $cookies.put('userid', userid, { 'expires': expireDate })
            user.username = username;
            user.password = password;
            user.userid = userid;
        }
        
        user.validate = function () {
            var url = location.href;
            if (window.cefQuery) {
                qbService.getUserData(function (res) {
                    res = JSON.parse(res);
                    user.saveUserInfo(res.UserAccount, res.Password, res.UserId);
                    $state.go('app.innerFinancing.index');
                });

            }
            else {
                if (getCookiesinfo()) {
                    $state.go('app.innerFinancing.index');
                }
                else {
                    $state.go('login');
                }
            }
        }
        
        user.getUserId = function () {
            return user.userid;
        }
        
        user.getUserData = function (onSuccess, onFailure) {
            if (user.username && user.password) {
                onSuccess({ "UserAccount": user.username, "Password": user.password });
            }
            else {
                onFailure();
            }
        }
    }

})();