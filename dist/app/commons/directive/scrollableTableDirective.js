!function(e){"use strict";e.module("directives").directive("scrollableTableDirective",function(){return{restrict:"A",replace:!0,template:function(e,r){e.removeAttr("scrollable-table-directive");var t=e[0].outerHTML;e.find("tbody").remove();var i=e[0].outerHTML;return'<div><div class="scrollable_table_header">'+i+'</div><div class="scrollable_table_body">'+t+"</div></div>"},compile:function(e){return{pre:function(e,r,t){},post:function(e,r,t){}}}}})}(angular);