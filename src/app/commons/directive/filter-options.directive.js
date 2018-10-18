(function(){
	'use strict';

	angular.module('directives').directive('filterOptions',function(){

			function filterOptionsController($scope){
				var vm = this;

				$scope.$watch('vm.selected',function(newValue,oldValue){
					if(!angular.equals(newValue, oldValue)){
						vm.ngChange();
					}
				});


				vm.clickOption = function(option, event){

					var ctrlKey = event.ctrlKey;

					var multiple = vm.multiple!=undefined;
					var isAllProperty = 'isAll';
					var isAll = option[isAllProperty];

					var resetAllOptions = function(){
						vm.optionList.forEach(function(item){
							item.selected = false;
						});
					}

					var resetAllButton = function(){
						vm.optionList.forEach(function(item){
							if(item[isAllProperty])item.selected = false;
						});
					}

					if(multiple && ctrlKey){
						if(isAll)
							resetAllOptions();
						else{
							resetAllButton();
						}
					}else{
						resetAllOptions();
					}
					option.selected = !option.selected;

					vm.selected = [];
					vm.optionList.forEach(function(item){
						if(item.selected){
							vm.selected.push(item);
						}
					});

				};

			}

			filterOptionsController.$inject = ['$scope'];


			return {
				restrict : 'C',
				scope : {
					optionList : '=',
					selected : '=ngModel',
					ngChange : '&',
					multiple : '@?'
				},
				template : '<span class="option" ng-repeat="option in vm.optionList" ng-class="{\'selected\':option.selected}"\
				 ng-click="vm.clickOption(option,$event)">{{option.name}}</span>',
				bindToController : true,
				controllerAs : 'vm',
				controller : filterOptionsController
			}
		});
})();