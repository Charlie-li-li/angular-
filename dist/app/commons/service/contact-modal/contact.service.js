!function(){"use strict";function o(o){var t=function(t,n){var c=o.open({animation:!1,templateUrl:"app/commons/service/contact-modal/contact.modal.html",size:"md contactmodel",appendTo:$('[ui-view="table"]'),backdrop:"static",controller:"contactModalController",bindToController:!0,controllerAs:"vm",resolve:{load:["$ocLazyLoad",function(o){return o.load(["app/commons/service/contact-modal/contact.controller.js"])}],quoteData:function(){return t}}});c.result.then(function(o){"function"==typeof n&&n(o)},function(o){})};this.openModal=t}angular.module("services").service("contactService",o),o.$inject=["$uibModal"]}();