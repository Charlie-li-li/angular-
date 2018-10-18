(function(){
	'use strict';
	angular.module('directives').directive('iCheck',['$timeout', function($timeout){
		return {
	        require: 'ngModel',
	        link: function($scope, element, $attrs, ngModel) {
	            // return $timeout(function() {
	                var value;
	                value = $attrs['value'];

	                $scope.$watch($attrs['ngModel'], function(newValue){
	                    $(element).iCheck('update');
	                })

	                return $(element).iCheck({
	                    checkboxClass: 'icheckbox_minimal-aero',
	                    radioClass: 'iradio_minimal-aero'

	                }).on('ifChanged', function(event) {
	                    if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
	                        $scope.$apply(function() {
	                            return ngModel.$setViewValue(event.target.checked);
	                        });
	                    }
	                    if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
	                        return $scope.$apply(function() {
	                            return ngModel.$setViewValue(value);
	                        });
	                    }
	                });
	            // });
	        }
	    };
	}]);

})();