(function(){
	'use strict';

	angular.module('services')
		.controller('areaModalController', modalController);

	modalController.$inject = ['$uibModalInstance','allList','selectedList', 'bootbox'];

	function modalController($uibModalInstance, allList, selectedList, bootbox){
		var vm = this;

		var maxCount = 4;	//最多配置数量
		vm.maxCount = maxCount;

		for(var i in selectedList){
			for(var j in allList){
				if(selectedList[i].name == allList[j].province){
					allList[j].selected = true;
					break;
				}
			}
		}

		vm.allList = allList;

		vm.save = function(){
			var selected = vm.allList.filter(function(item){
				return item.selected;
			}).map(function(item){
				return {
					id : item.id,
					name : item.province
				}
			});

			if(selected.length > maxCount){
				bootbox.message("常用地区最多只能选择4个！");
				return;
			}


			if(selected.length==0){
				return ;
			}else{
				$uibModalInstance.close(selected);
			}

		};

		vm.cancel = function(){
			$uibModalInstance.dismiss('cancel');
		};
	}
})();