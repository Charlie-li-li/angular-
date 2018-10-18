(function (angular) {
    'use strict';
    
    angular.module('services').controller('allianceOfferManageController', [

        '$scope', '$uibModal', '$uibModalInstance', '$http', '$timeout',
        'commonService', 'bootbox', 'offerService', 'tabNavigatorService', 'appConfig',
        'enumConfig', 'offerConfirm', 'quoteQuery', 'allianceQuery',

        function ($scope, $uibModal, $uibModalInstance, $http, $timeout,
                  commonService, bootbox, offerService, tabNavigatorService, appConfig,
                  enumConfig, offerConfirm, quoteQuery, allianceQuery) {
            
            var dataDefine = {
                quoteMethodDefine: [
                    { "displayName": "普通报价", "value": 'SEF' },
                    { "displayName": "联盟报价", "value": 'ALC' },
                    { "displayName": "代报价", "value": 'BRK' }
                ],
                
                //业务类型初始化
                typeListDefine: [
                    { "displayName": "同存", "value": 'IBD', "direction": 'IN' },
                    { "displayName": "保本", "value": 'GTF', "direction": 'OUT' },
                    { "displayName": "非保本R2", "value": 'UR2', "direction": 'OUT' },
                    { "displayName": "非保本R3", "value": 'UR3', "direction": 'OUT' }
                ],
                
                dto: {
                    saveQuote: {
                        id: "id",
                        quoteType: "type.value",
                        direction: "boardDir.value",
                        methodType: "methodType.value",
                        memo: "remark",
                        institutionId: "institutionInfo.institutionId",
                        sequence: "seqNo",
                        active: "active"

                    },
                    saveQuoteQuoteDetailsVO: {
                        limitType: "type",
                        price: "period"
                    },
                    saveQuoteSpQuoteDetailsVO: {
                        dayHigh: "daysHighValue",
                        dayLow: "daysLowValue",
                        price: "period"
                    }
                }
            };
            
            var vm = this;
            
            var loadedFromExcel = false;
            
            function boardFactory(type, institutionInfo) {
                return angular.copy({
                    seqNo: undefined,
                    type: type,
                    methodType: vm.quoteMethod,
                    
                    institutionInfo: institutionInfo,
                    boardDir: offerService.dataDefine.boardDirection.findItem(function (e) {
                        return e.value === type.direction;
                    }),
                    periodList: vm.periodList,
                    remark: "",
                    
                    active: offerService.dataDefine.activeDefine.true
                });
            };
            
            function periodSorter(p1, p2) {
                if (p1.type && p2.type) return p1.id - p2.id;
                
                if (p1.type && !p2.type) return -1;
                if (!p1.type && p2.type) return 1;
                
                return p1.daysLowValue - p2.daysLowValue;
            };
            
            function setTabIndex() {
                if (!vm.boardList) return;
                
                vm.boardList.findWhere(function (e) {
                    return e.active !== 0 && e.type.value === vm.selectType.value;
                }).forEach(function (item, index) {
                    if (!item.periodList || item.periodList.length <= 0 || !(item.periodList instanceof Array)) return;
                    
                    item.periodList.forEach(function (item1, index1) {
                        item1.tabIndex = index * (vm.periodList.length + 2) + 1 + index1;
                    });
                });
            };
            
            function loadViewModel(data) {
                
                data.forEach(function (item, index) {
                    var board = offerService.boardFactory(item, vm.periodList, allianceQuery);
                    
                    board.seqNo = item.sequence;
                    
                    board.methodType = vm.quoteMethod;
                    
                    board.type = dataDefine.typeListDefine.findItem(function (e) {
                        return e.value === item.quoteType;
                    });
                    
                    // 同步以上行中的报价列
                    vm.boardList.forEach(function (item1, index1) {
                        if (item1.periodList && item1.periodList.length < board.periodList.length) {
                            item1.periodList.push.apply(item1.periodList, angular.copy(vm.periodList).slice(item1.periodList.length - board.periodList.length));
                        }
                    });
                    
                    if (board.type) vm.boardList.push(board);
                });
                
                vm.boardList.sort(function (e1, e2) {
                    return e1.displayOrder - e2.displayOrder;
                });
                
                vm.periodList.sort(periodSorter);
                
                vm.boardList.forEach(function (item, index) {
                    item.periodList.sort(periodSorter);
                });
                
                setTabIndex();
            };
            
            // 发送报价单
            function sendBoardList(data) {
                $http.post(appConfig.post_board, { offer_data: data }).then(function (res) {
                    if (res && res.data && res.data.return_code === 0) {
                        $uibModalInstance.close(data);
                    } else {
                        console.log("sendBoardList error", res);
                    }
                }, function (res) {
                    if (res && res.data && res.data.return_code === 0) {
                        $uibModalInstance.close(data);
                    } else {
                        console.log("sendBoardList error", res);
                    }
                });
            };
            
            function sendAllianceBoardList(data) {
                var url = loadedFromExcel ? appConfig.post_saveExcel : appConfig.post_alliance_board;
                
                $http.post(url, { offer_data: data }).then(function (res) {
                    if (res && res.data && res.data.return_code === 0) {
                        $uibModalInstance.close(data);
                    } else {
                        console.log("sendAllianceBoardList error", res);
                    }
                }, function (res) {
                    if (res && res.data && res.data.return_code === 0) {
                        $uibModalInstance.close(data);
                    } else {
                        console.log("sendAllianceBoardList error", res);
                    }
                });
            };
            
            // 添加报价
            function addQuote() {
                
                var addingBoard = boardFactory(vm.selectType);
                
                var seqNoTemp = 0;
                
                vm.boardList.forEach(function (item, index) {
                    delete item.isQuoted;
                    
                    if (item.seqNo > seqNoTemp) seqNoTemp = item.seqNo;
                });
                
                addingBoard.seqNo = seqNoTemp + 1;
                
                vm.boardList.push(addingBoard);
                
                setTabIndex();
            };
            
            // 添加联盟报价
            function allianceAddQuote() {
                
                if (enumConfig && enumConfig.quoteMethod) {
                    if (enumConfig.quoteMethod[0] === dataDefine.quoteMethodDefine[1].value ||
                        enumConfig.quoteMethod[0] === dataDefine.quoteMethodDefine[2].value) {
                        
                        var modalInstance = $uibModal.open({
                            animation: false,
                            templateUrl: 'app/commons/service/offer-management/allianceAddQuote.html',
                            size: 'sm',
                            backdrop: 'static',
                            controller: 'allianceAddQuoteController',
                            bindToController: true,
                            resolve: {
                                load: ['$ocLazyLoad', function ($ocLazyLoad) {
                                        return $ocLazyLoad.load([]);
                                    }],
                                
                                // 获取联盟机构任务
                                getAlliance: [function () {
                                        return allianceQuery;
                                    }],
                                addedBoard: [
                                    function () {
                                        return vm.boardList
                                            .findWhere(function (e) {
                                            return e && e.active !== 0;
                                        })
                                            .map(function (e) {
                                            return e.institutionInfo;
                                        });
                                    }
                                ],
                                
                                getBrotherAlliance: [function () {
                                        return undefined;
                                    }]
                            }
                        });
                        
                        modalInstance.result.then(function (data) {
                            // 添加联盟报价 
                            if (!data) return;
                            
                            var addingBoard = data.map(function (e) {
                                return boardFactory(vm.selectType, e);
                            }).sort(function (e1, e2) {
                                return e1.institutionInfo.displayOrder - e2.institutionInfo.displayOrder;
                            });
                            
                            addingBoard.forEach(function (item, index) {
                                var lastIndex = vm.boardList.lastIndexOfItem(function (e) {
                                    return e.institutionInfo.displayOrder === item.institutionInfo.displayOrder;
                                });
                                
                                if (lastIndex >= vm.boardList.length - 1 || lastIndex === undefined) vm.boardList.push(item);
                                else vm.boardList.splice(lastIndex + 1, 0, item);
                            });
                            
                            var seqNoTemp = 0;
                            var idTemp = undefined;
                            
                            vm.boardList.forEach(function (item, index) {
                                delete item.isQuoted;
                                
                                if (!item.institutionInfo || item.institutionInfo.displayOrder === -1) return;
                                
                                if (!idTemp) {
                                    if (!item.seqNo) item.seqNo = ++seqNoTemp;
                                    else seqNoTemp = item.seqNo;
                                    
                                    idTemp = item.institutionInfo.institutionId;
                                } else if (idTemp === item.institutionInfo.institutionId) {
                                    if (!item.seqNo) item.seqNo = ++seqNoTemp;
                                    else seqNoTemp = item.seqNo;
                                } else {
                                    if (!item.seqNo) {
                                        seqNoTemp = 0;
                                        item.seqNo = ++seqNoTemp;
                                    } else seqNoTemp = item.seqNo;
                                    
                                    idTemp = item.institutionInfo.institutionId;
                                }
                            });
                            
                            setTabIndex();
                        }, function (reason) {

                        });
                        
                        return;
                    }
                }
                
                vm.boardList.push(boardFactory(vm.selectType, item));
            };
            
            vm.boardListFilter = function (item, index, list) {
                return vm.selectType.value === item.type.value && item.active !== offerService.dataDefine.activeDefine.false;
            };
            
            vm.initTableHeader = function () {
                console.log("initTableHeader");
            };
            
            // 选择报价方向
            vm.onClickBoardDirection = function (event, board) {
                console.log("onClickBoardDirection");
                
                if (!event || !event.target) return;
                if (event.target.nodeName === "BUTTON") {
                    var index = vm.boardDirectionList.indexOfItem(function (item) {
                        return item.value === board.boardDir.value && item.displayName === board.boardDir.displayName;
                    });
                    board.boardDir = vm.boardDirectionList[(index + 1) % vm.boardDirectionList.length];
                }
            };
            
            vm.onClickQuoteType = function (event) {
                if (!event || !event.target) return;
                
                if (event.target.nodeName === "A") {
                    var scope = angular.element(event.target).scope();
                    
                    if (scope) vm.selectType = scope.item;
                }
                setTabIndex();
            };
            
            vm.onKeydownTable = function (event) {
                if (!event || !event.target) return;
                
                if (event.target.nodeName !== "BUTTON" || event.target.className.indexOf("badge") < 0) return;
                
                if (event.keyCode === 9) {
                    event.cancelBubble = true;
                    tabNavigatorService.findNextTd(event, function (nextElem) {
                        var ctrl = angular.element(nextElem).controller('editable');
                        
                        if (!ctrl) {
                            $scope.$emit("onTabNavigating", nextElem);
                            return;
                        }
                        
                        ctrl.isEditing = true;
                        $timeout(function () {
                            $(nextElem).addClass('is-editing');
                            $(nextElem).find('input').focus();
                        });
                        ctrl.textChanged();
                    });
                }
            };
            
            //删除业务表格
            vm.onClickDeleteRow = function (board) {
                // vm.boardList[index].active = offerService.dataDefine.activeDefine.false;
                
                if (!board) return;
                
                var targetIndex = vm.boardList.indexOfItem(function (e) {
                    if (board.id) {
                        return e.id === board.id;
                    } else {
                        if (!e.institutionInfo || !board.institutionInfo) return false;
                        return e.seqNo === board.seqNo && e.institutionInfo.institutionId === board.institutionInfo.institutionId;
                    }
                });
                
                if (targetIndex >= 0) {
                    if (vm.boardList[targetIndex].id) {
                        vm.boardList[targetIndex].active = offerService.dataDefine.activeDefine.false;
                    } else {
                        vm.boardList.splice(targetIndex, 1);
                    }
                }
                setTabIndex();
            };
            
            // 从Excel导入
            vm.onClickUploadExcel = function (files) {
                // debugger; readAsBinaryString
                
                if (!files || files.length <= 0) return;
                
                var file = files[0];
                
                if (!file.name.endWith(".xls") && !file.name.endWith(".xlsx")) {
                    bootbox.message("请选择Excel文件（*.xls 或 *.xlsx）");
                    return;
                }
                
                var reader = new FileReader();
                reader.onload = function (e) {
                    // var rawData = { data: base64.encode(reader.result), fileName: file.name };
                    var rawData = { data: reader.result, fileName: file.name };
                    
                    $http.post(appConfig.post_uploadExcel, rawData).then(function (res) {
                        
                        if (res && res.data.result && res.data.result.length > 0) {
                            
                            if (res.data.result[0].error && res.data.result[0].error.length > 0) {
                                
                                var message = "导入发生错误。在Excel中</br>";
                                
                                var args = "";
                                var subMessage = undefined;
                                
                                res.data.result[0].error.findWhere(function (e) { return e.validationErrorType === "DATA_MISSING"; })
                                    .forEach(function (item, index) {
                                    //message += "第 {0} 行, {1}</br>".format(item.sourceField, item.detailMsg);
                                    args += "{0}, ".format(item.sourceField);
                                    subMessage = item.detailMsg;
                                });
                                
                                if (args !== "") {
                                    args = args.substring(0, args.lastIndexOf(", "));
                                    message += "<div>第 {0} 处, {1}。</br></div>".format(args, subMessage);
                                }

                                args = "";                                

                                res.data.result[0].error.findWhere(function (e) { return e.validationErrorType !== "DATA_MISSING"; })
                                    .forEach(function (item, index) {
                                    //message += "第 {0} 行, {1}</br>".format(item.sourceField, item.detailMsg);
                                    args += "{0}, ".format(item.sourceField);
                                    subMessage = item.detailMsg;
                                });
                                
                                if (args !== "") {
                                    args = args.substring(0, args.lastIndexOf(", "));
                                    message += "<div>第 {0} 行, {1}。</div>".format(args, subMessage);
                                }

                                if (res.data.result[0].error.findWhere(function (e) { return e.validationErrorType === "DATA_MISSING"; }).length > 0) {
                                    message += "</br>注： {4,3} 代表第4行第3列。</br>";
                                }

                                bootbox.messageHtml(undefined, message);
                            }
                            
                            // bootbox.message("导入Excel成功：" + res.data.return_message);
                            
                            //res.data.result[0].fileContent.forEach(function (item, index) {
                            //    item.quoteType = vm.selectType.value;
                            //});
                            
                            // sendAllianceBoardList(res.data.result[0].fileContent);
                            vm.periodList = angular.copy(offerService.dataDefine.periodDefine);
                            vm.boardList = [];
                            
                            loadedFromExcel = true;
                            
                            loadViewModel(res.data.result[0].fileContent);
                            return;
                        }
                        
                        // bootbox.message("导入Excel错误。");
                        
                        bootbox.message("导入发生错误， 请修改一下再试试吧！");
                        
                        return;
                    }, function (res) {
                        if (res && res.status === -1) {
                            if (res.data && res.data.return_message) {
                                bootbox.message("导入Excel错误：" + res.data.return_message);
                                return;
                            }
                            
                            bootbox.message("导入Excel错误。");
                            return;
                        }

                    });
                }
                
                reader.readAsDataURL(file);
                setTabIndex();
            };
            
            // 取消
            vm.cancel = function () {
                $uibModalInstance.dismiss();
            };
            
            // 保存报价单
            vm.onClickSaveQuote = function () {
                
                if (!vm.boardList || vm.boardList.length <= 0) {
                    $uibModalInstance.close();
                    return;
                }
                
                // offerConfirm.confirm(undefined, function () {
                var data = vm.boardList.findWhere(function (e) {
                    return e.id || e.active !== offerService.dataDefine.activeDefine.false;
                }).map(function (e) {
                    var dto = commonService.getDto(e, dataDefine.dto.saveQuote);
                    
                    dto.source = "QB";
                    
                    dto.quoteDetailsDtos = e.periodList.map(function (e1) {
                        
                        e1.period = parseFloat(e1.period);
                        
                        var dto1 = undefined;
                        
                        if (e1.id) {
                            dto1 = commonService.getDto(e1, dataDefine.dto.saveQuoteQuoteDetailsVO);
                        } else {
                            if (!e1.isRange) {
                                e1.daysHighValue = e1.daysLowValue;
                            }
                            
                            dto1 = commonService.getDto(e1, dataDefine.dto.saveQuoteSpQuoteDetailsVO);
                        }
                        
                        if (e.active === offerService.dataDefine.activeDefine.false) {
                            dto1.active = e.active;
                        }
                        
                        return dto1;
                    });
                    
                    return dto;
                });
                
                if (vm.isAllianceBoardable()) {
                    sendAllianceBoardList(data);
                } else {
                    sendBoardList(data);
                }
                // });
            };
            
            // Add by Wei Lai on 2016/06/707
            $scope.$on("onTabNavigating", function (event, element) {
                console.log("onTabNavigating event handled.");
                
                if (!element || element.length <= 0) return;

                // $(element).find('input').click();
                // $(element).focus();
                // tabNavigatorService;
            });
            
            //添加期限
            vm.onClickAddPeriod = function () {
                var modalInstance = $uibModal.open({
                    animation: false,
                    templateUrl: 'app/commons/service/offer-management/allianceAddSpPeriod.html',
                    size: '350px',
                    backdrop: 'static',
                    controller: 'allianceAddSpPeriodController',
                    bindToController: true,
                    resolve: {
                        load: ['$ocLazyLoad', function ($ocLazyLoad) {
                                return $ocLazyLoad.load([]);
                            }]
                    }
                });
                
                modalInstance.result.then(function (data) {
                    if (!data) return;
                    
                    if (vm.periodList.indexOfItem(function (e) {
                        
                        return offerService.isSameSpPeriod(e, data);
                    }) >= 0) {
                        // 既存期限不再添加
                        return;
                    }
                    
                    var spPeriod = angular.copy(data);
                    
                    offerService.setSpPeriodHeader(spPeriod);
                    
                    vm.periodList.push(spPeriod);
                    
                    vm.periodList.sort(periodSorter);
                    
                    vm.boardList.forEach(function (item, index) {
                        item.periodList.push(angular.copy(spPeriod));
                        item.periodList.sort(periodSorter);
                    });
                    
                    setTabIndex();

                }, function (reason) {

                });
            };
            
            vm.onClickDeletePeriod = function (period) {
                
                vm.periodList = vm.periodList.findWhere(function (e) {
                    if (e.id) return true;
                    return e.daysLowValue !== period.daysLowValue;
                });
                vm.boardList.forEach(function (item) {
                    item.periodList = item.periodList.findWhere(function (e) {
                        if (e.id) return true;
                        return e.daysLowValue !== period.daysLowValue;
                    });
                });
                setTabIndex();
            };
            
            vm.isAllianceBoardable = function () {
                if (enumConfig && enumConfig.quoteMethod) {
                    if (enumConfig.quoteMethod[0] === dataDefine.quoteMethodDefine[1].value ||
                        enumConfig.quoteMethod[0] === dataDefine.quoteMethodDefine[2].value) {
                        
                        return true;
                    } else {
                        return false;
                    }
                }
                
                return false;
            };
            
            vm.onClickAddQuote = function () {
                if (vm.isAllianceBoardable()) {
                    return allianceAddQuote;
                }
                
                return addQuote;
            }();
            
            //vm.onClickSaveQuote = function () {
            //    if (vm.isAllianceBoardable()) {
            //        return allianceSaveQuote;
            //    }
            
            //    return saveQuote;    
            //}();
            
            // 初始化视图
            var initView = function () {
                
                vm.periodList = angular.copy(offerService.dataDefine.periodDefine);
                
                vm.boardDirectionList = offerService.dataDefine.boardDirection;
                
                vm.typeList = dataDefine.typeListDefine;
                
                if (enumConfig && enumConfig.quoteMethod) {
                    var result = dataDefine.quoteMethodDefine.findItem(function (e) {
                        return e.value === enumConfig.quoteMethod[0];
                    });
                    
                    vm.quoteMethod = result ? result : dataDefine.quoteMethodDefine[0];
                } else {
                    vm.quoteMethod = dataDefine.quoteMethodDefine[0];
                }
                
                // 默认选择  { "name": "同存", "enum": 'IBD', "direction": 'IN' },
                vm.selectType = vm.typeList[0];
                
                vm.boardList = [];
                
                if (quoteQuery && quoteQuery.result && quoteQuery.result[0] && quoteQuery.result[0].offer_data && quoteQuery.result[0].offer_data.length > 0) {
                    
                    loadViewModel(quoteQuery.result[0].offer_data);
                }
                setTabIndex();
                
                loadedFromExcel = false;
            }();

        }
    ]);
    
    // allianceAddSpPeriodController
    angular.module('services').controller('allianceAddSpPeriodController',

        ['$scope', '$uibModalInstance', '$http', 'appConfig',
        function ($scope, $uibModalInstance, $http, appConfig) {
            
            var dataDefine = {
                rangeFlagEnum: [
                    { displayName: '非区间期限', value: false },
                    { displayName: '区间期限', value: true }
                ],
                daysUnitEnum: [
                    { displayName: '日', value: 'd' },
                    { displayName: '月', value: 'M' },
                    { displayName: '年', value: 'y' }
                ]
            };
            
            //取消
            $scope.onClickCancel = function () {
                $uibModalInstance.dismiss();
            };
            
            $scope.onClickOk = function () {
                var vaildPassed = true;
                
                if (!$scope.vm.daysLow) {
                    $scope.vaildDaysLow = true;
                    vaildPassed = false;
                }
                
                if (!$scope.vm.daysHigh && $scope.vm.isRange) {
                    $scope.vaildDaysHigh = true;
                    vaildPassed = false;
                }
                
                if (getDaysValye(+$scope.vm.daysHigh, $scope.vm.daysHighUnit) <= getDaysValye(+$scope.vm.daysLow, $scope.vm.daysLowUnit)) {
                    $scope.vaildDaysLow = true;
                    $scope.vaildDaysHigh = true;
                    vaildPassed = false;
                }
                if (+$scope.vm.daysLow === 0) {
                    $scope.vaildDaysLow = true;
                    vaildPassed = false;
                }
                
                if (vaildPassed) {
                    $scope.vm.daysLow = +$scope.vm.daysLow;
                    $uibModalInstance.close($scope.vm);
                }
            };
            
            $scope.onChangeRange = function () {
                
                $scope.vm.daysLow = undefined;
                $scope.vm.daysHigh = undefined;
                $scope.vaildDaysLow = false;
                $scope.vaildDaysHigh = false;

            }
            
            $scope.onClickDaysUnit = function () {
            };
            
            function getDaysValye(days, daysUnit) {
                if (!daysUnit) return days;
                
                switch (daysUnit) {
                    case 'd':
                        return days;
                    case 'M':
                        return days * 30;
                    case 'y':
                        return days * 30 * 12;
                    default:
                        return days;
                }
            }
            
            var initView = function () {
                $scope.rangeFlagEnum = dataDefine.rangeFlagEnum;
                $scope.daysUnitEnum = dataDefine.daysUnitEnum;
                
                $scope.vm = {
                    daysLowUnit: undefined,
                    daysHighUnit: undefined
                };
                
                $scope.vm.daysHighUnit = dataDefine.daysUnitEnum[0].value;
                $scope.vm.daysLowUnit = dataDefine.daysUnitEnum[0].value;
                
                $scope.vm.__defineGetter__('daysHighValue', function () {
                    return getDaysValye(this.daysHigh, this.daysHighUnit);
                });
                
                $scope.vm.__defineGetter__('daysLowValue', function () {
                    return getDaysValye(this.daysLow, this.daysLowUnit);
                });
                
                $scope.vm.isRange = false;
            }();
        }
    ]);
    
    // allianceAddQuoteController
    angular.module('services').controller('allianceAddQuoteController',

        ['$scope', '$uibModalInstance', '$http', 'appConfig', 'getAlliance', 'getBrotherAlliance', 'addedBoard',
        function ($scope, $uibModalInstance, $http, appConfig, getAlliance, getBrotherAlliance, addedBoard) {
            $scope.selectedCount = 0;
            
            $scope.onClickAlliance = function () {
                if (!$scope.vm || !$scope.vm.allianceList) {
                    $scope.selectedCount = 0;
                    return;
                }
                
                $scope.selectedCount = $scope.vm.allianceList.findWhere(function (e) {
                    return e.isSelected;
                }).length;
            };
            
            //取消
            $scope.cancel = function () {
                if ($scope.vm.allianceList && $scope.vm.allianceList.length > 0) {
                    
                    $scope.vm.allianceList.forEach(function (item, index) {
                        delete item.isSelected;
                        
                        if (addedBoard.findItem(function (e) {
                            return e.institutionId === item.institutionId;
                        })) {
                            item.isQuoted = true;
                        }
                    });
                }
                
                $uibModalInstance.dismiss();
            };
            
            // 确定
            $scope.addQuote = function () {
                var selectItems = $scope.vm.allianceList.findWhere(function (e) {
                    return e.isSelected;
                });
                $uibModalInstance.close(selectItems);
            };
            
            var initView = function () {
                $scope.vm = {};
                
                //已选择业务类型初始化
                if (getAlliance && getAlliance.result && getAlliance.result.length > 0) {
                    $scope.vm.allianceList = getAlliance.result[0].alliance;
                    
                    $scope.vm.allianceList.forEach(function (item, index) {
                        delete item.isSelected;
                        
                        if (addedBoard && addedBoard.length > 0 && $scope.vm.allianceList.length > 0) {
                            if (addedBoard.findItem(function (e) {
                                return e.institutionId === item.institutionId;
                            })) {
                                item.isQuoted = true;
                            } else {
                                delete item.isQuoted;
                            }
                        } else {
                            delete item.isQuoted;
                        }
                    });
                }
                ;
                
                if (getBrotherAlliance && getBrotherAlliance.result && getBrotherAlliance.result > 0) {
                    $scope.vm.brotherAllianceList = getBrotherAlliance.result[0];
                }
            }();
        }
    ]);


})(angular);