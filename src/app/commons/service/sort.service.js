(function(){
	'use strict';
	angular.module('services')
		.service('sortService',sortService);
		sortService.$inject = ['uiGridConstants'];
		function sortService(uiGridConstants)
		{
			var service = this;
			var sort = function(a,b,d)
			{
				if(!isNaN(a) &&!isNaN(b) ){
					return a-b;
				}else{
					if (d == 'asc') {
						if (isNaN(a)&&!isNaN(b)) {
							return 1;
						}
						else if(isNaN(b)&&!isNaN(a))
						{
							return -1;
						}
					}
					else if (d == 'desc') {
						if (isNaN(a)&&!isNaN(b)) {
							return -1;
						}
						else if(isNaN(b)&&!isNaN(a))
						{
							return 1;
						}	
					}
					return 0;
				}
			}

			var sortPrice = function(a,b,ra,rb,d){
				return sort(parseFloat(a),parseFloat(b),d);
			};


			var sortCount = function(a,b,ra,rb,d){

				var convertCount = function(count){
					var a =parseFloat(count);
					if (!isNaN(a)) {
						if(count.indexOf("万") > -1)
						{

						}
						else if (count.indexOf("亿") > -1) 
						{
							a = a*10000;
						}
					}

					return a;
				}

				return sort(convertCount(a),convertCount(b),d);
			}

			var sortTerm = function(a,b,ra,rb,d){

				var convertTerm = function(term){
				    if(term.indexOf("-") > -1){
				        term = term.split('-')[0];
                    }
					var a = parseInt(term);
					if (!isNaN(a)) {
						if(term.indexOf("D") > -1)
						{

						}
						else if (term.indexOf("M") > -1) 
						{
							a = a*30;
						}
						else if (term.indexOf("Y") > -1)
						{
							a = a*360;
						}
					}

					return a;
				}
				return sort(convertTerm(a),convertTerm(b),d);
			}

			service.sortPrice = sortPrice;
			service.sortCount = sortCount;
			service.sortTerm = sortTerm;
		}
	}
)();