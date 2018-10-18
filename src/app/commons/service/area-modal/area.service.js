(function(){
	'use strict';

	angular.module('services').service('areaService', areaService);

	areaService.$inject = ['$uibModal'];

	function areaService($uibModal){

		var openModal = function(selectedList, resolve){
				var modalInstance = $uibModal.open({
				animation : false,
				templateUrl : 'app/commons/service/area-modal/area.modal.html',
				size : 'md',
				bindToController : true,
				backdrop : 'static',
				controller : 'areaModalController',
				controllerAs : 'vm',
				resolve : {
					load : ['$ocLazyLoad', function($ocLazyLoad){
						return $ocLazyLoad.load([
							'app/commons/service/area-modal/area.controller.js'
						]);
					}],
					selectedList : function(){
						return selectedList;
					},
					allList : ['$http', 'appConfig' ,function($http, appConfig){
						return $http.post('base/areaList').then(function(res){
							return res.data.result;
						});
					}]
				}
			});

			modalInstance.result.then(function(res){
				if(typeof resolve == 'function'){
					resolve(res);
				}
			});
		};

		this.openModal = openModal;

	}

})();