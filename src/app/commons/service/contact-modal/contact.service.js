(function(){
	'use strict';
	angular.module('services')
		.service('contactService',contactService);

		contactService.$inject = ['$uibModal'];

		function contactService($uibModal){

			var openContactModal = function(quoteData, resolve){
				var modalInstance = $uibModal.open({
					animation : false,
					templateUrl : 'app/commons/service/contact-modal/contact.modal.html',
					size : 'md contactmodel',
					appendTo : $('[ui-view="table"]'),
					backdrop : 'static',
					controller : 'contactModalController',
					bindToController : true,
					controllerAs : 'vm',
					resolve : {
						load : ['$ocLazyLoad', function($ocLazyLoad){
							return $ocLazyLoad.load([
								'app/commons/service/contact-modal/contact.controller.js'
							]);
						}],
						quoteData : function(){
							return quoteData;
						}
					}
				});

				modalInstance.result.then(function(result){
					if(typeof resolve == 'function'){
						resolve(result);
					}
				},function(cancel){
					
				});

			};

			this.openModal = openContactModal;

		}

})();