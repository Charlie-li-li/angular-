(function(){
	'use strict';
	angular.module('services')
		.controller('contactModalController',contactController);

		contactController.$inject = ['$scope', '$uibModalInstance', 'quoteData','qbService'];

		function contactController($scope, $uibModalInstance, quoteData, qbService){
			var vm = this;
			vm.quoteData = quoteData;

			//打开QM
			vm.openQM = function(contact){
				qbService.openQM(contact.qb_id);
			};

			//打开本机构报价
			vm.institutionOffer = function(){
				$uibModalInstance.close({
					id : quoteData.institution_id,
					name : quoteData.institution_name
				});
			};
			

			//取消
			vm.cancel = function(){
				$uibModalInstance.dismiss();
			};

		}

})();