(function(){
  'use strict';
  angular.module('directives')
    .directive('dragable', ['$document', function($document) {
    return {
      link: function(scope, element, attr) {

        var element = $(element).parent();

        var startX = 0, startY = 0, x = 0, y = 0;

        element.css({
         position: 'relative'
        });

        element.on('mousedown', function(event) {
          // Prevent default dragging of selected content

          var target = event.target;

          if(!angular.element(target).hasClass("modal-header")) return;

          event.preventDefault();
          startX = event.pageX - x;
          startY = event.pageY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
          var pageX = event.pageX;
          var pageY = event.pageY;

          y = pageY - startY;
          x = pageX - startX;
          element.css({
            top: y + 'px',
            left:  x + 'px'
          });
        }

        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }
      }
    };
  }]);
  
})();