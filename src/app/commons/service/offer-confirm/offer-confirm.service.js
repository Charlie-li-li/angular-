(function(){
	'use strict';

	angular.module('services').
		service('offerConfirm',offerConfirmService);

	offerConfirmService.$inject = ['$uibModal'];

	function offerConfirmService($uibModal){

		var openConfirmModal = function(offerData, resolve){
			var modalInstance = $uibModal.open({
				animation : false,
				templateUrl : 'app/commons/service/offer-confirm/offer-confirm.html',
				size : 'md',
				backdrop : 'static',
				controller : 'offerConfirmController',
				bindToController : true,
				controllerAs : 'vm',
				resolve : {
					load : ['$ocLazyLoad', function($ocLazyLoad){
						return $ocLazyLoad.load([
							'app/commons/service/offer-confirm/offer-confirm.controller.js'
						]);
					}],
					offerData : function(){
						return offerData;
					}
				}
			});

			modalInstance.result.then(function(res){
				if(typeof resolve == 'function'){
					resolve(res);
				}
			},function(cancel){

			});
		};


		this.confirm = openConfirmModal;

	}

})();