$.widget("metro.hint",{version:"3.0.0",options:{hintPosition:"auto",hintBackground:"#FFFCC0",hintColor:"#000000",hintMaxSize:200,hintMode:"default",hintShadow:!1,hintBorder:!0,hintTimeout:0,hintTimeDelay:0,_hint:void 0},_create:function(){var t=this,o=(this.element,this.options);this.element.on("mouseenter",function(i){$(".hint, .hint2").remove(),o.hintTimeDelay>0?setTimeout(function(){t.createHint(),o._hint.show()},o.hintTimeDelay):(t.createHint(),o._hint.show()),i.preventDefault()}),this.element.on("mouseleave",function(t){o._hint.length&&o._hint.hide().remove(),t.preventDefault()})},createHint:function(){var t,o=this.element,i=o.data("hint").split("|"),e=this.options;if($.each(o.data(),function(t,o){if(t in e)try{e[t]=$.parseJSON(o)}catch(i){e[t]=o}}),"TD"===o[0].tagName||"TH"===o[0].tagName){var n=$("<div/>").css("display","inline-block").html(o.html());o.html(n),o=n}var s=i.length>1&&i[0],h=i.length>1?i[1]:i[0];t=$("<div/>").appendTo("body"),2===e.hintMode?t.addClass("hint2"):t.addClass("hint"),e.hintBorder||t.addClass("no-border"),s&&$("<div/>").addClass("hint-title").html(s).appendTo(t),$("<div/>").addClass("hint-text").html(h).appendTo(t),t.addClass(e.position),e.hintShadow&&t.addClass("shadow"),e.hintBackground&&(e.hintBackground.isColor()?t.css("background-color",e.hintBackground):t.addClass(e.hintBackground)),e.hintColor&&(e.hintColor.isColor()?t.css("color",e.hintColor):t.addClass(e.hintColor)),e.hintMaxSize>0&&t.css({"max-width":e.hintMaxSize}),"top"===e.hintPosition?(t.addClass("top"),t.css({top:o.offset().top-$(window).scrollTop()-t.outerHeight()-20,left:2===e.hintMode?o.offset().left+o.outerWidth()/2-t.outerWidth()/2-$(window).scrollLeft():o.offset().left-$(window).scrollLeft()})):"right"===e.hintPosition?(t.addClass("right"),t.css({top:2===e.hintMode?o.offset().top+o.outerHeight()/2-t.outerHeight()/2-$(window).scrollTop()-10:o.offset().top-10-$(window).scrollTop(),left:o.offset().left+o.outerWidth()+15-$(window).scrollLeft()})):"left"===e.hintPosition?(t.addClass("left"),t.css({top:2===e.hintMode?o.offset().top+o.outerHeight()/2-t.outerHeight()/2-$(window).scrollTop()-10:o.offset().top-10-$(window).scrollTop(),left:o.offset().left-t.outerWidth()-10-$(window).scrollLeft()})):(t.addClass("bottom"),t.css({top:o.offset().top-$(window).scrollTop()+o.outerHeight(),left:2===e.hintMode?o.offset().left+o.outerWidth()/2-t.outerWidth()/2-$(window).scrollLeft():o.offset().left-$(window).scrollLeft()})),e._hint=t,e.hintTimeout>0&&setTimeout(function(){e._hint.length&&e._hint.hide().remove()},e.hintTimeout)},_destroy:function(){},_setOption:function(t,o){this._super("_setOption",t,o)}});