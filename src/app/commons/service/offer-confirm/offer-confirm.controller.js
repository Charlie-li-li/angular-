(function(){
	'use strict';
	angular.module('services')
		.controller('offerConfirmController',offerConfirmController);

	//offerConfirmController定义

	offerConfirmController.$inject = ['$uibModalInstance', 'offerData'];

	function offerConfirmController($uibModalInstance, offerData){
		var vm = this;

		vm.offerData = offerData;

		//保存
		vm.save = function(){

			$uibModalInstance.close(true);

		};


		//取消
		vm.cancel = function(){
			$uibModalInstance.dismiss();
		};


	}

})();