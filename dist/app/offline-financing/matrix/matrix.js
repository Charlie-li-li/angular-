!function(){"use strict";function e(e,t,n,i,r){var a=this;a.rowsData=[];var o=function(){function e(){a.isLoading=!0,console.log(new Date+"offline"),n.getMatrixData({direction:t.filter.direction,trust_type:t.filter.trust_type,province:t.filter.province}).success(function(e){a.tableHeaders=e.result[0][0].map(function(e){return e.period.replace("T","")}),a.rowsNames=e.result[0].map(function(e){return i.matrixRowName[e[0].type]}),a.rowsData=e.result[0],t.originMatrix=a.rowsData,a.isLoading=!1})}angular.isDefined(t.stopInnerInterval)&&r.cancel(t.stopInnerInterval),angular.isDefined(t.stopOfflineInterval)&&r.cancel(t.stopOfflineInterval),e(),t.stopOfflineInterval=r(e,6e4)};a.onSelected=function(n){t.setMatrix(a.rowsData),e.$emit("matrixChanged",{matrixCellType:n,target:"offline"})},e.$on("refreshMatrix",function(n,i){o(),t.setMatrix([]),e.$emit("matrixChanged","offline")})}function t(e,t){var n=function(t){return e.post("offline/matrix_price",t)};this.getMatrixData=n}angular.module("moneyMarketApp").controller("offlineMatrixController",e).service("offlineMatrixService",t),e.$inject=["$scope","tableService","offlineMatrixService","enumConfig","$interval"],t.$inject=["$http","appConfig"]}();